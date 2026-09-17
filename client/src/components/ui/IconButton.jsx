import { Link } from 'react-router-dom';

import { cn } from '@/utils/cn';

const base =
  'relative inline-flex items-center justify-center rounded-control transition-colors duration-200 ease-out-soft disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  ghost: 'text-ink-700 hover:bg-ink-50 hover:text-ink-900',
  'ghost-light': 'text-ink-200 hover:bg-ink-900 hover:text-canvas',
  outline: 'border border-ink-200 bg-canvas-raised text-ink-700 hover:border-ink-400',
  solid: 'bg-canvas-raised/95 text-ink-700 shadow-card hover:text-ink-900 backdrop-blur',
};

const sizes = { sm: 'size-10', md: 'size-11', lg: 'size-12' };

/**
 * Square control for icon-only actions. `label` is required and becomes the
 * accessible name, since there is no visible text to fall back on.
 */
export function IconButton({
  label,
  variant = 'ghost',
  size = 'md',
  className,
  to,
  type = 'button',
  children,
  ...props
}) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (to) {
    return (
      <Link to={to} aria-label={label} title={label} className={classes} data-cursor="icon" {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} aria-label={label} title={label} className={classes} data-cursor="icon" {...props}>
      {children}
    </button>
  );
}

export default IconButton;
