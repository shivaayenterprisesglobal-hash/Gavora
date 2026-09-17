import { cn } from '@/utils/cn';

/**
 * Intentional empty catalogue section. Used only when the API succeeded
 * with no items — never as a stand-in for a failed request.
 */
export function SectionEmpty({ children, className }) {
  return (
    <p
      className={cn(
        'text-ink-500 border-ink-100 bg-canvas-raised rounded-card mt-8 border px-4 py-8 text-center text-sm',
        className,
      )}
    >
      {children}
    </p>
  );
}

export default SectionEmpty;
