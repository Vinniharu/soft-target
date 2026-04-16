"use client";

import React, { useEffect, useRef, useState } from "react";
import { LogOut, ChevronUp, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  const email = user.email || "";
  const name = user.name || email.split("@")[0] || "Operator";
  const role = user.role || "user";
  const initials = (user.name || email || "??")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
    .padEnd(2, "·")
    .slice(0, 2);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-[var(--color-surface-3)] transition-colors text-left"
      >
        <div className="h-8 w-8 flex-shrink-0 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center text-xs font-semibold">
          {initials}
        </div>
        <div className="flex-1 min-w-0 leading-tight">
          <div className="text-sm font-medium text-[var(--color-foreground)] truncate">
            {name}
          </div>
          <div className="text-[11px] text-[var(--color-muted-foreground)] truncate">
            {role === "admin" ? "Administrator" : "Operator"}
          </div>
        </div>
        <ChevronUp
          className={`h-3.5 w-3.5 text-[var(--color-muted-foreground)] transition-transform ${open ? "" : "rotate-180"}`}
        />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
            <div className="text-sm font-medium text-[var(--color-foreground)] truncate">
              {user.name || name}
            </div>
            <div className="text-xs text-[var(--color-muted-foreground)] truncate mt-0.5">
              {email}
            </div>
            <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium rounded bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border border-[var(--color-primary-subtle-border)]">
              <Shield className="h-3 w-3" />
              {role}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-surface-3)] transition-colors"
          >
            <LogOut className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
