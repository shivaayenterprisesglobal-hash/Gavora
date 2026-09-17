import { Link } from 'react-router-dom';

import Icon from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

/**
 * Consistent heading block for storefront sections, with an optional trailing
 * link. `as` lets a section drop to h3 where the page's heading order requires
 * it, without changing the visual size.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  actionTo,
  as: Tag = 'h2',
  align = 'left',
  tone = 'dark',
  className,
}) {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        centered && 'sm:flex-col sm:items-center sm:text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', centered && 'text-center')}>
        {eyebrow && (
          <p className={cn('gv-eyebrow', tone === 'light' && 'text-gold-300')}>{eyebrow}</p>
        )}
        <Tag
          className={cn(
            'mt-2.5 text-2xl sm:text-3xl lg:text-4xl',
            tone === 'light' && 'text-canvas',
          )}
        >
          {title}
        </Tag>
        {description && (
          <p
            className={cn(
              'mt-3 text-sm leading-relaxed sm:text-base',
              tone === 'light' ? 'text-ink-300' : 'text-ink-500',
            )}
          >
            {description}
          </p>
        )}
      </div>

      {action && actionTo && (
        <Link
          to={actionTo}
          className={cn(
            'group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium transition-colors',
            tone === 'light' ? 'text-gold-200 hover:text-canvas' : 'text-gold-700 hover:text-gold-800',
          )}
        >
          {action}
          <Icon
            name="arrowRight"
            size="sm"
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </div>
  );
}

export default SectionHeading;
