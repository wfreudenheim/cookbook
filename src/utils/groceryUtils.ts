import type { Recipe } from '../types/recipe';
import type { StoreSection, GroceryItem, OrganizedGroceryList } from '../types/grocery';
import { sectionKeywords } from '../types/grocery';

// Determine which store section an ingredient belongs to
function getIngredientSection(ingredientName: string): StoreSection {
  const nameLower = ingredientName.toLowerCase();
  
  // First, check for exact matches
  for (const [section, keywords] of Object.entries(sectionKeywords)) {
    if (keywords.includes(nameLower)) {
      return section as StoreSection;
    }
  }

  // Then check for partial matches
  for (const [section, keywords] of Object.entries(sectionKeywords)) {
    // Check if any keyword is found within the ingredient name
    if (keywords.some(keyword => nameLower.includes(keyword))) {
      return section as StoreSection;
    }

    // Check if ingredient name is found within any keyword
    if (keywords.some(keyword => keyword.includes(nameLower))) {
      return section as StoreSection;
    }
  }
  
  return 'Other';
}

// Try to combine similar ingredients
function combineIngredients(ingredients: GroceryItem[]): GroceryItem[] {
  const combined: { [key: string]: GroceryItem } = {};

  ingredients.forEach(ingredient => {
    // Create a normalized key for comparison
    const normalizedName = ingredient.name.toLowerCase().trim();
    const key = `${normalizedName}-${ingredient.unit}`;
    
    if (combined[key]) {
      // Try to combine amounts if they have the same unit
      const amount1 = parseFloat(combined[key].amount);
      const amount2 = parseFloat(ingredient.amount);
      
      if (!isNaN(amount1) && !isNaN(amount2)) {
        combined[key].amount = (amount1 + amount2).toString();
        combined[key].fromRecipes = [...new Set([...combined[key].fromRecipes, ...ingredient.fromRecipes])];
        
        // Combine notes if they're different
        if (ingredient.notes && ingredient.notes !== combined[key].notes) {
          combined[key].notes = combined[key].notes 
            ? `${combined[key].notes}; ${ingredient.notes}`
            : ingredient.notes;
        }
      } else {
        // If amounts can't be combined numerically, keep them separate with a unique key
        const uniqueKey = `${key}-${Date.now()}`;
        combined[uniqueKey] = { ...ingredient };
      }
    } else {
      combined[key] = { ...ingredient };
    }
  });

  return Object.values(combined);
}

// Smart organization using Claude
export async function organizeGroceryList(organizedList: OrganizedGroceryList): Promise<OrganizedGroceryList> {
  try {
    // First test with GET
    console.log('Testing GET endpoint...');
    const getResponse = await fetch('http://localhost:3000/api/test');
    console.log('GET response:', await getResponse.text());

    // Then test with POST
    console.log('Testing POST endpoint...');
    const testResponse = await fetch('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' })
    });
    console.log('POST response:', await testResponse.text());

    // If we get here, the server is working, so try the actual endpoint
    console.log('Sending grocery list to organize:', organizedList);
    const response = await fetch('http://localhost:3000/api/organize-grocery-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(organizedList)
    });

    console.log('Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Failed to organize grocery list');
    }

    const data = await response.json();
    console.log('Received organized list:', data);
    return data;
  } catch (error) {
    console.error('Error organizing grocery list:', error);
    return organizedList; // Return original list if organization fails
  }
}

// Main function to generate organized grocery list
export function generateGroceryList(recipes: Recipe[]): OrganizedGroceryList {
  // First, collect all ingredients with their recipe sources
  const allIngredients: GroceryItem[] = recipes.flatMap(recipe => 
    recipe.ingredients.map(ing => ({
      name: ing.name.trim(),
      amount: ing.amount?.trim() || '',
      unit: ing.unit?.trim() || '',
      notes: ing.notes?.trim(),
      fromRecipes: [recipe.title],
      checked: false
    }))
  );

  // Group ingredients by section
  const groupedBySection = allIngredients.reduce((acc, ingredient) => {
    const section = getIngredientSection(ingredient.name);
    if (!acc[section]) acc[section] = [];
    acc[section].push(ingredient);
    return acc;
  }, {} as OrganizedGroceryList);

  // Combine similar ingredients within each section
  const organizedList: OrganizedGroceryList = {};
  for (const [section, ingredients] of Object.entries(groupedBySection)) {
    organizedList[section] = combineIngredients(ingredients);
  }

  // Sort sections in preferred order
  const orderedList: OrganizedGroceryList = {};
  const sectionOrder: StoreSection[] = [
    'Produce',
    'Meat & Seafood',
    'Dairy & Eggs',
    'Grains & Pasta',
    'Condiments & Sauces',
    'Pantry',
    'Spices & Seasonings',
    'Other'
  ];

  sectionOrder.forEach(section => {
    if (organizedList[section]?.length > 0) {
      // Sort ingredients alphabetically within each section
      orderedList[section] = organizedList[section].sort((a, b) => 
        a.name.localeCompare(b.name)
      );
    }
  });

  return orderedList;
} 