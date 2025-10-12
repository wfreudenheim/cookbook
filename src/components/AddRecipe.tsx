import React from 'react';
import type { Recipe, Ingredient } from '../types/recipe';
import { parseRecipeText } from '../utils/claudeParser';

const tagCategories = {
  'Meal Type': ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'],
  'Cuisine': ['asian', 'italian', 'mexican', 'american', 'other'],
  'Protein': ['chicken', 'beef', 'pork', 'fish', 'vegetarian']
};

const commonUnits = [
  'cup',
  'tbsp',
  'tsp',
  'oz',
  'lb',
  'g',
  'kg',
  'ml',
  'L',
  'pinch',
  'whole',
  'clove',
  'piece',
  'slice',
  'custom...'
];

interface AddRecipeProps {
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialRecipe?: Recipe; // For editing mode
}

export const AddRecipe = ({ onSave, onCancel, initialRecipe }: AddRecipeProps) => {
  const [isPasting, setIsPasting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [pasteError, setPasteError] = React.useState<string | null>(null);
  const [rawRecipeText, setRawRecipeText] = React.useState('');
  
  const [title, setTitle] = React.useState(initialRecipe?.title || '');
  const [selectedTags, setSelectedTags] = React.useState<string[]>(initialRecipe?.tags || []);
  const [ingredients, setIngredients] = React.useState<Omit<Ingredient, 'id'>[]>(
    initialRecipe?.ingredients || [{ name: '', amount: '', unit: '' }]
  );
  const [instructions, setInstructions] = React.useState<string[]>(
    initialRecipe?.instructions || ['']
  );
  const [servings, setServings] = React.useState(initialRecipe?.servings || 4);
  const [customUnit, setCustomUnit] = React.useState('');
  const [showCustomUnit, setShowCustomUnit] = React.useState<number | null>(null);
  const [sourceUrl, setSourceUrl] = React.useState(initialRecipe?.sourceUrl || '');

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleUnitChange = (index: number, value: string) => {
    if (value === 'custom...') {
      setShowCustomUnit(index);
      return;
    }

    const newIngredients = [...ingredients];
    newIngredients[index] = { ...ingredients[index], unit: value };
    setIngredients(newIngredients);
  };

  const handleCustomUnitSubmit = (index: number) => {
    if (customUnit.trim()) {
      const newIngredients = [...ingredients];
      newIngredients[index] = { ...ingredients[index], unit: customUnit.trim() };
      setIngredients(newIngredients);
    }
    setShowCustomUnit(null);
    setCustomUnit('');
  };

  const handlePasteRecipe = async () => {
    if (!rawRecipeText.trim()) {
      setPasteError('Please paste a recipe first');
      return;
    }

    setIsLoading(true);
    setPasteError(null);

    try {
      const parsed = await parseRecipeText(rawRecipeText);
      
      setTitle(parsed.title);
      setIngredients(parsed.ingredients);
      setInstructions(parsed.instructions);
      if (parsed.servings) setServings(parsed.servings);
      setSelectedTags(parsed.suggestedTags);
      
      setIsPasting(false);
    } catch (error) {
      setPasteError(error instanceof Error ? error.message : 'Failed to parse recipe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      ingredients,
      instructions,
      servings,
      tags: selectedTags,
      sourceType: sourceUrl ? (
        sourceUrl.includes('instagram.com') ? 'instagram' :
        sourceUrl.includes('tiktok.com') ? 'tiktok' :
        'other'
      ) : 'manual',
      sourceUrl: sourceUrl || undefined,
      photos: [], // Initialize empty arrays for photos and notes
      notes: []
    });
  };

  if (isPasting) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl text-text-primary">Paste Recipe</h2>
            <button
              onClick={() => setIsPasting(false)}
              className="text-text-secondary hover:text-accent-primary transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
          
          <div className="space-y-4">
            <textarea
              value={rawRecipeText}
              onChange={(e) => setRawRecipeText(e.target.value)}
              placeholder="Paste your recipe here..."
              className="w-full h-64 p-4 bg-background-primary border border-border-light focus:border-accent-primary outline-none resize-none"
            />
            {pasteError && (
              <p className="text-error text-sm">{pasteError}</p>
            )}
            <button
              onClick={handlePasteRecipe}
              disabled={isLoading}
              className={`w-full py-3 bg-accent-primary text-white hover:bg-accent-secondary transition-colors duration-200 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Parsing Recipe...' : 'Parse Recipe'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl text-text-primary">
          {initialRecipe ? 'Edit Recipe' : 'Add Recipe'}
        </h2>
        {!initialRecipe && (
          <button
            onClick={() => setIsPasting(true)}
            className="text-accent-primary hover:text-accent-secondary transition-colors duration-200"
          >
            Paste Recipe
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm text-text-secondary">Recipe Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-background-primary border border-border-light focus:border-accent-primary outline-none transition-colors duration-200"
            placeholder="e.g., Spaghetti Carbonara"
            required
          />
        </div>

        {/* Source URL */}
        <div className="space-y-2">
          <label className="block text-sm text-text-secondary">Source URL (optional)</label>
          <input
            type="text"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            className="w-full px-3 py-2 bg-background-primary border border-border-light focus:border-accent-primary outline-none transition-colors duration-200"
            placeholder="e.g., https://instagram.com/p/..."
          />
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <label className="block text-sm text-text-secondary">Tags</label>
          {Object.entries(tagCategories).map(([category, tags]) => (
            <div key={category} className="space-y-2">
              <span className="text-sm text-text-secondary">{category}:</span>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-2 py-1 text-sm rounded-sm transition-colors duration-200 ${
                      selectedTags.includes(tag)
                        ? 'bg-accent-primary/10 text-accent-primary'
                        : 'bg-background-primary text-text-secondary hover:text-accent-primary'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Ingredients */}
        <div className="space-y-4">
          <label className="block text-sm text-text-secondary">Ingredients</label>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-4">
              <input
                type="text"
                value={ingredient.amount}
                onChange={(e) => {
                  const newIngredients = [...ingredients];
                  newIngredients[index] = { ...ingredient, amount: e.target.value };
                  setIngredients(newIngredients);
                }}
                className="w-20 px-3 py-2 bg-background-primary border border-border-light focus:border-accent-primary outline-none"
                placeholder="Amount"
              />
              {showCustomUnit === index ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    className="w-24 px-3 py-2 bg-background-primary border border-border-light focus:border-accent-primary outline-none"
                    placeholder="Custom unit"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCustomUnitSubmit(index);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleCustomUnitSubmit(index)}
                    className="px-2 text-accent-primary hover:text-accent-secondary"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <select
                  value={ingredient.unit}
                  onChange={(e) => handleUnitChange(index, e.target.value)}
                  className="w-24 px-3 py-2 bg-background-primary border border-border-light focus:border-accent-primary outline-none"
                >
                  <option value="">Unit</option>
                  {commonUnits.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              )}
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) => {
                  const newIngredients = [...ingredients];
                  newIngredients[index] = { ...ingredient, name: e.target.value };
                  setIngredients(newIngredients);
                }}
                className="flex-1 px-3 py-2 bg-background-primary border border-border-light focus:border-accent-primary outline-none"
                placeholder="Ingredient name"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddIngredient}
            className="text-sm text-accent-primary hover:text-accent-secondary transition-colors duration-200"
          >
            + Add ingredient
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <label className="block text-sm text-text-secondary">Instructions</label>
          {instructions.map((instruction, index) => (
            <div key={index} className="flex gap-4">
              <span className="text-text-secondary pt-2">{index + 1}.</span>
              <textarea
                value={instruction}
                onChange={(e) => {
                  const newInstructions = [...instructions];
                  newInstructions[index] = e.target.value;
                  setInstructions(newInstructions);
                }}
                rows={2}
                className="flex-1 px-3 py-2 bg-background-primary border border-border-light focus:border-accent-primary outline-none resize-none"
                placeholder="Add instruction step"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddInstruction}
            className="text-sm text-accent-primary hover:text-accent-secondary transition-colors duration-200"
          >
            + Add step
          </button>
        </div>

        {/* Servings */}
        <div className="space-y-2">
          <label className="block text-sm text-text-secondary">Servings</label>
          <input
            type="number"
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            min="1"
            className="w-24 px-3 py-2 bg-background-primary border border-border-light focus:border-accent-primary outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-accent-primary text-white hover:bg-accent-secondary transition-colors duration-200"
          >
            {initialRecipe ? 'Save Changes' : 'Save Recipe'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-text-secondary hover:text-accent-primary transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}; 