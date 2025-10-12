import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../types/database';

type DbTables = Database['public']['Tables'];
type Recipe = DbTables['recipes']['Row'];

// Define the shape of a new recipe (excluding auto-generated fields)
interface NewRecipe {
  title: string;
  source_url: string | null;
  source_type: string | null;
  ingredients: {
    name: string;
    amount: string;
    unit: string;
    notes?: string;
  }[];
  instructions: string[];
  servings: number;
  prep_time: number | null;
  cook_time: number | null;
  created_by?: string;
}

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

  const createRecipe = async (recipe: Omit<NewRecipe, 'created_by'>) => {
    const newRecipe: NewRecipe = {
      ...recipe,
      created_by: user?.id ?? null
    };

    const { data, error } = await supabase
      .from('recipes')
      .insert(newRecipe)
      .select()
      .single();
    
    if (error) throw error;
    return data as Recipe;
  };

  const updateRecipe = async (id: string, updates: Partial<NewRecipe>) => {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
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