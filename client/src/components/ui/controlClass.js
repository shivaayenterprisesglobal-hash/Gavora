/**
 * Shared input/select surface. Kept out of Field.jsx so that file exports
 * components only and Fast Refresh stays reliable.
 */
export const controlClass = (error) =>
  [
    'rounded-control border bg-canvas-raised text-ink-900 placeholder:text-ink-300 w-full text-sm transition-colors focus:outline-none',
    error ? 'border-danger-500' : 'border-ink-200 hover:border-ink-300 focus:border-gold-600',
  ]
    .filter(Boolean)
    .join(' ');
