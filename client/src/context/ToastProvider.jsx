import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Icon from '@/components/ui/Icon';
import { ToastContext } from '@/context/toastContext';
import { cn } from '@/utils/cn';

const DISMISS_AFTER_MS = 3500;

const tones = {
  success: { wrap: 'border-success-100 bg-canvas-raised', icon: 'check', color: 'text-success-500' },
  info: { wrap: 'border-ink-200 bg-canvas-raised', icon: 'info', color: 'text-ink-500' },
  danger: { wrap: 'border-danger-100 bg-canvas-raised', icon: 'alert', color: 'text-danger-500' },
};

/**
 * Transient confirmation messages, used for actions whose result would
 * otherwise be invisible — adding to cart, saving an address, copying a link.
 *
 * Announced through a polite live region so it does not interrupt whatever a
 * screen reader is currently reading, and dismissed automatically since none of
 * these messages require action.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (message, { tone = 'success', action } = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((current) => [...current.slice(-2), { id, message, tone, action }]);

      const timer = setTimeout(() => dismiss(id), DISMISS_AFTER_MS);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  // Clear any pending timers if the provider itself unmounts.
  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    },
    [],
  );

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {toasts.map((toast) => {
          const tone = tones[toast.tone] ?? tones.info;

          return (
            <div
              key={toast.id}
              className={cn(
                'rounded-card shadow-panel animate-rise pointer-events-auto flex w-full max-w-sm items-start gap-3 border p-3.5',
                tone.wrap,
              )}
            >
              <Icon name={tone.icon} size="sm" className={cn('mt-0.5', tone.color)} />
              <p className="text-ink-800 min-w-0 flex-1 text-sm">{toast.message}</p>
              {toast.action}
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="text-ink-400 hover:text-ink-700 -m-1 shrink-0 p-1 transition-colors"
              >
                <Icon name="close" size="sm" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
