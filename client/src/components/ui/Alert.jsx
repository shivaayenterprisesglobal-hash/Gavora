import { forwardRef } from 'react';

import Icon from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

const variants = {
  info: { wrap: 'bg-ink-50 border-ink-200 text-ink-700', icon: 'info', iconColor: 'text-ink-500' },
  success: {
    wrap: 'bg-success-50 border-success-100 text-success-700',
    icon: 'check',
    iconColor: 'text-success-500',
  },
  warning: {
    wrap: 'bg-warning-50 border-warning-100 text-warning-700',
    icon: 'alert',
    iconColor: 'text-warning-500',
  },
  danger: {
    wrap: 'bg-danger-50 border-danger-100 text-danger-700',
    icon: 'alert',
    iconColor: 'text-danger-500',
  },
};

/**
 * Inline message block.
 *
 * Errors and warnings get role="alert" so assistive technology announces them
 * as soon as they appear; informational notices stay silent to avoid
 * interrupting the user for something they did not trigger. Assertive alerts
 * are focusable so a form can move keyboard focus here after a failed submit.
 */
export const Alert = forwardRef(function Alert({ variant = 'info', title, className, children }, ref) {
  const config = variants[variant];
  const assertive = variant === 'danger' || variant === 'warning';

  return (
    <div
      ref={ref}
      role={assertive ? 'alert' : 'note'}
      tabIndex={assertive ? -1 : undefined}
      className={cn(
        'rounded-card flex gap-3 border p-4',
        assertive && 'outline-none focus:outline-2 focus:outline-offset-2 focus:outline-gold-500',
        config.wrap,
        className,
      )}
    >
      <Icon name={config.icon} size="sm" className={cn('mt-0.5', config.iconColor)} />
      <div className="min-w-0 flex-1 text-sm">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn('leading-relaxed', title && 'mt-1')}>{children}</div>}
      </div>
    </div>
  );
});

export default Alert;
