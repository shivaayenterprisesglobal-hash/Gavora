import { useId } from 'react';

import Field from '@/components/ui/Field';
import { controlClass } from '@/components/ui/controlClass';
import Icon from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

/**
 * Native `select` with a custom chevron.
 *
 * Deliberately native rather than a custom listbox: the browser's own control
 * already handles keyboard interaction, typeahead and mobile pickers correctly,
 * and reimplementing that well is a lot of code to get subtly wrong.
 *
 * @param {{value: string, label: string}[]} options
 */
export function Select({ label, hint, error, className, id, options = [], srOnlyLabel = false, ...props }) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  const control = ({ describedBy }) => (
    <div className="relative">
      <select
        id={selectId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={cn(controlClass(error), 'h-11 appearance-none pr-10 pl-3.5')}
        data-cursor="input"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevronDown"
        size="sm"
        className="text-ink-400 pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
      />
    </div>
  );

  if (srOnlyLabel) {
    return (
      <div className={className}>
        <label htmlFor={selectId} className="sr-only">
          {label}
        </label>
        {control({ describedBy: undefined })}
      </div>
    );
  }

  return (
    <Field id={selectId} label={label} hint={hint} error={error} className={className}>
      {control}
    </Field>
  );
}

export default Select;
