import React from 'react';

interface TagCategory {
  name: string;
  tags: string[];
}

const categories: TagCategory[] = [
  {
    name: 'Meal Type',
    tags: ['breakfast', 'lunch', 'dinner', 'dessert', 'snack']
  },
  {
    name: 'Cuisine',
    tags: ['asian', 'italian', 'mexican', 'american', 'other']
  },
  {
    name: 'Protein',
    tags: ['chicken', 'beef', 'pork', 'fish', 'vegetarian']
  }
];

interface TagFilterProps {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  tagCounts?: Record<string, number>;
}

export const TagFilter = ({ selectedTags, onTagToggle, tagCounts }: TagFilterProps) => {
  return (
    <div className="space-y-4">
      {categories.map(category => (
        <div key={category.name} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-sm">{category.name}:</span>
            <div className="flex flex-wrap gap-4">
              {category.tags.map(tag => {
                const isSelected = selectedTags.includes(tag);
                const count = tagCounts?.[tag];
                
                return (
                  <button
                    key={tag}
                    onClick={() => onTagToggle(tag)}
                    className={`text-sm transition-colors duration-200 hover:text-accent-primary ${
                      isSelected ? 'text-accent-primary' : 'text-text-secondary'
                    }`}
                  >
                    {tag}
                    {count !== undefined && count > 0 && (
                      <span className={`${isSelected ? 'text-accent-primary/70' : 'text-text-secondary/70'}`}>
                        {' '}({count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 