import { cn } from '@/utils/cn';

export function Container({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag className={cn('gv-container', className)} {...props}>
      {children}
    </Tag>
  );
}

export default Container;
