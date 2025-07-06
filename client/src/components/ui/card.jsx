import React from 'react';
import { cn } from '../../lib/utils';

export const Card = React.forwardRef(({ className, highlight = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark transition-all duration-200 p-6",
      highlight ? "shadow-glow border-primary-500/50" : "shadow-card-light dark:shadow-card-dark hover:shadow-md",
      "transform hover:-translate-y-1 transition-all duration-300",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-semibold leading-none text-foreground-light dark:text-foreground-dark", className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-light dark:text-muted-dark", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4 border-t border-border-light dark:border-border-dark mt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
