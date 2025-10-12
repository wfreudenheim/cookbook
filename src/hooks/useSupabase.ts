import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Recipe } from '../types/recipe';
import type { User } from '@supabase/supabase-js';

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
      .insert({ ...recipe, created_by: user?.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const updateRecipe = async (id: string, updates: Partial<Omit<Recipe, 'id' | 'created_at' | 'updated_at'>>) => {
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