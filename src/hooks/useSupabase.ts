import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Recipe } from '../types/recipe';

export function useSupabase() {
  const [user, setUser] = useState(supabase.auth.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getRecipes = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*');
    
    if (error) throw error;
    return data;
  };

  const createRecipe = async (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('recipes')
      .insert(recipe)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const deleteRecipe = async (id: string) => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  };

  return {
    user,
    loading,
    getRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    supabase, // Expose the client for advanced usage
  };
}
