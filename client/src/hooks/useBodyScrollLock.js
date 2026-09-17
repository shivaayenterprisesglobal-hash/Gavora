import { useEffect } from 'react';

/**
 * Prevents the page behind an open drawer or modal from scrolling.
 *
 * `scrollbar-gutter: stable` on `html` (see index.css) reserves the scrollbar
 * width permanently, so locking overflow here does not shift the layout
 * sideways.
 */
export function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}

export default useBodyScrollLock;
