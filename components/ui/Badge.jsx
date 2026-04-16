import React from "react";

const Badge = ({ className = "", variant = "default", children, ...props }) => {
  const variants = {
    default:
      "bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border-[var(--color-primary-subtle-border)]",
    secondary:
      "bg-[var(--color-surface-3)] text-[var(--color-foreground)] border-[var(--color-border)]",
    success:
      "bg-[var(--color-success-subtle)] text-[var(--color-success)] border-emerald-200",
    warning:
      "bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border-amber-200",
    destructive:
      "bg-[var(--color-danger-subtle)] text-[var(--color-danger)] border-red-200",
    outline:
      "bg-transparent text-[var(--color-muted-foreground)] border-[var(--color-border)]",
  };

  const variantStyles = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge };
