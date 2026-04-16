import React from "react";
import { Loader2 } from "lucide-react";

const Button = React.forwardRef(
  (
    {
      className = "",
      variant = "primary",
      size = "default",
      isLoading,
      children,
      ...props
    },
    ref,
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary:
        "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] shadow-sm",
      secondary:
        "bg-[var(--color-surface-1)] text-[var(--color-foreground)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] shadow-xs",
      outline:
        "bg-transparent text-[var(--color-foreground)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)]",
      ghost:
        "bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-surface-3)]",
      destructive:
        "bg-[var(--color-danger)] text-white hover:bg-[var(--color-primary-hover)] shadow-sm",
      subtle:
        "bg-[var(--color-primary-subtle)] text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]/70 border border-[var(--color-primary-subtle-border)]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      default: "h-9 px-4 text-sm",
      lg: "h-11 px-6 text-sm",
      icon: "h-9 w-9",
    };

    const variantStyles = variants[variant] || variants.primary;
    const sizeStyles = sizes[size] || sizes.default;

    return (
      <button
        className={`${base} ${variantStyles} ${sizeStyles} ${className}`}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };
