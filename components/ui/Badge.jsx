import React from "react";

const Badge = ({ className = "", variant = "default", children, ...props }) => {
  const variants = {
    default:
      "border-transparent bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/80",
    secondary:
      "border-transparent bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:bg-[var(--color-secondary)]/80",
    destructive:
      "border-transparent bg-red-900 text-red-100 hover:bg-red-900/80",
    outline: "text-[var(--color-foreground)] border-[var(--color-border)]",
  };

  const variantStyles = variants[variant] || variants.default;

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Badge };
