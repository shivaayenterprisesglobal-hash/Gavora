import { cn } from '@/utils/cn';

export function Card({ as: Tag = 'div', interactive = false, className, children, ...props }) {
  return (
    <Tag
      className={cn(
        'rounded-card border-ink-100 bg-canvas-raised shadow-card border',
        interactive && 'hover:shadow-card-hover ease-out-soft transition-shadow duration-300',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn('p-5 sm:p-6', className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
