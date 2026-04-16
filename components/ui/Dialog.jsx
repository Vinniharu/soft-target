"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Dialog({ open, onOpenChange, title, description, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="relative w-full max-w-lg rounded-lg bg-[var(--color-card)] shadow-lg border border-[var(--color-border)] animate-in fade-in zoom-in-95"
        style={{
          animationDuration: "150ms",
        }}
      >
        <div className="flex items-start justify-between p-6 border-b border-[var(--color-border)]">
          <div className="flex-1 min-w-0">
            {title && (
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            className="ml-4 -mr-2 -mt-1 rounded-md p-1.5 text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-foreground)] transition-colors"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children && <div className="p-6">{children}</div>}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface-2)] rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  destructive = false,
  loading = false,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "primary"}
            onClick={onConfirm}
            isLoading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
