import React from 'react';
import { useGroceryContext } from '../context/GroceryContext';
import { generateGroceryList } from '../utils/groceryUtils';
import type { GroceryItem, OrganizedGroceryList, StoreSection } from '../types/grocery';

interface GroceryListProps {
  onBack: () => void;
}

interface ClaudeIngredient {
  name: string;
  amount?: string;
  unit?: string;
  notes?: string;
}

interface ClaudeResponse {
  [section: string]: ClaudeIngredient[];
}

const formatIngredient = (item: GroceryItem) => {
  const parts = [];
  if (item.amount && item.amount !== 'undefined') parts.push(item.amount);
  if (item.unit && item.unit !== 'undefined') parts.push(item.unit);
  parts.push(item.name);
  if (item.notes) parts.push(`(${item.notes})`);
  return parts.join(' ');
};

export const GroceryList = ({ onBack }: GroceryListProps) => {
  const { selectedRecipes, clearList } = useGroceryContext();
  const [checkedItems, setCheckedItems] = React.useState<Set<string>>(new Set());
  const [isOrganizing, setIsOrganizing] = React.useState(false);
  const [organizedList, setOrganizedList] = React.useState(() => generateGroceryList(selectedRecipes));

  React.useEffect(() => {
    setOrganizedList(generateGroceryList(selectedRecipes));
  }, [selectedRecipes]);

  const handleToggleItem = (item: GroceryItem) => {
    const key = `${item.name}-${item.unit}-${item.amount}`;
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const getItemKey = (item: GroceryItem) => `${item.name}-${item.unit}-${item.amount}`;

  const handleOrganize = async () => {
    setIsOrganizing(true);
    try {
      // Convert the grocery list to a text format that preserves sections
      const listText = Object.entries(organizedList)
        .map(([section, items]) => {
          const itemsList = items
            .map(item => {
              const parts = [];
              if (item.amount && item.amount !== 'undefined') parts.push(item.amount);
              if (item.unit && item.unit !== 'undefined') parts.push(item.unit);
              parts.push(item.name);
              if (item.notes) parts.push(`(${item.notes})`);
              return `${parts.join(' ')}\nFrom: ${item.fromRecipes.join(', ')}`;
            })
            .join('\n\n');
          return `=== ${section} ===\n${itemsList}`;
        })
        .join('\n\n');

      // Use the recipe parsing endpoint to clean it up
      const response = await fetch('http://localhost:3000/api/parse-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recipeText: `Please organize this grocery list and clean up the quantities:\n\n${listText}` 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to organize list');
      }

      const data = await response.json() as ClaudeResponse;
      
      // Convert Claude's response back to our format
      const newList: OrganizedGroceryList = {};
      Object.entries(data).forEach(([section, items]: [string, ClaudeIngredient[]]) => {
        if (!items || !Array.isArray(items)) return;
        
        newList[section as StoreSection] = items
          .filter(item => item && typeof item === 'object' && 'name' in item && item.name)
          .map(item => ({
            name: item.name,
            amount: item.amount || '',
            unit: item.unit || '',
            notes: item.notes || '',
            fromRecipes: [], // We'll preserve these in the next step
            checked: false
          }));
      });

      // Preserve recipe sources from the original list
      Object.entries(newList).forEach(([section, items]) => {
        items.forEach(item => {
          if (!item.name) return;
          
          // Find matching items in the original list
          const originalItems = Object.values(organizedList)
            .flat()
            .filter(orig => {
              if (!orig || !orig.name || !item.name) return false;
              const origName = orig.name.toLowerCase();
              const itemName = item.name.toLowerCase();
              return origName.includes(itemName) || itemName.includes(origName);
            });
          
          if (originalItems.length > 0) {
            item.fromRecipes = [...new Set(originalItems.flatMap(orig => orig.fromRecipes))];
          }
        });
      });

      // Update the UI with the cleaned list
      setOrganizedList(newList);
    } catch (error) {
      console.error('Error organizing list:', error);
    } finally {
      setIsOrganizing(false);
    }
  };

  const handleCopyToClipboard = () => {
    // Filter out checked items and empty sections
    const filteredSections = Object.entries(organizedList)
      .map(([section, items]) => {
        const uncheckedItems = items.filter(item => !checkedItems.has(getItemKey(item)));
        if (uncheckedItems.length === 0) return null;
        
        const itemsList = uncheckedItems
          .map(item => `□ ${formatIngredient(item)}`)
          .join('\n');
        
        return `${section}:\n${itemsList}`;
      })
      .filter(Boolean) // Remove empty sections
      .join('\n\n');

    const recipeList = selectedRecipes.map(r => r.title).join(' • ');
    const fullText = `Shopping list for ${selectedRecipes.length} ${selectedRecipes.length === 1 ? 'recipe' : 'recipes'}:\n${recipeList}\n\n${filteredSections}`;
    
    navigator.clipboard.writeText(fullText);
  };

  if (selectedRecipes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={onBack} className="text-text-secondary hover:text-accent-primary transition-colors duration-200">← Back to Recipes</button>
        <div className="mt-8 text-center text-text-secondary">
          No recipes selected for grocery list
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="text-text-secondary hover:text-accent-primary transition-colors duration-200">← Back to Recipes</button>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleOrganize}
            disabled={isOrganizing}
            className={`px-4 py-2 text-sm border rounded-sm transition-colors duration-200 ${
              isOrganizing 
                ? 'border-border-light text-text-secondary cursor-not-allowed'
                : 'border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-white'
            }`}
          >
            {isOrganizing ? 'Organizing...' : 'Clean Up & Copy'}
          </button>
          <button 
            onClick={handleCopyToClipboard}
            className="px-4 py-2 text-sm border border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-white rounded-sm transition-colors duration-200"
          >
            Copy to Clipboard
          </button>
          <button 
            onClick={clearList}
            className="px-4 py-2 text-sm border border-error text-error hover:bg-error hover:text-white rounded-sm transition-colors duration-200"
          >
            Clear List
          </button>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-text-secondary mb-2">
          Shopping list for {selectedRecipes.length} {selectedRecipes.length === 1 ? 'recipe' : 'recipes'}:
        </p>
        <p className="text-text-primary">
          {selectedRecipes.map(r => r.title).join(' • ')}
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(organizedList).map(([section, items]) => (
          <div key={section}>
            <h2 className="text-lg text-text-primary mb-3">{section}</h2>
            <div className="space-y-2">
              {items.map(item => {
                const itemKey = getItemKey(item);
                const isChecked = checkedItems.has(itemKey);

                return (
                  <div 
                    key={itemKey}
                    className="flex items-start gap-3 group"
                  >
                    <button
                      onClick={() => handleToggleItem(item)}
                      className={`mt-1 w-4 h-4 border rounded-sm transition-colors duration-200 flex-shrink-0 ${
                        isChecked 
                          ? 'bg-accent-primary border-accent-primary text-white'
                          : 'border-border-medium hover:border-accent-primary'
                      }`}
                    >
                      {isChecked && '✓'}
                    </button>
                    <div className={`flex-grow ${isChecked ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                      <span>
                        {formatIngredient(item)}
                      </span>
                      <div className="text-sm text-text-secondary mt-0.5">
                        From: {item.fromRecipes.join(', ')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 