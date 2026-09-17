import { Link } from 'react-router-dom';

import { cn } from '@/utils/cn';

export function Logo({ to = '/', className, tone = 'dark' }) {
  return (
    <Link
      to={to}
      aria-label="Gavora home"
      className={cn('inline-flex items-center gap-1', className)}
    >
      <span
        className={cn(
          'font-display text-[1.6rem] leading-none font-bold tracking-tight',
          tone === 'dark' ? 'text-ink-900' : 'text-canvas',
        )}
      >
        Gavora
      </span>
      <span aria-hidden="true" className="bg-gold-500 mt-0.5 size-1.5 rounded-full" />
    </Link>
  );
}

export default Logo;
