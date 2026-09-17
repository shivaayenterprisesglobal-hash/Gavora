import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';

/**
 * Terminal state for a catalogue section whose request has failed.
 * Replaces skeletons so a failed load never looks like it is still in progress.
 */
export function SectionError({
  title = 'Could not load this section',
  error,
  onRetry,
  className,
}) {
  return (
    <Alert variant="danger" title={title} className={cn('mt-8', className)}>
      <p>{error?.message || 'The catalogue is temporarily unavailable. Please try again.'}</p>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </Alert>
  );
}

export default SectionError;
