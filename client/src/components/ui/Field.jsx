import { cn } from '@/utils/cn';

/**
 * Shared label / hint / error scaffolding for form controls.
 *
 * Centralising it keeps every field in the app aligned on the same rules: the
 * label is always visible (never placeholder-only), errors replace hints rather
 * than stacking, and the control is wired to whichever message is showing via
 * aria-describedby.
 */
export function Field({ id, label, hint, error, required, className, children }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-ink-700 text-sm font-medium">
          {label}
          {required && (
            <span className="text-danger-500 ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {typeof children === 'function' ? children({ describedBy }) : children}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-danger-500 text-xs">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-ink-500 text-xs">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export default Field;
