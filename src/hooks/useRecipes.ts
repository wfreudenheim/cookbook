import { useState, useEffect } from 'react';
import type { Recipe } from '../types/recipe';

function getPassphrase(): string | null {
  return localStorage.getItem('cookbook_passphrase');
}

async function apiCall(method: string, body: unknown): Promise<{ success: boolean; recipes: Recipe[] }> {
  const passphrase = getPassphrase();
  if (!passphrase) {
    throw new Error('Passphrase required');
  }

  const response = await fetch('/api/recipes', {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Passphrase': passphrase,
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    localStorage.removeItem('cookbook_passphrase');
    throw new Error('Invalid passphrase');
  }

  if (response.status === 409) {
    throw new Error('Conflict - another edit was in progress. Please try again.');
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'API request failed');
  }

  return response.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRecipeDates(raw: any): Recipe {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/recipes.json');
      if (!response.ok) throw new Error('Failed to load recipes');
      const data = await response.json();
      setRecipes(data.map(parseRecipeDates));
      setError(null);
    } catch (err) {
      console.error('Error loading recipes:', err);
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRecipe = {
      ...recipe,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const result = await apiCall('POST', newRecipe);

    if (result.recipes) {
      setRecipes(result.recipes.map(parseRecipeDates));
    }

    return newRecipe;
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    const result = await apiCall('PUT', { id, ...updates });

    if (result.recipes) {
      setRecipes(result.recipes.map(parseRecipeDates));
    }
  };

  const deleteRecipe = async (id: string) => {
    const result = await apiCall('DELETE', { id });

    if (result.recipes) {
      setRecipes(result.recipes.map(parseRecipeDates));
    }
  };

  return {
    recipes,
    loading,
    error,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    refreshRecipes: loadRecipes,
  };
}
