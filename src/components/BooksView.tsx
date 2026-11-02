import React from 'react';
import type { Recipe } from '../types/recipe';
import type { Book } from '../types/book';
import { useGroceryContext } from '../context/GroceryContext';
import { ClockIcon, isQuick } from './ClockIcon';

interface BooksViewProps {
  books: Book[];
  recipes: Recipe[];
  selectedBookId: string | null;
  onSelectBook: (bookId: string) => void;
  onRecipeClick: (recipeId: string) => void;
}

const formatTime = (recipe: Recipe) => {
  const total = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  if (!total) return '';
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`;
};

export const BooksView = ({ books, recipes, selectedBookId, onSelectBook, onRecipeClick }: BooksViewProps) => {
  const [query, setQuery] = React.useState('');
  const [quickOnly, setQuickOnly] = React.useState(false);
  const { isRecipeSelected, addRecipe, removeRecipe } = useGroceryContext();

  const book = books.find(b => b.id === selectedBookId) || books[0];

  const countFor = (bookId: string) => recipes.filter(r => r.bookId === bookId).length;

  // Group the book's recipes by chapter, keeping the book's chapter order and page order within each
  const chapters = React.useMemo(() => {
    if (!book) return [];
    const q = query.trim().toLowerCase();
    const bookRecipes = recipes
      .filter(r => r.bookId === book.id)
      .filter(r => !quickOnly || isQuick(r))
      .filter(r =>
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.ingredients.some(i => i.name.toLowerCase().includes(q))
      )
      .sort((a, b) => (a.page || 0) - (b.page || 0));

    const names = [...book.chapters];
    bookRecipes.forEach(r => {
      const name = r.chapter || 'Other';
      if (!names.includes(name)) names.push(name);
    });

    return names
      .map(name => ({ name, recipes: bookRecipes.filter(r => (r.chapter || 'Other') === name) }))
      .filter(chapter => chapter.recipes.length > 0);
  }, [book, recipes, query, quickOnly]);

  const quickCount = book ? recipes.filter(r => r.bookId === book.id && isQuick(r)).length : 0;

  const handleGroceryClick = (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation();
    if (isRecipeSelected(recipe.id)) {
      removeRecipe(recipe.id);
    } else {
      addRecipe(recipe);
    }
  };

  if (books.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 text-center text-text-secondary">
        No cookbooks yet.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8 flex flex-col md:flex-row gap-4 md:gap-10">
      {/* Book list: a side panel on desktop, a scrolling row on mobile */}
      <aside className="md:w-56 md:shrink-0">
        <h2 className="hidden md:block text-sm text-text-secondary mb-3">Books</h2>
        <ul className="flex md:flex-col gap-2 overflow-x-auto pb-1 md:pb-0">
          {books.map(b => {
            const isActive = b.id === book?.id;
            return (
              <li key={b.id} className="shrink-0">
                <button
                  onClick={() => onSelectBook(b.id)}
                  className={`w-full text-left px-3 py-2 border rounded-sm transition-colors duration-200 ${
                    isActive
                      ? 'border-accent-primary bg-accent-primary/10'
                      : 'border-border-light bg-background-primary hover:border-border-medium'
                  }`}
                >
                  <div className={`text-sm leading-snug ${isActive ? 'text-accent-primary' : 'text-text-primary'}`}>
                    {b.title}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    {b.author && <>{b.author} · </>}{countFor(b.id)} recipes
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {book && (
        <section className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-text-primary text-2xl md:text-3xl font-normal">{book.title}</h1>
              {book.author && <p className="text-text-secondary text-sm mt-1">{book.author}</p>}
              {book.description && <p className="text-text-secondary text-sm mt-2 max-w-xl">{book.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              {quickCount > 0 && (
                <button
                  onClick={() => setQuickOnly(!quickOnly)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-sm transition-colors duration-200 ${
                    quickOnly
                      ? 'bg-accent-primary border-accent-primary text-white'
                      : 'border-border-light bg-background-primary text-text-secondary hover:border-accent-primary hover:text-accent-primary'
                  }`}
                >
                  <ClockIcon className="w-3.5 h-3.5" />
                  Quick ({quickCount})
                </button>
              )}
              <input
                type="text"
                placeholder="Search this book..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full md:w-56 px-3 py-1.5 text-sm bg-background-primary border border-border-light focus:border-accent-primary outline-none transition-colors duration-200"
              />
            </div>
          </div>

          {chapters.length === 0 && (
            <p className="text-text-secondary">No recipes match{query && <> "{query}"</>}{quickOnly && ' among the quick ones'}.</p>
          )}

          <div className="space-y-8">
            {chapters.map(chapter => (
              <div key={chapter.name}>
                <h2 className="text-text-primary text-lg mb-2">
                  {chapter.name} <span className="text-text-secondary text-sm">({chapter.recipes.length})</span>
                </h2>
                <ul className="border-t border-border-light">
                  {chapter.recipes.map(recipe => {
                    const isSelected = isRecipeSelected(recipe.id);
                    return (
                      <li
                        key={recipe.id}
                        onClick={() => onRecipeClick(recipe.id)}
                        className="flex items-center gap-3 py-2.5 px-1 border-b border-border-light cursor-pointer hover:bg-accent-primary/5 transition-colors duration-200"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-text-primary hover:text-accent-primary">
                            {isQuick(recipe) && <ClockIcon className="w-4 h-4 mr-1.5 -mt-0.5 text-accent-primary" />}
                            {recipe.title}
                          </span>
                          {/* Phones: time and page go on a second line */}
                          <div className="sm:hidden text-xs text-text-secondary mt-0.5">
                            {[formatTime(recipe), recipe.page && `p. ${recipe.page}`].filter(Boolean).join(' · ')}
                          </div>
                        </div>
                        <span className="hidden sm:inline text-xs text-text-secondary whitespace-nowrap">{formatTime(recipe)}</span>
                        {recipe.page && (
                          <span className="hidden sm:inline text-xs text-text-secondary/70 whitespace-nowrap w-12 text-right">p. {recipe.page}</span>
                        )}
                        <button
                          onClick={(e) => handleGroceryClick(e, recipe)}
                          title={isSelected ? 'Remove from grocery list' : 'Add to grocery list'}
                          className="w-7 h-7 shrink-0 flex items-center justify-center border border-border-light rounded-sm hover:border-accent-primary transition-colors duration-200"
                        >
                          <span className={isSelected ? 'text-accent-primary' : 'text-text-secondary'}>
                            {isSelected ? '✓' : '+'}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
