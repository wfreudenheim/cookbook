
interface ParsedRecipe {
  title: string;
  ingredients: {
    amount: string;
    unit: string;
    name: string;
    notes?: string;
  }[];
  instructions: string[];
  servings?: number;
  suggestedTags: string[];
}

export async function parseRecipeText(recipeText: string): Promise<ParsedRecipe> {
  try {
    const response = await fetch('/api/parse-recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipeText })
    });

    if (!response.ok) {
      throw new Error('Failed to parse recipe');
    }

    const parsedRecipe = await response.json();
    return parsedRecipe;
  } catch (error) {
    console.error('Error parsing recipe:', error);
    throw new Error('Failed to parse recipe. Please try again or enter manually.');
  }
} 