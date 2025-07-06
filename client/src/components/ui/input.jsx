import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-border-light dark:border-border-dark px-3 py-2',
        'text-sm bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
        'placeholder:text-muted-light/70 dark:placeholder:text-muted-dark/70',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-all duration-200',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';
