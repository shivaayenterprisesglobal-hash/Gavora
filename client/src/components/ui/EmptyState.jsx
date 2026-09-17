import Icon from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

/**
 * Shared treatment for "there is nothing here" and "something went wrong".
 *
 * Every empty state gets an explanation and a way forward, so a customer is
 * never left on a dead end with no next action.
 */
export function EmptyState({ icon = 'package', title, description, actions, tone = 'neutral', className }) {
  const tones = {
    neutral: 'bg-ink-50 text-ink-500',
    danger: 'bg-danger-50 text-danger-500',
  };

  return (
    <div className={cn('flex flex-col items-center px-4 py-16 text-center', className)}>
      <span className={cn('flex size-14 items-center justify-center rounded-full', tones[tone])}>
        <Icon name={icon} size="lg" />
      </span>
      <h2 className="mt-5 text-xl sm:text-2xl">{title}</h2>
      {description && (
        <p className="text-ink-500 mt-2.5 max-w-md text-sm leading-relaxed">{description}</p>
      )}
      {actions && <div className="mt-7 flex flex-col gap-3 sm:flex-row">{actions}</div>}
    </div>
  );
}

export default EmptyState;
