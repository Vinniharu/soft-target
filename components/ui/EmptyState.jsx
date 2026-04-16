import React from "react";

export function EmptyState({
  icon: Icon,
  title = "No data",
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)] mb-4">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--color-foreground)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-[var(--color-muted-foreground)]">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
