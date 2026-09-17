import { useCallback, useEffect, useRef } from 'react';

import Icon from '@/components/ui/Icon';
import IconButton from '@/components/ui/IconButton';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';
import { cn } from '@/utils/cn';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const sides = {
  left: 'left-0 animate-slide-in-left',
  right: 'right-0 animate-slide-in-right',
};

/**
 * Slide-over panel used for mobile navigation and the shop filters.
 *
 * Implements the accessibility contract a modal surface needs: it is a labelled
 * dialog, Escape closes it, focus moves inside on open and is trapped while
 * open, focus returns to the trigger on close, and the page behind it cannot
 * scroll.
 */
export function Drawer({ open, onClose, title, side = 'left', className, children, footer }) {
  const panelRef = useRef(null);
  const restoreFocusRef = useRef(null);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;

    restoreFocusRef.current = document.activeElement;

    // Focus the panel itself rather than its first control, so a screen reader
    // announces the dialog title before its contents.
    const frame = requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      cancelAnimationFrame(frame);
      if (restoreFocusRef.current instanceof HTMLElement) {
        restoreFocusRef.current.focus();
      }
    };
  }, [open]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Wrap focus at both ends so Tab can never escape into the page behind.
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="animate-fade-in absolute inset-0 bg-ink-950/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          'bg-canvas absolute inset-y-0 flex w-[86%] max-w-sm flex-col shadow-panel focus:outline-none',
          sides[side],
          className,
        )}
      >
        <div className="border-ink-100 flex h-16 shrink-0 items-center justify-between border-b px-4">
          <h2 className="font-sans text-sm font-semibold tracking-wide uppercase">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <Icon name="close" />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>

        {footer && <div className="border-ink-100 shrink-0 border-t p-4">{footer}</div>}
      </div>
    </div>
  );
}

export default Drawer;
