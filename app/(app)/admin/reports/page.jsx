"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { AdminReportTable } from "@/components/admin/AdminReportTable";
import { listReports } from "@/lib/api/reports";
import { deleteReport } from "@/lib/api/adminReports";
import { useToast } from "@/lib/toast/ToastContext";
import { formatApiError } from "@/lib/utils/format";

const FETCH_LIMIT = 200;
const PAGE_SIZE = 25;
const ALL_CREATORS = "__all__";

function creatorKey(item) {
  return item.creator?.id || item.user_id || "unknown";
}

function creatorLabel(creator, fallbackUserId) {
  if (creator?.name) return creator.name;
  if (creator?.email) return creator.email;
  if (fallbackUserId) return `${fallbackUserId.slice(0, 8)}…`;
  return "Unknown";
}

export default function AdminReportsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [creatorFilter, setCreatorFilter] = useState(ALL_CREATORS);
  const [page, setPage] = useState(0);
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listReports({ limit: FETCH_LIMIT, offset: 0 });
      setAllItems(res.items || []);
      setServerTotal(res.total || (res.items || []).length);
    } catch (err) {
      toast.error("Failed to load reports", formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Reset to first page whenever the filter changes
  useEffect(() => {
    setPage(0);
  }, [creatorFilter]);

  // Build a unique creator list from the loaded items
  const creators = useMemo(() => {
    const map = new Map();
    for (const item of allItems) {
      const key = creatorKey(item);
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: creatorLabel(item.creator, item.user_id),
          email: item.creator?.email || null,
          count: 0,
        });
      }
      map.get(key).count += 1;
    }
    return [...map.values()].sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
    );
  }, [allItems]);

  // Apply filter
  const filtered = useMemo(() => {
    if (creatorFilter === ALL_CREATORS) return allItems;
    return allItems.filter((item) => creatorKey(item) === creatorFilter);
  }, [allItems, creatorFilter]);

  // Paginate
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  const handleDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await deleteReport(target.id);
      toast.success("Report deleted", target.case_id);
      setTarget(null);
      fetchAll();
    } catch (err) {
      toast.error("Delete failed", formatApiError(err));
    } finally {
      setDeleting(false);
    }
  };

  const filterActive = creatorFilter !== ALL_CREATORS;
  const description = filterActive
    ? `${total} of ${serverTotal} report${serverTotal === 1 ? "" : "s"} match this filter.`
    : `${serverTotal} report${serverTotal === 1 ? "" : "s"} across all operators. Edit or remove any record.`;

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Manage reports"
        description={description}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchAll}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
            <Link href="/reports/new">
              <Button>
                <Plus className="h-4 w-4" /> New report
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter bar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:max-w-xs">
          <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)] sm:flex-shrink-0">
            Filter by creator
          </label>
          <Select
            value={creatorFilter}
            onChange={(e) => setCreatorFilter(e.target.value)}
            disabled={loading || creators.length === 0}
          >
            <option value={ALL_CREATORS}>
              All creators ({allItems.length})
            </option>
            {creators.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label} ({c.count})
              </option>
            ))}
          </Select>
        </div>
        {filterActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCreatorFilter(ALL_CREATORS)}
          >
            <X className="h-3.5 w-3.5" /> Clear filter
          </Button>
        )}
      </div>

      {loading ? (
        <Card>
          <PageSpinner label="Loading reports" />
        </Card>
      ) : pageItems.length === 0 ? (
        <Card>
          {filterActive ? (
            <EmptyState
              icon={FileText}
              title="No matches"
              description="No reports were filed by the selected creator."
              action={
                <Button
                  variant="outline"
                  onClick={() => setCreatorFilter(ALL_CREATORS)}
                >
                  <X className="h-3.5 w-3.5" /> Clear filter
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={FileText}
              title="No reports"
              description="No investigation reports have been filed in the system yet."
            />
          )}
        </Card>
      ) : (
        <>
          <AdminReportTable items={pageItems} onDelete={setTarget} />
          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
              <div>
                Page {safePage + 1} of {pageCount} · {total} total
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage === 0}
                  onClick={() => setPage(Math.max(0, safePage - 1))}
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage(safePage + 1)}
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
          {serverTotal > FETCH_LIMIT && (
            <div className="mt-3 text-xs text-[var(--color-muted-foreground)]">
              Showing the most recent {FETCH_LIMIT} reports. Older reports
              aren't included in the filter.
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!target}
        onOpenChange={(open) => !open && setTarget(null)}
        title={target ? `Delete ${target.case_id}?` : "Delete report"}
        description="This soft-deletes the report. PDFs on disk are retained but the record is no longer accessible via the API."
        confirmLabel="Delete report"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
