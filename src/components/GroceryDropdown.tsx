import React from 'react';
import type { Recipe } from '../types/recipe';
import { useGroceryContext } from '../context/GroceryContext';

interface GroceryDropdownProps {
  onClose: () => void;
  onGenerateList: () => void;
}

export const GroceryDropdown = ({ onClose, onGenerateList }: GroceryDropdownProps) => {
  const { selectedRecipes, removeRecipe } = useGroceryContext();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={dropdownRef}
      className="fixed right-6 mt-2 w-64 bg-background-primary border border-border-light shadow-sm rounded-sm flex flex-col z-50"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      <div className="flex-1 overflow-y-auto">
        {selectedRecipes.length === 0 ? (
          <div className="p-4 text-text-secondary text-sm text-center">
            No recipes selected
          </div>
        ) : (
          <div className="divide-y divide-border-light">
            {selectedRecipes.map((recipe: Recipe) => (
              <div 
                key={recipe.id}
                className="flex items-center justify-between p-3 group"
              >
                <span className="text-sm text-text-primary truncate pr-2">
                  {recipe.title}
                </span>
                <button
                  onClick={() => removeRecipe(recipe.id)}
                  className="text-text-secondary opacity-0 group-hover:opacity-100 hover:text-error transition-all duration-200"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-border-light">
        <button
          onClick={onGenerateList}
          disabled={selectedRecipes.length === 0}
          className={`w-full py-2 text-sm text-center transition-colors duration-200 ${
            selectedRecipes.length === 0
              ? 'bg-accent-primary/30 text-text-secondary cursor-not-allowed'
              : 'bg-accent-primary text-white hover:bg-accent-secondary'
          }`}
        >
          Generate List
        </button>
      </div>
    </div>
  );
}; 