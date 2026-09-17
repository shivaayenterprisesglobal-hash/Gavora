import { cn } from '@/utils/cn';

/**
 * Inline icon set.
 *
 * Kept in-repo rather than pulling an icon package: the storefront needs about
 * twenty glyphs, and shipping a whole library for that would cost more than it
 * saves. Every path is drawn on a 24x24 grid with a 1.75 stroke so the set
 * looks consistent at any size.
 */
const paths = {
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm6-2 4 4',
  cart: 'M3 4h2l2.4 11.2A2 2 0 0 0 9.35 17h8.4a2 2 0 0 0 1.96-1.6L21 8H6M9 21h.01M18 21h.01',
  user: 'M20 21v-1a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v1M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  heart:
    'M12 20s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 7.5 4.5 4.5 0 0 1 19 10.5C19 15.65 12 20 12 20Z',
  menu: 'M3 6h18M3 12h18M3 18h18',
  close: 'M6 6l12 12M18 6L6 18',
  chevronDown: 'm6 9 6 6 6-6',
  chevronRight: 'm9 6 6 6-6 6',
  chevronLeft: 'm15 6-6 6 6 6',
  minus: 'M5 12h14',
  plus: 'M12 5v14M5 12h14',
  check: 'm5 13 4 4L19 7',
  trash: 'M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6',
  shield: 'M12 21s7-3.5 7-9V6l-7-3-7 3v6c0 5.5 7 9 7 9Z',
  truck: 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  headset: 'M4 13v-1a8 8 0 0 1 16 0v1M4 13a2 2 0 0 1 2 2v2a2 2 0 0 1-4 0v-2a2 2 0 0 1 2-2ZM20 13a2 2 0 0 1 2 2v2a2 2 0 0 1-4 0v-2a2 2 0 0 1 2-2ZM18 19v1a2 2 0 0 1-2 2h-3',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  filter: 'M4 6h16M7 12h10M10 18h4',
  sort: 'M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3',
  package: 'M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8',
  mapPin: 'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11ZM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  card: 'M2 7h20v10H2zM2 11h20',
  cash: 'M2 7h20v10H2zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  arrowRight: 'M4 12h16m0 0-6-6m6 6-6 6',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 8h.01',
  alert: 'M12 3 2 20h20L12 3ZM12 10v4M12 17h.01',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  phone: 'M5 3h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z',
  star: 'm12 3.5 2.6 5.6 6 .7-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.8l6-.7z',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  logout: 'M15 17l5-5-5-5M20 12H9M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeOff:
    'M3 3l18 18M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-4.2 4.8M6.1 6.1C3.5 8 2 12 2 12s3.5 7 10 7c1.5 0 2.9-.3 4.1-.8',
};

const sizes = { xs: 'size-3.5', sm: 'size-4', md: 'size-5', lg: 'size-6', xl: 'size-8' };

export function Icon({ name, size = 'md', filled = false, className, label }) {
  const path = paths[name];
  if (!path) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : 'true'}
      role={label ? 'img' : undefined}
      aria-label={label}
      className={cn('shrink-0', sizes[size], className)}
    >
      <path d={path} />
    </svg>
  );
}

export default Icon;
