import React from 'react';
import { Header } from './components/Header';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetail } from './components/RecipeDetail';
import { AddRecipe } from './components/AddRecipe';
import { GroceryList } from './components/GroceryList';
import { GroceryProvider } from './context/GroceryContext';
import { dummyRecipes } from './data/dummyRecipes';
import type { Recipe } from './types/recipe';

type View = 'grid' | 'detail' | 'add' | 'grocery';

// Helper function to get category for a tag
const getTagCategory = (tag: string): string => {
  if (['breakfast', 'lunch', 'dinner', 'dessert', 'snack'].includes(tag)) return 'meal';
  if (['asian', 'italian', 'mexican', 'american', 'other'].includes(tag)) return 'cuisine';
  if (['chicken', 'beef', 'pork', 'fish', 'vegetarian'].includes(tag)) return 'protein';
  return '';
};

// Load recipes from localStorage or use dummy data
const loadRecipes = (): Recipe[] => {
  const saved = localStorage.getItem('recipes');
  if (saved) {
    const parsed = JSON.parse(saved);
    // Convert string dates back to Date objects
    return parsed.map((recipe: any) => ({
      ...recipe,
      createdAt: new Date(recipe.createdAt),
      updatedAt: new Date(recipe.updatedAt)
    }));
  }
  return dummyRecipes;
};

function App() {
  const [currentView, setCurrentView] = React.useState<View>('grid');
  const [selectedRecipe, setSelectedRecipe] = React.useState<string | null>(null);
  const [recipeToEdit, setRecipeToEdit] = React.useState<Recipe | undefined>();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [recipes, setRecipes] = React.useState<Recipe[]>(loadRecipes);

  // Save recipes to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);

  // Debounced search query
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter recipes based on search and tags
  const filteredRecipes = React.useMemo(() => {
    return recipes.filter(recipe => {
      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesSearch = 
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.ingredients.some(i => i.name.toLowerCase().includes(searchLower)) ||
          recipe.tags.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Tag filter
      if (selectedTags.length > 0) {
        // Group selected tags by category
        const selectedByCategory = selectedTags.reduce((acc, tag) => {
          const category = getTagCategory(tag);
          if (!acc[category]) acc[category] = [];
          acc[category].push(tag);
          return acc;
        }, {} as Record<string, string[]>);

        // Check each category
        for (const [_category, tags] of Object.entries(selectedByCategory)) {
          // OR within category - recipe must match at least one tag
          if (tags.length > 0) {
            const hasMatchInCategory = tags.some(tag => recipe.tags.includes(tag));
            if (!hasMatchInCategory) return false;
          }
        }
      }

      return true;
    });
  }, [debouncedSearch, selectedTags, recipes]);

  // Calculate tag counts from current filtered recipes
  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    recipes.forEach(recipe => {
      recipe.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [recipes]);

  const handleRecipeClick = (recipeId: string) => {
    setSelectedRecipe(recipeId);
    setCurrentView('detail');
  };

  const handleBackClick = () => {
    setSelectedRecipe(null);
    setRecipeToEdit(undefined);
    setCurrentView('grid');
  };

  const handleEditClick = (recipe: Recipe) => {
    setRecipeToEdit(recipe);
    setCurrentView('add');
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddRecipe = (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (recipeToEdit) {
      // Editing existing recipe
      const updatedRecipe = {
        ...recipeToEdit,
        ...recipe,
        updatedAt: new Date()
      };
      setRecipes(prev => prev.map(r => r.id === recipeToEdit.id ? updatedRecipe : r));
      setRecipeToEdit(undefined);
    } else {
      // Adding new recipe
      const newRecipe: Recipe = {
        ...recipe,
        id: (recipes.length + 1).toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setRecipes([...recipes, newRecipe]);
    }
    setCurrentView('grid');
  };

  const handleNavigate = (view: View) => {
    if (view === 'grid') {
      setSelectedRecipe(null);
      setRecipeToEdit(undefined);
    }
    setCurrentView(view);
  };

  return (
    <GroceryProvider>
      <div className="min-h-screen bg-background-secondary">
        <Header 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          tagCounts={tagCounts}
          showFilters={currentView === 'grid'}
          onNavigate={handleNavigate}
        />
        <main>
          {currentView === 'detail' && selectedRecipe ? (
            <RecipeDetail 
              recipe={recipes.find(r => r.id === selectedRecipe)!}
              onBack={handleBackClick}
              onEdit={handleEditClick}
            />
          ) : currentView === 'add' ? (
            <AddRecipe 
              onSave={handleAddRecipe}
              onCancel={handleBackClick}
              initialRecipe={recipeToEdit}
            />
          ) : currentView === 'grocery' ? (
            <GroceryList onBack={() => handleNavigate('grid')} />
          ) : (
            <div className="max-w-6xl mx-auto px-6 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRecipes.map(recipe => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe}
                    onClick={() => handleRecipeClick(recipe.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </GroceryProvider>
  );
}

export default App;
