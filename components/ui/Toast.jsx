"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const VARIANTS = {
  default: {
    icon: Info,
    iconColor: "text-[var(--color-primary)]",
    bg: "bg-[var(--color-primary-subtle)]",
  },
  success: {
    icon: CheckCircle2,
    iconColor: "text-[var(--color-success)]",
    bg: "bg-[var(--color-success-subtle)]",
  },
  error: {
    icon: AlertCircle,
    iconColor: "text-[var(--color-danger)]",
    bg: "bg-[var(--color-danger-subtle)]",
  },
};

export function Toast({ variant = "default", title, description, onDismiss }) {
  const { icon: Icon, iconColor, bg } = VARIANTS[variant] || VARIANTS.default;
  return (
    <div className="pointer-events-auto bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-md overflow-hidden flex items-start gap-3 p-4">
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${bg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <div className="text-sm font-semibold text-[var(--color-foreground)]">
            {title}
          </div>
        )}
        {description && (
          <div className="text-sm text-[var(--color-muted-foreground)] mt-0.5 break-words">
            {description}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 -mr-1 -mt-1 rounded p-1 text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-foreground)] transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
