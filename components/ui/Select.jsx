import React from "react";
import { ChevronDown } from "lucide-react";

const Select = React.forwardRef(
  ({ className = "", label, hint, error, children, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-foreground)]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`flex h-10 w-full appearance-none rounded-md border bg-[var(--color-input)] pl-3 pr-9 py-2 text-sm text-[var(--color-foreground)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
              error
                ? "border-[var(--color-danger)]"
                : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
            } ${className}`}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
        </div>
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
Select.displayName = "Select";

export { Select };
