import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}, ref) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
        'disabled:opacity-50 disabled:pointer-events-none',
        'transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95',
        {
          'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-md hover:shadow-lg': variant === 'default',
          'bg-gradient-to-r from-destructive to-red-500 text-white hover:from-red-700 hover:to-red-600 shadow-md hover:shadow-lg': variant === 'destructive',
          'bg-transparent border border-border-light dark:border-border-dark hover:bg-background-light/80 dark:hover:bg-background-dark/80 text-foreground-light dark:text-foreground-dark': variant === 'outline',
          'bg-transparent hover:bg-background-light/80 dark:hover:bg-background-dark/80 underline-offset-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300': variant === 'link',
          'bg-gradient-to-r from-accent to-emerald-500 text-white hover:from-accent hover:to-emerald-600 shadow-md hover:shadow-lg': variant === 'success',
          'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 shadow-md hover:shadow-lg': variant === 'warning',
        },
        {
          'h-10 px-4 py-2 text-sm': size === 'default',
          'h-9 px-3 text-xs': size === 'sm',
          'h-11 px-8 text-base': size === 'lg',
        },
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
