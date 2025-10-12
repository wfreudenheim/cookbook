import React from 'react';
import { TagFilter } from './TagFilter';
import { GroceryDropdown } from './GroceryDropdown';
import { useGroceryContext } from '../context/GroceryContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  tagCounts: Record<string, number>;
  showFilters?: boolean;
  onNavigate: (view: 'grid' | 'add' | 'grocery') => void;
}

export const Header = ({ 
  searchQuery, 
  onSearchChange, 
  selectedTags, 
  onTagToggle, 
  tagCounts,
  showFilters = true,
  onNavigate
}: HeaderProps) => {
  const [showGroceryDropdown, setShowGroceryDropdown] = React.useState(false);
  const { selectedRecipes } = useGroceryContext();

  return (
    <header className="border-b border-border-light">
      {/* Main header */}
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-12">
          <h1 
            onClick={() => onNavigate('grid')}
            className="text-text-primary text-lg cursor-pointer hover:text-accent-primary transition-colors duration-200"
          >
            Cookbook
          </h1>
          {showFilters && (
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-background-primary border border-border-light focus:border-accent-primary outline-none transition-colors duration-200"
              />
            </div>
          )}
        </div>
        <nav className="flex items-center space-x-8">
          <button 
            onClick={() => onNavigate('grid')}
            className="text-text-primary hover:text-accent-primary transition-colors duration-200"
          >
            All Recipes
          </button>
          <button 
            onClick={() => onNavigate('add')}
            className="text-text-primary hover:text-accent-primary transition-colors duration-200"
          >
            Add Recipe
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowGroceryDropdown(!showGroceryDropdown)}
              className="text-text-primary hover:text-accent-primary transition-colors duration-200"
            >
              Grocery List {selectedRecipes.length > 0 && (
                <span className="text-accent-primary">[{selectedRecipes.length}]</span>
              )}
            </button>
            {showGroceryDropdown && (
              <GroceryDropdown 
                onClose={() => setShowGroceryDropdown(false)}
                onGenerateList={() => {
                  setShowGroceryDropdown(false);
                  onNavigate('grocery');
                }}
              />
            )}
          </div>
        </nav>
      </div>

      {/* Filter section */}
      {showFilters && (
        <div className="border-t border-border-light bg-background-primary/50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <TagFilter 
              selectedTags={selectedTags}
              onTagToggle={onTagToggle}
              tagCounts={tagCounts}
            />
          </div>
        </div>
      )}
    </header>
  );
}; 