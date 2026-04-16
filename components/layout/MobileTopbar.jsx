"use client";

import React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

export function MobileTopbar({ onMenuClick }) {
  return (
    <header className="md:hidden sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-card)]/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold text-xs shadow-sm">
            ST
          </div>
          <span className="text-sm font-semibold text-[var(--color-foreground)] truncate">
            Soft Target
          </span>
        </Link>
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 -mr-2 rounded-md text-[var(--color-foreground)] hover:bg-[var(--color-surface-3)] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
