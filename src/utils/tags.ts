export const TAG_CATEGORIES: Record<string, string[]> = {
  'Meal Type': ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'drink'],
  'Cuisine': ['asian', 'indian', 'indonesian', 'italian', 'mexican', 'american', 'other'],
  'Protein': ['chicken', 'beef', 'pork', 'lamb', 'fish', 'vegetarian'],
  'Method': ['instant-pot'],
  'Effort': ['quick'],
};

export const getTagCategory = (tag: string): string => {
  for (const [name, tags] of Object.entries(TAG_CATEGORIES)) {
    if (tags.includes(tag)) return name;
  }
  return '';
};
