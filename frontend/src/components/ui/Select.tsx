import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-primary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full bg-surface border border-default text-primary rounded-xl px-4 py-2.5 text-sm',
            'transition-all duration-200',
            'focus:outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/20',
            'hover:border-strong',
            error && 'border-accent',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-accent">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
