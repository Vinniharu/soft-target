import React from "react";
import { Loader2 } from "lucide-react";

export function Spinner({ className = "", size = "default" }) {
  const sizes = {
    sm: "h-3.5 w-3.5",
    default: "h-5 w-5",
    lg: "h-8 w-8",
  };
  return (
    <Loader2
      className={`${sizes[size] || sizes.default} animate-spin text-[var(--color-primary)] ${className}`}
    />
  );
}

export function PageSpinner({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-[var(--color-muted-foreground)]">{label}</p>
    </div>
  );
}
