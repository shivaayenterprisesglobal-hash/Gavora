import { cn } from '@/utils/cn';

const variants = {
  neutral: 'bg-ink-100 text-ink-700',
  ink: 'bg-ink-900 text-canvas',
  accent: 'bg-gold-600 text-white',
  'accent-soft': 'bg-gold-100 text-gold-800',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
  outline: 'border border-ink-200 text-ink-600',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[0.6875rem]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({ variant = 'neutral', size = 'md', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
