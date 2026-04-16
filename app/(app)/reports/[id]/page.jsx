"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { ReportPreviewPanel } from "@/components/reports/ReportPreviewPanel";
import { getReport } from "@/lib/api/reports";
import { apiToForm } from "@/lib/utils/mapReport";
import { formatDate, formatApiError } from "@/lib/utils/format";
import { useToast } from "@/lib/toast/ToastContext";

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params?.id;
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

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
        description={`Filed ${formatDate(report.created_at)} · updated ${formatDate(report.updated_at)}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Version {report.version}</Badge>
          <Badge variant="outline">ID {report.id.slice(0, 8)}</Badge>
          <Badge>Read only</Badge>
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
                value={
                  report.creator?.name ||
                  report.creator?.email ||
                  "You"
                }
              />
              <MetaRow label="Report ID" value={report.id} mono truncate />
              <MetaRow label="Created" value={formatDate(report.created_at)} />
              <MetaRow label="Updated" value={formatDate(report.updated_at)} />
            </CardContent>
          </Card>

          <div className="flex gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 text-sm">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-[var(--color-muted-foreground)]" />
            <div className="text-[var(--color-muted-foreground)]">
              Reports are immutable for operators. If this report needs a
              correction, request an edit from an administrator.
            </div>
          </div>
        </div>
      </div>
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
