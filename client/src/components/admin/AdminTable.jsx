import { cn } from '@/utils/cn';

/** Horizontal scroll on small screens so admin tables never blow out the layout. */
export function AdminTable({ children, className, minClassName = 'min-w-[44rem]' }) {
  return (
    <div className={cn('border-ink-100 overflow-x-auto rounded-card border bg-canvas-raised', className)}>
      <table className={cn('w-full text-left text-sm', minClassName)}>{children}</table>
    </div>
  );
}

export function AdminTh({ children, className }) {
  return (
    <th className={cn('text-ink-500 px-4 py-3 text-xs font-medium tracking-wide uppercase', className)}>
      {children}
    </th>
  );
}

export function AdminTd({ children, className, ...props }) {
  return (
    <td className={cn('px-4 py-3 align-top', className)} {...props}>
      {children}
    </td>
  );
}

export default AdminTable;
