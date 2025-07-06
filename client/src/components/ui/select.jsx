import React from 'react';
import { cn } from '../../lib/utils';

export const Select = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full appearance-none rounded-md border border-border-light dark:border-border-dark px-3 py-2',
        'text-sm bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-all duration-200',
        className
      )}
      {...props}
    />
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-light dark:text-muted-dark">
      <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </div>
  </div>
));

Select.displayName = 'Select';

export const SelectOption = React.forwardRef(({ className, ...props }, ref) => (
  <option
    ref={ref}
    className={cn('text-foreground-light dark:text-foreground-dark', className)}
    {...props}
  />
));

SelectOption.displayName = 'SelectOption';
