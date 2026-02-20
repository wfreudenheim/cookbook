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
  isAuthenticated: boolean;
  onPassphraseSubmit: (passphrase: string) => Promise<boolean>;
  onPassphraseClear: () => void;
}

export const Header = ({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagToggle,
  tagCounts,
  showFilters = true,
  onNavigate,
  isAuthenticated,
  onPassphraseSubmit,
  onPassphraseClear,
}: HeaderProps) => {
  const [showGroceryDropdown, setShowGroceryDropdown] = React.useState(false);
  const { selectedRecipes } = useGroceryContext();
  const [showPassphraseInput, setShowPassphraseInput] = React.useState(false);
  const [passphraseValue, setPassphraseValue] = React.useState('');
  const [passphraseError, setPassphraseError] = React.useState(false);

  const handlePassphraseSubmit = async () => {
    const valid = await onPassphraseSubmit(passphraseValue);
    if (valid) {
      setShowPassphraseInput(false);
      setPassphraseValue('');
      setPassphraseError(false);
    } else {
      setPassphraseError(true);
    }
  };

  return (
    <header className="border-b border-border-light">
      {/* Main header */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:h-16 flex flex-col md:flex-row md:items-center gap-3 md:gap-0 md:justify-between">
        <div className="flex items-center justify-between md:justify-start md:space-x-12">
          <h1
            onClick={() => onNavigate('grid')}
            className="text-text-primary text-lg cursor-pointer hover:text-accent-primary transition-colors duration-200"
          >
            Cookbook
          </h1>
          {/* Mobile: compact nav row */}
          <nav className="flex items-center space-x-4 md:hidden">
            {isAuthenticated && (
              <button
                onClick={() => onNavigate('add')}
                className="text-sm text-text-primary hover:text-accent-primary transition-colors duration-200"
              >
                Add
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setShowGroceryDropdown(!showGroceryDropdown)}
                className="text-sm text-text-primary hover:text-accent-primary transition-colors duration-200"
              >
                Grocery {selectedRecipes.length > 0 && (
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
            {isAuthenticated ? (
              <button
                onClick={onPassphraseClear}
                className="text-sm text-text-secondary hover:text-accent-primary transition-colors duration-200"
              >
                Lock
              </button>
            ) : showPassphraseInput ? (
              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  placeholder="Passphrase"
                  value={passphraseValue}
                  onChange={(e) => {
                    setPassphraseValue(e.target.value);
                    setPassphraseError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePassphraseSubmit();
                    if (e.key === 'Escape') {
                      setShowPassphraseInput(false);
                      setPassphraseValue('');
                      setPassphraseError(false);
                    }
                  }}
                  autoFocus
                  className={`w-24 px-2 py-1 text-sm border outline-none transition-colors duration-200 ${
                    passphraseError
                      ? 'border-error text-error'
                      : 'border-border-light focus:border-accent-primary'
                  }`}
                />
                <button
                  onClick={handlePassphraseSubmit}
                  className="text-sm text-accent-primary hover:text-accent-secondary transition-colors duration-200"
                >
                  Go
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPassphraseInput(true)}
                className="text-sm text-text-secondary hover:text-accent-primary transition-colors duration-200"
              >
                Unlock
              </button>
            )}
          </nav>
          {/* Desktop: search bar inline */}
          {showFilters && (
            <div className="relative w-64 hidden md:block">
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
        {/* Mobile: search bar below title */}
        {showFilters && (
          <div className="relative md:hidden">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-background-primary border border-border-light focus:border-accent-primary outline-none transition-colors duration-200"
            />
          </div>
        )}
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => onNavigate('grid')}
            className="text-text-primary hover:text-accent-primary transition-colors duration-200"
          >
            All Recipes
          </button>
          {isAuthenticated && (
            <button
              onClick={() => onNavigate('add')}
              className="text-text-primary hover:text-accent-primary transition-colors duration-200"
            >
              Add Recipe
            </button>
          )}
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
          {isAuthenticated ? (
            <button
              onClick={onPassphraseClear}
              className="text-text-secondary hover:text-accent-primary transition-colors duration-200 text-sm"
            >
              Lock
            </button>
          ) : showPassphraseInput ? (
            <div className="flex items-center space-x-2">
              <input
                type="password"
                placeholder="Passphrase"
                value={passphraseValue}
                onChange={(e) => {
                  setPassphraseValue(e.target.value);
                  setPassphraseError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePassphraseSubmit();
                  if (e.key === 'Escape') {
                    setShowPassphraseInput(false);
                    setPassphraseValue('');
                    setPassphraseError(false);
                  }
                }}
                autoFocus
                className={`w-32 px-2 py-1 text-sm border outline-none transition-colors duration-200 ${
                  passphraseError
                    ? 'border-error text-error'
                    : 'border-border-light focus:border-accent-primary'
                }`}
              />
              <button
                onClick={handlePassphraseSubmit}
                className="text-sm text-accent-primary hover:text-accent-secondary transition-colors duration-200"
              >
                Unlock
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPassphraseInput(true)}
              className="text-text-secondary hover:text-accent-primary transition-colors duration-200 text-sm"
            >
              Unlock
            </button>
          )}
        </nav>
      </div>

      {/* Filter section */}
      {showFilters && (
        <div className="border-t border-border-light bg-background-primary/50">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4">
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
