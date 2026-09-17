import { useId } from 'react';

import Icon from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

/**
 * Checkbox with a styled indicator. The real input stays in the DOM and is
 * only visually hidden, so keyboard focus, form submission and screen-reader
 * semantics all behave natively.
 */
export function Checkbox({ label, description, className, id, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <span className="relative flex items-center">
        <input
          id={inputId}
          type="checkbox"
          className="peer size-[1.125rem] shrink-0 cursor-pointer appearance-none rounded-[0.3rem] border border-ink-300 bg-canvas-raised transition-colors checked:border-ink-900 checked:bg-ink-900"
          {...props}
        />
        <Icon
          name="check"
          size="xs"
          className="text-canvas pointer-events-none absolute left-[0.15rem] opacity-0 peer-checked:opacity-100"
        />
      </span>
      <label htmlFor={inputId} className="cursor-pointer text-sm leading-snug">
        <span className="text-ink-700">{label}</span>
        {description && <span className="text-ink-500 block text-xs">{description}</span>}
      </label>
    </div>
  );
}

/**
 * Radio rendered as a selectable card, used for payment method and saved
 * address pickers where the option needs room for supporting detail.
 */
export function RadioCard({ label, description, badge, icon, checked, className, id, children, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'rounded-card flex cursor-pointer gap-3 border p-4 transition-colors',
        checked ? 'border-ink-900 bg-ink-50/60' : 'border-ink-200 bg-canvas-raised hover:border-ink-300',
        className,
      )}
    >
      <input
        id={inputId}
        type="radio"
        checked={checked}
        className="mt-0.5 size-[1.125rem] shrink-0 cursor-pointer appearance-none rounded-full border border-ink-300 bg-canvas-raised transition-colors checked:border-[0.35rem] checked:border-ink-900"
        {...props}
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          {icon}
          <span className="text-ink-900 text-sm font-medium">{label}</span>
          {badge}
        </span>
        {description && <span className="text-ink-500 mt-1 block text-xs leading-relaxed">{description}</span>}
        {children}
      </span>
    </label>
  );
}

export default Checkbox;
