export const TAG_CATEGORIES: Record<string, string[]> = {
  'Meal Type': ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'drink'],
  'Cuisine': ['asian', 'indian', 'italian', 'mexican', 'american', 'other'],
  'Protein': ['chicken', 'beef', 'pork', 'lamb', 'fish', 'vegetarian'],
  'Method': ['instant-pot'],
};

export const getTagCategory = (tag: string): string => {
  for (const [name, tags] of Object.entries(TAG_CATEGORIES)) {
    if (tags.includes(tag)) return name;
  }
  return '';
};
