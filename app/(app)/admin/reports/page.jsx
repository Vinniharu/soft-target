"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { AdminReportTable } from "@/components/admin/AdminReportTable";
import { listReports } from "@/lib/api/reports";
import { deleteReport } from "@/lib/api/adminReports";
import { useToast } from "@/lib/toast/ToastContext";
import { formatApiError } from "@/lib/utils/format";

const PAGE_SIZE = 25;

export default function AdminReportsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPage = useCallback(
    async (off) => {
      setLoading(true);
      try {
        const res = await listReports({ limit: PAGE_SIZE, offset: off });
        setItems(res.items || []);
        setTotal(res.total || 0);
      } catch (err) {
        toast.error("Failed to load reports", formatApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchPage(offset);
  }, [fetchPage, offset]);

  const handleDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await deleteReport(target.id);
      toast.success("Report deleted", target.case_id);
      setTarget(null);
      fetchPage(offset);
    } catch (err) {
      toast.error("Delete failed", formatApiError(err));
    } finally {
      setDeleting(false);
    }
  };

  const pageNum = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Manage reports"
        description={`${total} report${total === 1 ? "" : "s"} across all operators. Edit or remove any record.`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchPage(offset)}>
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

      {loading ? (
        <Card>
          <PageSpinner label="Loading reports" />
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No reports"
            description="No investigation reports have been filed in the system yet."
          />
        </Card>
      ) : (
        <>
          <AdminReportTable items={items} onDelete={setTarget} />
          <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
            <div>
              Page {pageNum} of {pageCount} · {total} total
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={offset + PAGE_SIZE >= total}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
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
