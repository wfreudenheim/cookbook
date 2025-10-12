import React from 'react';
import type { Recipe } from '../types/recipe';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: (recipe: Recipe) => void;
}

const getSourceDisplay = (sourceType?: string, sourceUrl?: string) => {
  if (!sourceType || sourceType === 'manual') return 'Manual Entry';
  if (sourceUrl) {
    if (sourceType === 'instagram') return 'Instagram';
    if (sourceType === 'tiktok') return 'TikTok';
    return 'Source';
  }
  return sourceType;
};

export const RecipeDetail = ({ recipe, onBack, onEdit }: RecipeDetailProps) => {
  const { title, sourceUrl, sourceType, ingredients, instructions, servings, tags } = recipe;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="text-text-secondary hover:text-accent-primary transition-colors duration-200"
        >
          ← Back to Recipes
        </button>
        <button 
          onClick={() => onEdit(recipe)}
          className="text-text-secondary hover:text-accent-primary transition-colors duration-200"
        >
          Edit
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-text-primary text-3xl font-normal mb-4">{title}</h1>
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map(tag => (
            <span 
              key={tag}
              className="inline-block text-xs px-2 py-1 bg-accent-primary/10 text-accent-primary rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center space-x-8 text-sm text-text-secondary mb-8">
          <div className="flex items-center space-x-2">
            <span>Serves:</span>
            <div className="inline-flex items-center border border-border-light rounded-sm">
              <button className="px-2 py-1 hover:text-accent-primary transition-colors duration-200">-</button>
              <span className="px-3 py-1 border-x border-border-light">{servings}</span>
              <button className="px-2 py-1 hover:text-accent-primary transition-colors duration-200">+</button>
            </div>
          </div>
          <div>
            {sourceUrl ? (
              <>From: <a href={sourceUrl} className="text-accent-primary hover:underline" target="_blank" rel="noopener noreferrer">{getSourceDisplay(sourceType, sourceUrl)}</a></>
            ) : (
              <>Source: <span className="text-text-secondary">{getSourceDisplay(sourceType, sourceUrl)}</span></>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-text-primary text-xl mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="text-text-secondary">
                • {ingredient.amount} {ingredient.unit} {ingredient.name}
                {ingredient.notes && <span className="text-text-secondary text-sm"> ({ingredient.notes})</span>}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-text-primary text-xl mb-4">Instructions</h2>
          <ol className="space-y-4">
            {instructions.map((step, index) => (
              <li key={index} className="text-text-secondary">
                <span className="font-normal text-text-primary">{index + 1}.</span> {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="border-t border-border-light pt-8">
        <h2 className="text-text-primary text-xl mb-4">Photos & Notes</h2>
        <div className="flex space-x-4">
          <button className="px-4 py-2 border border-border-light hover:border-accent-primary text-text-secondary hover:text-accent-primary transition-colors duration-200">
            Add Photo
          </button>
          <button className="px-4 py-2 border border-border-light hover:border-accent-primary text-text-secondary hover:text-accent-primary transition-colors duration-200">
            Add Note
          </button>
        </div>
      </div>

      <div className="mt-8">
        <button className="px-4 py-2 bg-accent-primary text-white hover:bg-accent-secondary transition-colors duration-200">
          Add to Grocery List
        </button>
      </div>
    </div>
  );
}; 