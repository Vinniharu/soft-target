"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  ScrollText,
  FolderCog,
  Plus,
  Shield,
  Building2,
  Briefcase,
  NotebookPen,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { UserMenu } from "./UserMenu";

function NavItem({ href, icon: Icon, label, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary)]"
          : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-foreground)]"
      }`}
    >
      <Icon
        className={`h-4 w-4 flex-shrink-0 ${
          active
            ? "text-[var(--color-primary)]"
            : "text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)]"
        }`}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function NavSection({ label, icon: Icon, children }) {
  return (
    <div className="px-3 pt-4 first:pt-0">
      <div className="flex items-center gap-1.5 px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {Icon && <Icon className="h-3 w-3" />}
        <span>{label}</span>
      </div>
      <nav className="flex flex-col gap-0.5">{children}</nav>
    </div>
  );
}

export function Sidebar({ open = false, onNavigate }) {
  const pathname = usePathname() || "";
  const { isAdmin, isOrgOwner, organisation } = useAuth();

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/reports") {
      return (
        pathname === "/reports" ||
        (pathname.startsWith("/reports/") &&
          !pathname.startsWith("/reports/drafts") &&
          !pathname.startsWith("/admin"))
      );
    }
    if (href === "/reports/drafts") {
      return pathname.startsWith("/reports/drafts");
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onNavigate}
        aria-hidden
      />

      {/* Sidebar — drawer on mobile, sticky on desktop */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw]
          flex-shrink-0 border-r border-[var(--color-border)] bg-[var(--color-card)]
          flex flex-col h-screen
          transform transition-transform duration-200 ease-out
          md:static md:z-auto md:w-64 md:max-w-none md:translate-x-0
          md:transform-none md:transition-none md:sticky md:top-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand + close */}
        <div className="px-5 py-5 border-b border-[var(--color-border)] flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="flex items-center gap-2.5 min-w-0"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold text-sm shadow-sm">
              ST
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-semibold text-[var(--color-foreground)] truncate">
                Soft Target
              </span>
              <span className="text-[11px] text-[var(--color-muted-foreground)] truncate">
                {organisation?.name || "Operations console"}
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onNavigate}
            className="md:hidden p-1.5 rounded-md text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-3)]"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Report CTA */}
        <div className="px-3 pt-3">
          <Link
            href="/reports/new"
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 w-full h-9 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] text-sm font-medium shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            New report
          </Link>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto scrollbar-thin pt-2 pb-4">
          <NavSection label="Workspace">
            <NavItem
              href="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              active={isActive("/dashboard")}
              onClick={onNavigate}
            />
            <NavItem
              href="/reports"
              icon={FileText}
              label="My reports"
              active={isActive("/reports")}
              onClick={onNavigate}
            />
            <NavItem
              href="/reports/drafts"
              icon={NotebookPen}
              label="Drafts"
              active={isActive("/reports/drafts")}
              onClick={onNavigate}
            />
          </NavSection>

          {isOrgOwner && (
            <NavSection label="Organisation" icon={Briefcase}>
              <NavItem
                href="/org/reports"
                icon={FolderCog}
                label="Org reports"
                active={isActive("/org/reports")}
                onClick={onNavigate}
              />
              <NavItem
                href="/org/users"
                icon={Users}
                label="Members"
                active={isActive("/org/users")}
                onClick={onNavigate}
              />
            </NavSection>
          )}

          {isAdmin && (
            <NavSection label="Administration" icon={Shield}>
              <NavItem
                href="/admin/organisations"
                icon={Building2}
                label="Organisations"
                active={isActive("/admin/organisations")}
                onClick={onNavigate}
              />
              <NavItem
                href="/admin/reports"
                icon={FolderCog}
                label="All reports"
                active={isActive("/admin/reports")}
                onClick={onNavigate}
              />
              <NavItem
                href="/admin/users"
                icon={Users}
                label="Users"
                active={isActive("/admin/users")}
                onClick={onNavigate}
              />
              <NavItem
                href="/admin/audit"
                icon={ScrollText}
                label="Audit log"
                active={isActive("/admin/audit")}
                onClick={onNavigate}
              />
            </NavSection>
          )}
        </div>

        {/* User chip */}
        <div className="border-t border-[var(--color-border)] p-3">
          <UserMenu />
        </div>
      </aside>
    </>
  );
}
