export interface Recipe {
  id: string;
  title: string;
  sourceUrl?: string;
  sourceType?: 'instagram' | 'tiktok' | 'manual' | 'text' | 'other';
  ingredients: Ingredient[];
  instructions: string[];
  servings: number;
  prepTime?: number; // in minutes
  cookTime?: number; // in minutes
  tags: string[];
  photos?: Photo[];
  notes?: Note[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  notes?: string;
}

export interface Photo {
  id: string;
  filePath: string;
  caption?: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
} 