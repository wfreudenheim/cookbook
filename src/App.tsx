import React from 'react';
import { Header } from './components/Header';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetail } from './components/RecipeDetail';
import { AddRecipe } from './components/AddRecipe';
import { GroceryList } from './components/GroceryList';
import { BooksView } from './components/BooksView';
import { GroceryProvider } from './context/GroceryContext';
import { useRecipes } from './hooks/useRecipes';
import { useBooks } from './hooks/useBooks';
import type { Recipe } from './types/recipe';
import { getTagCategory } from './utils/tags';

type View = 'grid' | 'detail' | 'add' | 'grocery' | 'books';

function AppContent() {
  const { recipes, loading, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const books = useBooks();
  const [currentView, setCurrentView] = React.useState<View>('grid');
  const [selectedRecipe, setSelectedRecipe] = React.useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = React.useState<string | null>(null);
  // Where the detail page's back button goes
  const [returnView, setReturnView] = React.useState<'grid' | 'books'>('grid');
  const returnScrollY = React.useRef(0);
  const restoreScroll = React.useRef(false);
  const [includeBookRecipes, setIncludeBookRecipes] = React.useState(false);
  const [recipeToEdit, setRecipeToEdit] = React.useState<Recipe | undefined>();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

  // Passphrase state
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    () => !!localStorage.getItem('cookbook_passphrase')
  );

  const handlePassphraseSubmit = async (passphrase: string) => {
    try {
      const response = await fetch('/api/verify-passphrase', {
        method: 'POST',
        headers: { 'X-Passphrase': passphrase },
      });
      if (response.ok) {
        localStorage.setItem('cookbook_passphrase', passphrase);
        setIsAuthenticated(true);
        return true;
      }
      // 401 means wrong passphrase
      if (response.status === 401) return false;
    } catch {
      // API unavailable (e.g. local dev without vercel) —
      // store passphrase optimistically, it'll be validated on first write
    }
    // If we got here via catch or a non-401 response, store it anyway
    localStorage.setItem('cookbook_passphrase', passphrase);
    setIsAuthenticated(true);
    return true;
  };

  const handlePassphraseClear = () => {
    localStorage.removeItem('cookbook_passphrase');
    setIsAuthenticated(false);
  };

  // Debounced search query
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cookbook recipes only show in the main grid when the toggle is on
  const gridRecipes = React.useMemo(
    () => (includeBookRecipes ? recipes : recipes.filter(r => !r.bookId)),
    [recipes, includeBookRecipes]
  );
  const bookRecipeCount = recipes.length - recipes.filter(r => !r.bookId).length;

  // Filter recipes based on search and tags
  const filteredRecipes = React.useMemo(() => {
    return gridRecipes.filter(recipe => {
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
        const selectedByCategory = selectedTags.reduce((acc, tag) => {
          const category = getTagCategory(tag);
          if (!acc[category]) acc[category] = [];
          acc[category].push(tag);
          return acc;
        }, {} as Record<string, string[]>);

        for (const [_category, tags] of Object.entries(selectedByCategory)) {
          if (tags.length > 0) {
            const hasMatchInCategory = tags.some(tag => recipe.tags.includes(tag));
            if (!hasMatchInCategory) return false;
          }
        }
      }

      return true;
    });
  }, [debouncedSearch, selectedTags, gridRecipes]);

  // Calculate tag counts from all recipes
  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    gridRecipes.forEach(recipe => {
      recipe.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [gridRecipes]);

  const handleRecipeClick = (recipeId: string) => {
    setReturnView(currentView === 'books' ? 'books' : 'grid');
    returnScrollY.current = window.scrollY;
    setSelectedRecipe(recipeId);
    setCurrentView('detail');
    window.scrollTo(0, 0);
  };

  const handleBackClick = () => {
    setSelectedRecipe(null);
    setRecipeToEdit(undefined);
    setCurrentView(returnView);
    restoreScroll.current = true;
  };

  // Put the list back where it was once it has rendered again
  React.useLayoutEffect(() => {
    if (restoreScroll.current && currentView !== 'detail') {
      restoreScroll.current = false;
      window.scrollTo(0, returnScrollY.current);
    }
  }, [currentView]);

  const handleEditClick = (recipe: Recipe) => {
    setRecipeToEdit(recipe);
    setCurrentView('add');
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    if (window.confirm(`Delete "${recipe.title}"? This cannot be undone.`)) {
      try {
        await deleteRecipe(recipe.id);
        setSelectedRecipe(null);
        setCurrentView(returnView);
      } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Failed to delete recipe. Please try again.');
      }
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (recipeToEdit) {
        await updateRecipe(recipeToEdit.id, recipe);
        setRecipeToEdit(undefined);
        setCurrentView('detail');
      } else {
        await addRecipe(recipe);
        setCurrentView('grid');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    }
  };

  const handleNavigate = (view: View) => {
    if (view === 'grid' || view === 'books') {
      setSelectedRecipe(null);
      setRecipeToEdit(undefined);
    }
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-background-secondary">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        tagCounts={tagCounts}
        showFilters={currentView === 'grid'}
        includeBookRecipes={includeBookRecipes}
        onIncludeBookRecipesToggle={() => setIncludeBookRecipes(prev => !prev)}
        bookRecipeCount={bookRecipeCount}
        onNavigate={handleNavigate}
        isAuthenticated={isAuthenticated}
        onPassphraseSubmit={handlePassphraseSubmit}
        onPassphraseClear={handlePassphraseClear}
      />
      <main>
        {loading ? (
          <div className="max-w-6xl mx-auto px-6 py-8 text-center text-text-secondary">
            Loading recipes...
          </div>
        ) : currentView === 'detail' && selectedRecipe ? (
          <RecipeDetail
            recipe={recipes.find(r => r.id === selectedRecipe)!}
            book={books.find(b => b.id === recipes.find(r => r.id === selectedRecipe)?.bookId)}
            backLabel={returnView === 'books' ? 'Back to Book' : 'Back to Recipes'}
            onBack={handleBackClick}
            onEdit={handleEditClick}
            onDelete={handleDeleteRecipe}
            isAuthenticated={isAuthenticated}
          />
        ) : currentView === 'add' ? (
          <AddRecipe
            onSave={handleAddRecipe}
            onCancel={handleBackClick}
            initialRecipe={recipeToEdit}
          />
        ) : currentView === 'grocery' ? (
          <GroceryList onBack={() => handleNavigate('grid')} />
        ) : currentView === 'books' ? (
          <BooksView
            books={books}
            recipes={recipes}
            selectedBookId={selectedBookId}
            onSelectBook={setSelectedBookId}
            onRecipeClick={handleRecipeClick}
          />
        ) : (
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8">
            {filteredRecipes.length === 0 ? (
              <div className="text-center text-text-secondary">
                <p className="mb-4">No recipes yet!</p>
                {isAuthenticated && (
                  <button
                    onClick={() => handleNavigate('add')}
                    className="px-4 py-2 bg-accent-primary text-white hover:bg-accent-secondary transition-colors duration-200"
                  >
                    Add Your First Recipe
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {filteredRecipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={() => handleRecipeClick(recipe.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <GroceryProvider>
      <AppContent />
    </GroceryProvider>
  );
}

export default App;
