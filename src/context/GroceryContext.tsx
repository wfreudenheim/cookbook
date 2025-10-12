import React from 'react';
import type { Recipe } from '../types/recipe';

interface GroceryContextType {
  selectedRecipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  removeRecipe: (recipeId: string) => void;
  clearList: () => void;
  isRecipeSelected: (recipeId: string) => boolean;
}

export const GroceryContext = React.createContext<GroceryContextType>({
  selectedRecipes: [],
  addRecipe: () => {},
  removeRecipe: () => {},
  clearList: () => {},
  isRecipeSelected: () => false,
});

export const useGroceryContext = () => {
  const context = React.useContext(GroceryContext);
  if (!context) {
    throw new Error('useGroceryContext must be used within a GroceryProvider');
  }
  return context;
};

export const GroceryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedRecipes, setSelectedRecipes] = React.useState<Recipe[]>([]);

  // Load from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('groceryList');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedRecipes(parsed.map((recipe: any) => ({
        ...recipe,
        createdAt: new Date(recipe.createdAt),
        updatedAt: new Date(recipe.updatedAt)
      })));
    }
  }, []);

  // Save to localStorage when list changes
  React.useEffect(() => {
    localStorage.setItem('groceryList', JSON.stringify(selectedRecipes));
  }, [selectedRecipes]);

  const addRecipe = (recipe: Recipe) => {
    setSelectedRecipes(prev => [...prev, recipe]);
  };

  const removeRecipe = (recipeId: string) => {
    setSelectedRecipes(prev => prev.filter(r => r.id !== recipeId));
  };

  const clearList = () => {
    setSelectedRecipes([]);
  };

  const isRecipeSelected = (recipeId: string) => {
    return selectedRecipes.some(r => r.id === recipeId);
  };

  return (
    <GroceryContext.Provider value={{
      selectedRecipes,
      addRecipe,
      removeRecipe,
      clearList,
      isRecipeSelected,
    }}>
      {children}
    </GroceryContext.Provider>
  );
}; 