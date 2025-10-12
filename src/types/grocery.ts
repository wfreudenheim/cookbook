export type StoreSection = 
  | 'Produce'
  | 'Meat & Seafood'
  | 'Dairy & Eggs'
  | 'Pantry'
  | 'Condiments & Sauces'
  | 'Grains & Pasta'
  | 'Spices & Seasonings'
  | 'Other';

export interface GroceryItem {
  name: string;
  amount: string;
  unit: string;
  notes?: string;
  fromRecipes: string[]; // Recipe titles
  checked: boolean;
}

export interface OrganizedGroceryList {
  [section: string]: GroceryItem[];
}

// Common ingredients that belong in each section
export const sectionKeywords: Record<StoreSection, string[]> = {
  'Produce': [
    'onion', 'garlic', 'ginger', 'carrot', 'celery', 'lettuce', 'tomato', 'potato',
    'herb', 'scallion', 'green onion', 'pepper', 'chili', 'mushroom', 'vegetable',
    'cabbage', 'spinach', 'kale', 'fruit', 'lemon', 'lime', 'orange', 'apple',
    'berry', 'berries', 'cucumber', 'zucchini', 'squash', 'pumpkin', 'eggplant',
    'cilantro', 'parsley', 'basil', 'mint', 'thyme', 'rosemary', 'sage',
    'banana', 'avocado', 'corn', 'sprouts', 'bean sprouts', 'kimchi'
  ],
  'Meat & Seafood': [
    'chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'shrimp', 'seafood',
    'turkey', 'meat', 'steak', 'ground', 'bacon', 'sausage', 'ham', 'tuna',
    'cod', 'tilapia', 'crab', 'lobster', 'duck', 'veal', 'guanciale', 'pancetta',
    'prosciutto', 'anchovy'
  ],
  'Dairy & Eggs': [
    'milk', 'cream', 'cheese', 'butter', 'yogurt', 'sour cream', 'egg',
    'mozzarella', 'cheddar', 'parmesan', 'ricotta', 'cream cheese',
    'half and half', 'heavy cream', 'whipping cream', 'pecorino', 'romano',
    'mascarpone', 'buttermilk'
  ],
  'Grains & Pasta': [
    'rice', 'pasta', 'noodle', 'spaghetti', 'penne', 'fettuccine', 'linguine',
    'ramen', 'udon', 'soba', 'quinoa', 'couscous', 'bread', 'flour', 'tortilla',
    'wrap', 'pita', 'bagel', 'roll', 'crumb', 'panko'
  ],
  'Condiments & Sauces': [
    'sauce', 'oil', 'vinegar', 'soy sauce', 'gochujang', 'miso', 'mustard',
    'ketchup', 'mayonnaise', 'hot sauce', 'sriracha', 'hoisin', 'oyster sauce',
    'fish sauce', 'worcestershire', 'tahini', 'pesto', 'dressing', 'marinade',
    'sesame oil', 'olive oil', 'vegetable oil', 'coconut milk', 'paste'
  ],
  'Pantry': [
    'sugar', 'honey', 'syrup', 'chocolate', 'cocoa', 'vanilla', 'bean', 'lentil',
    'chickpea', 'can', 'broth', 'stock', 'tomato paste', 'cereal', 'oat',
    'nut', 'seed', 'dried', 'raisin', 'cranberry', 'baking powder', 'baking soda',
    'yeast', 'cornstarch', 'gelatin', 'seaweed', 'nori'
  ],
  'Spices & Seasonings': [
    'salt', 'pepper', 'spice', 'seasoning', 'cumin', 'coriander', 'paprika',
    'oregano', 'bay leaf', 'cinnamon', 'nutmeg', 'cardamom', 'turmeric',
    'curry', 'powder', 'flake', 'chili powder', 'garlic powder', 'onion powder',
    'red pepper flake', 'cayenne', 'allspice', 'herb', 'dried herb'
  ],
  'Other': []
}; 