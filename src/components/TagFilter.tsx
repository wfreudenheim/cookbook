
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
    <div className="space-y-2 md:space-y-4">
      {categories.map(category => (
        <div key={category.name} className="flex flex-wrap items-center gap-1.5 md:gap-2">
          <span className="text-text-secondary text-xs md:text-sm mr-1">{category.name}:</span>
          {category.tags.map(tag => {
            const isSelected = selectedTags.includes(tag);
            const count = tagCounts?.[tag];

            return (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={`text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1 rounded-sm transition-all duration-200 ${
                  isSelected
                    ? 'bg-accent-primary text-white font-medium shadow-sm'
                    : 'text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10'
                }`}
              >
                {tag}
                {count !== undefined && count > 0 && (
                  <span className={`ml-1 ${isSelected ? 'text-white/80' : 'text-text-secondary/70'}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
