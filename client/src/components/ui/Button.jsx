import { Link } from 'react-router-dom';

import { cn } from '@/utils/cn';

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-control transition-colors duration-200 ease-out-soft disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  primary: 'bg-ink-900 text-canvas hover:bg-ink-800 active:bg-ink-950',
  accent: 'bg-gold-500 text-ink-950 hover:bg-gold-400 active:bg-gold-600',
  outline: 'border border-ink-200 bg-transparent text-ink-800 hover:border-ink-400 hover:bg-ink-50',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-50',
  danger: 'bg-danger-500 text-white hover:bg-danger-700',
};

const sizes = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
};

/**
 * Renders a `button`, a router `Link` (when `to` is set) or an `a` (when `href`
 * is set) so every call site gets identical styling and focus behaviour.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  to,
  href,
  type = 'button',
  children,
  ...props
}) {
  const classes = cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className);

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;
