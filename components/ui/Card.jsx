import React from "react";

const Card = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-card-foreground)] shadow-xs ${className}`}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1 p-6 ${className}`}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className = "", ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-base font-semibold leading-tight tracking-tight text-[var(--color-foreground)] ${className}`}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(
  ({ className = "", ...props }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-[var(--color-muted-foreground)] ${className}`}
      {...props}
    />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center p-6 pt-0 ${className}`}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
