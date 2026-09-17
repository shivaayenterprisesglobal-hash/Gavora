import { useId, useState } from 'react';

import Field from '@/components/ui/Field';
import Icon from '@/components/ui/Icon';
import { controlClass } from '@/components/ui/controlClass';
import { cn } from '@/utils/cn';

export function Input({
  label,
  hint,
  error,
  required,
  className,
  id,
  type = 'text',
  srOnlyLabel = false,
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && visible ? 'text' : type;

  const control = ({ describedBy }) => (
    <div className="relative">
      <input
        id={inputId}
        type={resolvedType}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={cn(controlClass(error), 'h-12 px-3.5', isPassword && 'pr-12')}
        data-cursor="input"
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="text-ink-400 hover:text-ink-800 absolute inset-y-0 right-0 flex w-11 items-center justify-center"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          data-cursor="icon"
        >
          <Icon name={visible ? 'eyeOff' : 'eye'} size="sm" />
        </button>
      )}
    </div>
  );

  if (srOnlyLabel) {
    return (
      <div className={className}>
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
        {control({ describedBy: undefined })}
      </div>
    );
  }

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={className}>
      {control}
    </Field>
  );
}

export function Textarea({ label, hint, error, required, className, id, rows = 4, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={className}>
      {({ describedBy }) => (
        <textarea
          id={inputId}
          rows={rows}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={cn(controlClass(error), 'resize-y px-3.5 py-2.5')}
          {...props}
        />
      )}
    </Field>
  );
}

export default Input;
