import type { Recipe } from '../types/recipe';

export const QUICK_TAG = 'quick';

export const isQuick = (recipe: Recipe) => recipe.tags.includes(QUICK_TAG);

// Marks recipes tagged "quick": easy enough for a late weeknight, with no marinating or soaking
export const ClockIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    className={`inline-block shrink-0 ${className}`}
    role="img"
    aria-label="Quick"
  >
    <title>Quick</title>
    <circle cx="8" cy="8" r="6.25" />
    <path d="M8 4.5V8l2.5 1.5" />
  </svg>
);
