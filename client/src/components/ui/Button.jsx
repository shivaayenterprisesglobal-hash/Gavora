import { Link } from 'react-router-dom';

import Spinner from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-control transition-[background-color,border-color,color,transform] duration-200 ease-out-soft active:translate-y-px disabled:opacity-55 disabled:pointer-events-none disabled:active:translate-y-0';

const variants = {
  primary: 'bg-gold-600 text-white hover:bg-gold-700 active:bg-gold-800',
  accent: 'bg-ink-900 text-canvas hover:bg-ink-800 active:bg-ink-950',
  outline: 'border border-ink-200 bg-canvas-raised text-ink-800 hover:border-ink-400 hover:bg-ink-50',
  subtle: 'bg-gold-50 text-gold-800 hover:bg-gold-100',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-50',
  danger: 'bg-danger-500 text-white hover:bg-danger-700',
  'on-dark': 'border border-white/30 bg-transparent text-canvas hover:bg-white/10',
};

const sizes = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[0.9375rem] sm:h-13 sm:px-7 sm:text-base',
};

/**
 * Renders a `button`, a router `Link` (when `to` is set) or an `a` (when `href`
 * is set) so every call site gets identical styling, focus behaviour and
 * loading treatment.
 *
 * While `loading` is true the button is disabled and announces itself via
 * aria-busy, which stops double submissions on forms and checkout.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  to,
  href,
  type = 'button',
  disabled,
  children,
  ...props
}) {
  const classes = cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className);
  const cursorHint = variant === 'ghost' || variant === 'subtle' ? 'link' : 'cta';

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} data-cursor={cursorHint} {...props}>
        {children}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a href={href} className={classes} data-cursor={cursorHint} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-cursor={cursorHint}
      {...props}
    >
      {loading && <Spinner size="sm" className="border-current/30 border-t-current" />}
      {children}
    </button>
  );
}

export default Button;
