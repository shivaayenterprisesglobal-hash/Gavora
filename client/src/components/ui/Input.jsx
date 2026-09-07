import { useId } from 'react';

import { cn } from '@/utils/cn';

/**
 * Labelled text input with inline error messaging. The label is always present
 * (never placeholder-only) and errors are wired via aria-describedby.
 */
export function Input({ label, hint, error, className, id, type = 'text', ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-ink-700 text-sm font-medium">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={cn(
          'rounded-control border bg-canvas-raised text-ink-900 placeholder:text-ink-300 h-11 w-full px-3.5 text-sm transition-colors',
          error ? 'border-danger-500' : 'border-ink-200 hover:border-ink-300',
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-danger-500 text-xs">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${inputId}-hint`} className="text-ink-400 text-xs">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export default Input;
