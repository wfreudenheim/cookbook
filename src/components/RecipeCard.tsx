import React from 'react';
import type { Recipe } from '../types/recipe';
import { useGroceryContext } from '../context/GroceryContext';

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
}

export const RecipeCard = ({ recipe, onClick }: RecipeCardProps) => {
  const { title, tags } = recipe;
  const { isRecipeSelected, addRecipe, removeRecipe } = useGroceryContext();
  const isSelected = isRecipeSelected(recipe.id);

  const handleGroceryClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    if (isSelected) {
      removeRecipe(recipe.id);
    } else {
      addRecipe(recipe);
    }
  };
  
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer border border-border-light hover:border-border-medium transition-colors duration-200 bg-background-primary rounded-sm overflow-hidden relative"
    >
      <button
        onClick={handleGroceryClick}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-background-primary border border-border-light rounded-sm hover:border-accent-primary transition-all duration-200 z-10"
      >
        <span className={`transition-colors duration-200 ${isSelected ? 'text-accent-primary' : 'text-text-secondary'}`}>
          {isSelected ? '✓' : '+'}
        </span>
      </button>

      <div className="p-6 space-y-4">
        <h3 className="text-text-primary text-xl font-normal leading-snug pr-8">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span 
              key={tag}
              className="inline-block text-xs px-2 py-1 bg-accent-primary/10 text-accent-primary rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}; 