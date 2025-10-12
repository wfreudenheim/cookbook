import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../types/database';

type DbTables = Database['public']['Tables'];
type Recipe = DbTables['recipes']['Row'];
type RecipeInsert = DbTables['recipes']['Insert'];
type RecipeUpdate = DbTables['recipes']['Update'];

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
    return data as Recipe[];
  };

  const createRecipe = async (recipe: Omit<RecipeInsert, 'created_by'>) => {
    const { data, error } = await supabase
      .from('recipes')
      .insert([{  // Wrap in array for Supabase's typing
        ...recipe,
        created_by: user?.id || undefined
      }] satisfies RecipeInsert[])
      .select()
      .single();
    
    if (error) throw error;
    return data as Recipe;
  };

  const updateRecipe = async (id: string, updates: Partial<RecipeUpdate>) => {
    const { data, error } = await supabase
      .from('recipes')
      .update([{  // Wrap in array for Supabase's typing
        ...updates
      }] satisfies RecipeUpdate[])
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Recipe;
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