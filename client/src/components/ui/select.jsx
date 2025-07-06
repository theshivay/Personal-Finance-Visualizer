import React from 'react';
import { cn } from '../../lib/utils';

export const Select = React.forwardRef(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-md border border-border bg-white px-3 py-2',
      'text-sm focus:outline-none focus:ring-2 focus:ring-primary-400',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
));

Select.displayName = 'Select';

export const SelectOption = React.forwardRef(({ className, ...props }, ref) => (
  <option
    ref={ref}
    className={cn('', className)}
    {...props}
  />
));

SelectOption.displayName = 'SelectOption';
