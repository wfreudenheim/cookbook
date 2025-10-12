import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Recipe } from '../types/recipe';
import { useAuth } from '../context/AuthContext';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load recipes from Supabase
  const loadRecipes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform Supabase data to our Recipe type
      const transformedRecipes: Recipe[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        sourceUrl: item.source_url,
        sourceType: item.source_type,
        ingredients: item.ingredients,
        instructions: item.instructions,
        servings: item.servings,
        prepTime: item.prep_time,
        cookTime: item.cook_time,
        tags: [], // We'll handle tags separately if needed
        photos: [],
        notes: [],
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      setRecipes(transformedRecipes);
      setError(null);
    } catch (err) {
      console.error('Error loading recipes:', err);
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadRecipes();
  }, []);

  // Add a new recipe
  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!user) {
        throw new Error('Must be logged in to add recipes');
      }

      const { data, error } = await supabase
        .from('recipes')
        .insert([{
          title: recipe.title,
          source_url: recipe.sourceUrl || null,
          source_type: recipe.sourceType || null,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          servings: recipe.servings,
          prep_time: recipe.prepTime || null,
          cook_time: recipe.cookTime || null,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Reload recipes to get the fresh list
      await loadRecipes();
      return data;
    } catch (err) {
      console.error('Error adding recipe:', err);
      throw err;
    }
  };

  // Update an existing recipe
  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    try {
      if (!user) {
        throw new Error('Must be logged in to update recipes');
      }

      const { error } = await supabase
        .from('recipes')
        .update({
          title: updates.title,
          source_url: updates.sourceUrl,
          source_type: updates.sourceType,
          ingredients: updates.ingredients,
          instructions: updates.instructions,
          servings: updates.servings,
          prep_time: updates.prepTime,
          cook_time: updates.cookTime
        })
        .eq('id', id);

      if (error) throw error;

      // Reload recipes to get the fresh list
      await loadRecipes();
    } catch (err) {
      console.error('Error updating recipe:', err);
      throw err;
    }
  };

  // Delete a recipe
  const deleteRecipe = async (id: string) => {
    try {
      if (!user) {
        throw new Error('Must be logged in to delete recipes');
      }

      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Reload recipes to get the fresh list
      await loadRecipes();
    } catch (err) {
      console.error('Error deleting recipe:', err);
      throw err;
    }
  };

  return {
    recipes,
    loading,
    error,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    refreshRecipes: loadRecipes
  };
}
