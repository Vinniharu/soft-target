"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-xl w-full text-center">
          {/* Brand */}
          <div className="inline-flex items-center gap-2.5 mb-12">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold text-sm shadow-sm">
              ST
            </div>
            <span className="text-sm font-medium text-[var(--color-foreground)]">
              Soft Target
            </span>
          </div>

          {/* Status eyebrow */}
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
            Status · 404
          </div>

          {/* Big number */}
          <div className="mt-3 text-7xl md:text-8xl font-semibold tracking-tight text-[var(--color-foreground)] tabular-nums leading-none">
            4<span className="text-[var(--color-primary)]">0</span>4
          </div>

          {/* Headline */}
          <h1 className="mt-8 text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            This lead went cold.
          </h1>

          {/* Comedic body */}
          <p className="mt-4 text-base text-[var(--color-muted-foreground)] leading-relaxed">
            We checked the case files. We ran the prints. We even called in a
            favor with the cybercrime unit.
            <br className="hidden sm:block" />
            This page is nowhere on the grid.
          </p>

          {/* Tongue-in-cheek detail block */}
          <div className="mt-8 inline-flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-left text-sm">
            <Search className="h-4 w-4 mt-0.5 text-[var(--color-muted-foreground)] flex-shrink-0" />
            <div>
              <div className="font-medium text-[var(--color-foreground)]">
                Last known location
              </div>
              <div className="mt-0.5 text-xs text-[var(--color-muted-foreground)] font-mono">
                {typeof window !== "undefined"
                  ? window.location.pathname
                  : "/—"}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 flex items-center justify-center">
            <Link href="/login">
              <Button size="lg">
                Back to base <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[var(--color-muted-foreground)]">
        © Soft Target · The page may have been redacted, archived, or never
        existed.
      </footer>
    </div>
  );
}
