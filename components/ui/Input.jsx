import React from "react";

const Input = React.forwardRef(
  ({ className = "", type, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1 w-full">
        {label && (
          <label className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted-foreground)]">
            {label}
          </label>
        )}
        <input
          type={type}
          className={`flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 text-[var(--color-foreground)] font-mono transition-all duration-200 ${className}`}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-500 font-mono">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
