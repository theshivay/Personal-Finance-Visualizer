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
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
        'disabled:opacity-50 disabled:pointer-events-none',
        {
          'bg-primary-500 text-white hover:bg-primary-600': variant === 'default',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
          'bg-transparent border border-border hover:bg-background/80': variant === 'outline',
          'bg-transparent hover:bg-background/80 underline-offset-4': variant === 'link',
        },
        {
          'h-10 px-4 py-2 text-sm': size === 'default',
          'h-9 px-3': size === 'sm',
          'h-11 px-8': size === 'lg',
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
