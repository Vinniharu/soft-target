"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  FolderCog,
  Plus,
  ScrollText,
  Users,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { listReports } from "@/lib/api/reports";
import { formatRelative, formatApiError } from "@/lib/utils/format";
import { useAuth } from "@/lib/auth/AuthContext";
import { roleLabel } from "@/lib/auth/roles";
import { useToast } from "@/lib/toast/ToastContext";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function DashboardPage() {
  const { user, isAdmin, isOrgOwner, organisation } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listReports({ limit: 6, offset: 0 });
        if (cancelled) return;
        setRecent(res.items || []);
        setTotal(res.total || 0);
      } catch (err) {
        toast.error("Failed to load reports", formatApiError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const firstName = (user?.name || user?.email || "there").split(/[\s@]/)[0];

  const today = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  const updatedThisWeek = useMemo(
    () =>
      recent.filter((r) => {
        const t = new Date(r.updated_at).getTime();
        return Number.isFinite(t) && Date.now() - t < ONE_WEEK_MS;
      }).length,
    [recent],
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <section className="pt-2 pb-10 md:pb-16">
        <div className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
          {today}
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-foreground)] leading-[1.05]">
          Welcome back,
          <br />
          <span className="text-[var(--color-primary)]">{firstName}.</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[var(--color-muted-foreground)] max-w-xl leading-relaxed">
          {loading
            ? "Loading your workspace…"
            : total === 0
              ? "Your workspace is empty. File your first investigation report to get started."
              : updatedThisWeek > 0
                ? `${total} ${total === 1 ? "report" : "reports"} on file, ${updatedThisWeek} ${updatedThisWeek === 1 ? "updated" : "updated"} this week.`
                : `${total} ${total === 1 ? "report" : "reports"} on file.`}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">
          <Link href="/reports/new" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Create a new report
            </Button>
          </Link>
          <Link href="/reports" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto">
              View all reports <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Overview */}
      <section className="border-t border-[var(--color-border)] py-10 md:py-12">
        <SectionLabel>Overview</SectionLabel>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-8">
          <Metric
            label={
              isAdmin
                ? "Reports system-wide"
                : isOrgOwner
                  ? "Organisation reports"
                  : "Your reports"
            }
            value={loading ? "—" : total.toString()}
          />
          <Metric
            label="Role"
            value={roleLabel(user?.role)}
            sub={organisation?.name}
          />
          <Metric label="Session" value="Active" indicator />
        </div>
      </section>

      {/* Recent reports — editorial list */}
      <section className="border-t border-[var(--color-border)] py-10 md:py-12">
        <div className="flex items-center justify-between">
          <SectionLabel>Recent reports</SectionLabel>
          <Link
            href="/reports"
            className="text-sm text-[var(--color-foreground)] hover:text-[var(--color-primary)] inline-flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 flex justify-center">
            <Spinner />
          </div>
        ) : recent.length === 0 ? (
          <div className="mt-10 border-t border-b border-[var(--color-border)] py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
              <FileText className="h-5 w-5" />
            </div>
            <p className="mt-4 text-base text-[var(--color-foreground)]">
              You haven't filed any reports yet.
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              Begin by creating one.
            </p>
            <div className="mt-6">
              <Link href="/reports/new">
                <Button>
                  <Plus className="h-4 w-4" /> Create report
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-6 border-t border-[var(--color-border)]">
            {recent.map((r) => (
              <li
                key={r.id}
                className="border-b border-[var(--color-border)]"
              >
                <Link
                  href={`/reports/${r.id}`}
                  className="group flex items-center justify-between gap-6 py-5 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-base font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                      {r.case_id}
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                      Version {r.version}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-sm text-[var(--color-muted-foreground)] hidden sm:block">
                      Updated {formatRelative(r.updated_at)}
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-[var(--color-muted-foreground)] group-hover:text-[var(--color-primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Org owner — subtle */}
      {isOrgOwner && (
        <section className="border-t border-[var(--color-border)] py-10 md:py-12">
          <SectionLabel>Organisation</SectionLabel>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AdminLink
              href="/org/reports"
              icon={FolderCog}
              title="Org reports"
              description="Every report filed by your members"
            />
            <AdminLink
              href="/org/users"
              icon={Users}
              title="Members"
              description="Add or edit operators in your org"
            />
          </div>
        </section>
      )}

      {/* Admin — subtle */}
      {isAdmin && (
        <section className="border-t border-[var(--color-border)] py-10 md:py-12">
          <SectionLabel>Administration</SectionLabel>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminLink
              href="/admin/organisations"
              icon={Building2}
              title="Organisations"
              description="Provision and manage tenants"
            />
            <AdminLink
              href="/admin/reports"
              icon={FolderCog}
              title="All reports"
              description="Edit or remove any record"
            />
            <AdminLink
              href="/admin/users"
              icon={Users}
              title="Users"
              description="Provision and manage staff"
            />
            <AdminLink
              href="/admin/audit"
              icon={ScrollText}
              title="Audit log"
              description="Review all system actions"
            />
          </div>
        </section>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
      {children}
    </div>
  );
}

function Metric({ label, value, indicator, sub }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--color-foreground)] tabular-nums">
        <span className="inline-flex items-baseline gap-2">
          {value}
          {indicator && (
            <span
              className="inline-block h-2 w-2 rounded-full bg-[var(--color-success)] translate-y-[-2px]"
              aria-hidden
            />
          )}
        </span>
      </div>
      <div className="mt-2 text-sm text-[var(--color-muted-foreground)]">
        {label}
        {sub ? <span className="block text-xs">{sub}</span> : null}
      </div>
    </div>
  );
}

function AdminLink({ href, icon: Icon, title, description }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 py-1 transition-colors"
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] group-hover:bg-[var(--color-primary-subtle)] group-hover:text-[var(--color-primary)] transition-colors">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors flex items-center gap-1">
          {title}
          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
          {description}
        </div>
      </div>
    </Link>
  );
}
