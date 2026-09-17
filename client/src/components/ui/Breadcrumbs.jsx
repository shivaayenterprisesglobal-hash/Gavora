import { Link } from 'react-router-dom';

import Icon from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

/**
 * Breadcrumb trail. The final entry is the current page, so it is rendered as
 * plain text with aria-current rather than a link to where the user already is.
 *
 * @param {{label: string, to?: string}[]} items
 */
export function Breadcrumbs({ items = [], className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="text-ink-500 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {isLast || !item.to ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn('truncate', isLast && 'text-ink-700 font-medium')}
                >
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="hover:text-ink-700 truncate transition-colors">
                  {item.label}
                </Link>
              )}
              {!isLast && <Icon name="chevronRight" size="xs" className="text-ink-300" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
