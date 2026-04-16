import React from "react";

const Textarea = React.forwardRef(
  ({ className = "", label, hint, error, rows = 4, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-foreground)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`flex w-full rounded-md border bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-y ${
            error
              ? "border-[var(--color-danger)]"
              : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
          } ${className}`}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-[var(--color-muted-foreground)]">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-[var(--color-danger)]">{error}</p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
