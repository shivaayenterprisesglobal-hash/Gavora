import { Link } from 'react-router-dom';

import { cn } from '@/utils/cn';

export function Logo({ to = '/', className, tone = 'dark' }) {
  return (
    <Link
      to={to}
      aria-label="Gavora home"
      className={cn('inline-flex items-baseline gap-0.5', className)}
    >
      <span
        className={cn(
          'font-display text-2xl leading-none font-semibold tracking-tight',
          tone === 'dark' ? 'text-ink-900' : 'text-canvas',
        )}
      >
        Gavora
      </span>
      <span aria-hidden="true" className="bg-gold-500 size-1.5 rounded-full" />
    </Link>
  );
}

export default Logo;
