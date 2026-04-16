"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { ReportPreviewPanel } from "@/components/reports/ReportPreviewPanel";
import { getReport } from "@/lib/api/reports";
import { deleteReport } from "@/lib/api/adminReports";
import { apiToForm } from "@/lib/utils/mapReport";
import { formatDate, formatApiError } from "@/lib/utils/format";
import { useToast } from "@/lib/toast/ToastContext";

function creatorLabel(creator, fallbackUserId) {
  if (creator?.name) return creator.name;
  if (creator?.email) return creator.email;
  if (fallbackUserId) return `${fallbackUserId.slice(0, 8)}…`;
  return "Unknown";
}

export default function AdminReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params?.id;
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!reportId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getReport(reportId);
        if (!cancelled) setReport(data);
      } catch (err) {
        toast.error("Failed to load report", formatApiError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reportId, toast]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteReport(reportId);
      toast.success("Report deleted", report?.case_id);
      router.push("/admin/reports");
    } catch (err) {
      toast.error("Delete failed", formatApiError(err));
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) return <PageSpinner label="Loading report" />;
  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Report not found.
        </p>
        <Link href="/admin/reports">
          <Button className="mt-4">Back to manage reports</Button>
        </Link>
      </div>
    );
  }

  const formShape = apiToForm(report);
  const creatorName = creatorLabel(report.creator, report.user_id);
  const creatorEmail = report.creator?.email;

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/admin/reports")}
        className="mb-3 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back to manage reports
      </Button>

      <PageHeader
        eyebrow={`Admin view · v${report.version}`}
        title={report.case_id}
        description={`Filed ${formatDate(report.created_at)} · updated ${formatDate(report.updated_at)}`}
        actions={
          <>
            <Link href={`/admin/reports/${report.id}/edit`}>
              <Button variant="outline">
                <Edit3 className="h-4 w-4" /> Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(true)}
              className="text-[var(--color-danger)] border-red-200 hover:bg-[var(--color-danger-subtle)]"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Version {report.version}</Badge>
          <Badge variant="outline">By {creatorName}</Badge>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReportPreviewPanel
            data={formShape}
            reportId={report.id}
            caseId={report.case_id}
            version={report.version}
          />
        </div>
        <div>
          <Card>
            <div className="px-5 py-4 border-b border-[var(--color-border)]">
              <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                Report details
              </h3>
            </div>
            <CardContent className="p-5 space-y-3 text-sm">
              <MetaRow label="Case ID" value={report.case_id} />
              <MetaRow label="Version" value={`v${report.version}`} />
              <MetaRow label="Created by" value={creatorName} />
              {creatorEmail && creatorEmail !== creatorName && (
                <MetaRow label="Email" value={creatorEmail} />
              )}
              <MetaRow label="Report ID" value={report.id} mono />
              <MetaRow label="Owner ID" value={report.user_id} mono />
              <MetaRow label="Created" value={formatDate(report.created_at)} />
              <MetaRow label="Updated" value={formatDate(report.updated_at)} />
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${report.case_id}?`}
        description="This soft-deletes the report. PDFs on disk are retained but the record is no longer accessible via the API."
        confirmLabel="Delete report"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function MetaRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[var(--color-muted-foreground)] flex-shrink-0">
        {label}
      </span>
      <span
        className={`text-right break-all ${mono ? "font-mono text-xs" : "font-medium"} text-[var(--color-foreground)]`}
      >
        {value}
      </span>
    </div>
  );
}
