import { cn } from '@/utils/cn';

const sizes = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-9 border-[3px]',
};

export function Spinner({ size = 'md', className, label = 'Loading' }) {
  return (
    <span role="status" aria-label={label} className="inline-flex">
      <span
        className={cn(
          'border-ink-200 border-t-gold-500 animate-spin rounded-full',
          sizes[size],
          className,
        )}
      />
    </span>
  );
}

export default Spinner;
