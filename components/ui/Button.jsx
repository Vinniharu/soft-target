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
    const baseStyles =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 font-mono tracking-wide uppercase text-sm";

    const variants = {
      primary:
        "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/90 shadow-[0_0_10px_var(--color-primary)]/20",
      secondary:
        "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:bg-[var(--color-secondary)]/80 border border-[var(--color-border)]",
      destructive:
        "bg-red-900 text-red-100 hover:bg-red-900/90 border border-red-800",
      ghost:
        "hover:bg-[var(--color-secondary)] hover:text-[var(--color-secondary-foreground)]",
      outline:
        "border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-secondary)] text-[var(--color-foreground)]",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };

    const variantStyles = variants[variant] || variants.primary;
    const sizeStyles = sizes[size] || sizes.default;

    return (
      <button
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };
