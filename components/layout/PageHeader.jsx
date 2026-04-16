import React from "react";

export function PageHeader({ eyebrow, title, description, actions, children }) {
  return (
    <div className="flex flex-col gap-4 pb-6 mb-6 border-b border-[var(--color-border)] md:flex-row md:items-start md:justify-between">
      <div className="flex-1 min-w-0">
        {eyebrow && (
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-primary)] mb-1.5">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)] max-w-2xl">
            {description}
          </p>
        )}
        {children && <div className="mt-3">{children}</div>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
