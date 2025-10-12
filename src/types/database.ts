export interface Database {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string;
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
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: Omit<Database['public']['Tables']['recipes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['recipes']['Insert']>;
      };
      recipe_tags: {
        Row: {
          id: string;
          recipe_id: string;
          tag_name: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['recipe_tags']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['recipe_tags']['Insert']>;
      };
      recipe_photos: {
        Row: {
          id: string;
          recipe_id: string;
          file_path: string;
          caption: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['recipe_photos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['recipe_photos']['Insert']>;
      };
      recipe_notes: {
        Row: {
          id: string;
          recipe_id: string;
          note: string;
          created_at: string;
          created_by: string;
        };
        Insert: Omit<Database['public']['Tables']['recipe_notes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['recipe_notes']['Insert']>;
      };
      pantry_staples: {
        Row: {
          id: string;
          ingredient_name: string;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pantry_staples']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['pantry_staples']['Insert']>;
      };
      grocery_lists: {
        Row: {
          id: string;
          name: string;
          recipe_ids: string[];
          items: {
            name: string;
            totalAmount: string;
            unit: string;
            category: string;
            fromRecipes: string[];
          }[];
          created_at: string;
          created_by: string;
        };
        Insert: Omit<Database['public']['Tables']['grocery_lists']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['grocery_lists']['Insert']>;
      };
    };
  };
}
