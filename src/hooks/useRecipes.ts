import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Recipe } from '../types/recipe';
import { useAuth } from '../context/AuthContext';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load recipes from Supabase with tags
  const loadRecipes = async () => {
    try {
      setLoading(true);
      
      // Fetch recipes
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (recipesError) throw recipesError;

      // Fetch all tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('recipe_tags')
        .select('*');

      if (tagsError) throw tagsError;

      // Group tags by recipe_id
      const tagsByRecipe: Record<string, string[]> = {};
      (tagsData || []).forEach((tag: any) => {
        if (!tagsByRecipe[tag.recipe_id]) {
          tagsByRecipe[tag.recipe_id] = [];
        }
        tagsByRecipe[tag.recipe_id].push(tag.tag_name);
      });

      // Transform Supabase data to our Recipe type
      const transformedRecipes: Recipe[] = (recipesData || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        sourceUrl: item.source_url,
        sourceType: item.source_type,
        ingredients: item.ingredients,
        instructions: item.instructions,
        servings: item.servings,
        prepTime: item.prep_time,
        cookTime: item.cook_time,
        tags: tagsByRecipe[item.id] || [],
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

  // Add a new recipe with tags
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

      // Add tags if any
      if (recipe.tags && recipe.tags.length > 0) {
        const tagInserts = recipe.tags.map(tag => ({
          recipe_id: data.id,
          tag_name: tag
        }));

        const { error: tagsError } = await supabase
          .from('recipe_tags')
          .insert(tagInserts);

        if (tagsError) throw tagsError;
      }

      // Reload recipes to get the fresh list
      await loadRecipes();
      return data;
    } catch (err) {
      console.error('Error adding recipe:', err);
      throw err;
    }
  };

  // Update an existing recipe with tags
  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    try {
      if (!user) {
        throw new Error('Must be logged in to update recipes');
      }

      // Update recipe data
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

      // Update tags if provided
      if (updates.tags !== undefined) {
        // Delete existing tags
        const { error: deleteError } = await supabase
          .from('recipe_tags')
          .delete()
          .eq('recipe_id', id);

        if (deleteError) throw deleteError;

        // Insert new tags
        if (updates.tags.length > 0) {
          const tagInserts = updates.tags.map(tag => ({
            recipe_id: id,
            tag_name: tag
          }));

          const { error: tagsError } = await supabase
            .from('recipe_tags')
            .insert(tagInserts);

          if (tagsError) throw tagsError;
        }
      }

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