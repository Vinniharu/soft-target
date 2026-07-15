"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3, Info, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { ReportPreviewPanel } from "@/components/reports/ReportPreviewPanel";
import { getReport, deleteReport, downloadReportPdf } from "@/lib/api/reports";
import { apiToForm } from "@/lib/utils/mapReport";
import { formatDate, formatApiError } from "@/lib/utils/format";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/lib/toast/ToastContext";
import { canEditReport, canDeleteReport, ROLES } from "@/lib/auth/roles";

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params?.id;
  const toast = useToast();
  const { user } = useAuth();
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
    if (!report) return;
    setDeleting(true);
    try {
      await deleteReport(report.id);
      toast.success("Report deleted", report.case_id);
      const back =
        user?.role === ROLES.ADMIN
          ? "/admin/reports"
          : user?.role === ROLES.ORG_OWNER
            ? "/org/reports"
            : "/reports";
      router.push(back);
    } catch (err) {
      if (err?.status === 403) {
        toast.error(
          "Not allowed",
          "Only your organisation owner can delete reports.",
        );
      } else {
        toast.error("Delete failed", formatApiError(err));
      }
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
        <Link href="/reports">
          <Button className="mt-4">Back to reports</Button>
        </Link>
      </div>
    );
  }

  const formShape = apiToForm(report);
  const isCreator = !!user?.id && report.user_id === user.id;
  const canEdit = canEditReport(user, report);
  const canDelete = canDeleteReport(user, report);
  const creatorName = report.creator?.name || report.creator?.email;
  const creatorOrg = report.creator?.organisation?.name;

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/reports")}
        className="mb-3 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back to reports
      </Button>

      <PageHeader
        eyebrow={`Case · v${report.version}`}
        title={report.case_id}
        description={
          isCreator
            ? `Filed ${formatDate(report.created_at)} · updated ${formatDate(report.updated_at)}`
            : `Filed by ${creatorName || "another operator"}${creatorOrg ? ` · ${creatorOrg}` : ""}`
        }
        actions={
          <div className="flex items-center gap-2">
            {canEdit && (
              <Link href={`/reports/${report.id}/edit`}>
                <Button variant="outline">
                  <Edit3 className="h-4 w-4" /> Edit
                </Button>
              </Link>
            )}
            {canDelete && (
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(true)}
                className="text-[var(--color-danger)] border-red-200 hover:bg-[var(--color-danger-subtle)]"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Version {report.version}</Badge>
          <Badge variant="outline">ID {report.id.slice(0, 8)}</Badge>
          {!canEdit && <Badge>Read only</Badge>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReportPreviewPanel
            data={formShape}
            reportId={report.id}
            caseId={report.case_id}
            version={report.version}
            onDownloadServerPdf={() =>
              downloadReportPdf(report.id, report.case_id, report.version)
            }
          />
        </div>
        <div className="space-y-4">
          <Card>
            <div className="px-5 py-4 border-b border-[var(--color-border)]">
              <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                Report details
              </h3>
            </div>
            <CardContent className="p-5 space-y-3 text-sm">
              <MetaRow label="Case ID" value={report.case_id} />
              <MetaRow label="Version" value={`v${report.version}`} />
              <MetaRow
                label="Created by"
                value={creatorName || (isCreator ? "You" : "—")}
              />
              {creatorOrg && (
                <MetaRow label="Organisation" value={creatorOrg} />
              )}
              <MetaRow label="Report ID" value={report.id} mono truncate />
              <MetaRow label="Created" value={formatDate(report.created_at)} />
              <MetaRow label="Updated" value={formatDate(report.updated_at)} />
            </CardContent>
          </Card>

          {!isCreator && !canEdit && (
            <div className="flex gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 text-sm">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-[var(--color-muted-foreground)]" />
              <div className="text-[var(--color-muted-foreground)]">
                This report was filed by another operator. Only the creator,
                their organisation owner, or an administrator can make changes.
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${report.case_id}?`}
        description="This soft-deletes the report. The PDF on disk is preserved. This action can be reversed by the backend admin if needed."
        confirmLabel="Delete report"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function MetaRow({ label, value, mono, truncate }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[var(--color-muted-foreground)] flex-shrink-0">
        {label}
      </span>
      <span
        className={`text-[var(--color-foreground)] ${mono ? "font-mono text-xs" : "font-medium"} ${truncate ? "truncate" : ""}`}
        title={truncate ? value : undefined}
      >
        {value}
      </span>
    </div>
  );
}
