import React from 'react';
import { cn } from '../../lib/utils';

export const Label = React.forwardRef(({ className, required, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'text-sm font-medium leading-none mb-2 block text-foreground-light dark:text-foreground-dark',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
    {...props}
  >
    {props.children}
    {required && <span className="text-destructive ml-1">*</span>}
  </label>
));

Label.displayName = 'Label';
