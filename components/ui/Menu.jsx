"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MENU_WIDTH = 220;
const VIEWPORT_PAD = 8;

export function Menu({ open, onClose, anchorRect, children, align = "start" }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !anchorRect) {
      setPos(null);
      return;
    }
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const menuH = ref.current?.offsetHeight || 100;

    let left =
      align === "end"
        ? anchorRect.right - MENU_WIDTH
        : anchorRect.left;
    left = Math.max(VIEWPORT_PAD, Math.min(left, vpW - MENU_WIDTH - VIEWPORT_PAD));

    const spaceBelow = vpH - anchorRect.bottom;
    const flipUp = spaceBelow < menuH + VIEWPORT_PAD && anchorRect.top > menuH + VIEWPORT_PAD;
    const top = flipUp ? anchorRect.top - menuH - 4 : anchorRect.bottom + 4;

    setPos({ top, left });
  }, [open, anchorRect, align]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const node = (
    <div
      ref={ref}
      role="menu"
      style={{
        position: "fixed",
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        width: MENU_WIDTH,
        visibility: pos ? "visible" : "hidden",
      }}
      className="z-[60] rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg shadow-black/5 py-1"
    >
      {children}
    </div>
  );

  return createPortal(node, document.body);
}

export function MenuItem({ icon: Icon, onClick, children, danger = false }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-[var(--color-surface-2)] ${
        danger
          ? "text-[var(--color-danger)]"
          : "text-[var(--color-foreground)]"
      }`}
    >
      {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
}
