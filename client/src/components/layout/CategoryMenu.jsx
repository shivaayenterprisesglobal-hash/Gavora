import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import Icon from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

/**
 * Desktop "Categories" dropdown.
 *
 * Opens on click rather than hover: a hover menu is unusable on touch-capable
 * laptops and unreachable by keyboard. Escape closes it and returns focus to
 * the trigger, and an outside click dismisses it.
 */
export function CategoryMenu({ categories = [] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          'inline-flex items-center gap-1.5 py-2 text-sm font-semibold transition-colors',
          open ? 'text-gold-700' : 'text-ink-600 hover:text-ink-900',
        )}
      >
        Categories
        <Icon
          name="chevronDown"
          size="xs"
          className={cn('transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="border-ink-100 bg-canvas-raised animate-fade-in rounded-card absolute top-full left-0 z-50 mt-3 w-[36rem] border p-3 shadow-panel">
          <ul className="grid grid-cols-2 gap-0.5">
            {categories.map((category) => (
              <li key={category._id}>
                <Link
                  to={`/shop?category=${category.slug}`}
                  onClick={() => setOpen(false)}
                  className="group hover:bg-ink-50 rounded-control flex items-start gap-3 p-2.5 transition-colors"
                >
                  <span className="bg-gold-500/80 mt-1.5 size-1.5 shrink-0 rounded-full" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="text-ink-900 block text-sm font-medium">{category.name}</span>
                    {category.description && (
                      <span className="text-ink-500 mt-0.5 block truncate text-xs">
                        {category.description}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            to="/shop"
            onClick={() => setOpen(false)}
            className="text-ink-700 hover:bg-ink-50 rounded-control border-ink-100 mt-1 flex items-center justify-between border-t px-2.5 py-2.5 text-sm font-medium transition-colors"
          >
            Browse everything
            <Icon name="arrowRight" size="sm" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default CategoryMenu;
