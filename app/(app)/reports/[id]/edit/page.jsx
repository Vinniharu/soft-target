"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReportForm } from "@/components/reports/ReportForm";
import { getReport, updateMyReport } from "@/lib/api/reports";
import { apiToForm } from "@/lib/utils/mapReport";
import { formatApiError } from "@/lib/utils/format";
import { useAuth } from "@/lib/auth/AuthContext";
import { canEditReport } from "@/lib/auth/roles";
import { useToast } from "@/lib/toast/ToastContext";

export default function EditReportPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params?.id;
  const toast = useToast();
  const { user, hydrated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (!reportId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getReport(reportId);
        if (cancelled) return;
        setReport(data);
      } catch (err) {
        if (!cancelled) {
          toast.error("Failed to load report", formatApiError(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reportId, toast]);

  const handleSubmit = async (apiPayload) => {
    try {
      const updated = await updateMyReport(reportId, apiPayload);
      toast.success("Report updated", `${updated.case_id} · v${updated.version}`);
      router.push(`/reports/${updated.id}`);
    } catch (err) {
      if (err?.status === 403) {
        toast.error(
          "Not allowed",
          "You don't have permission to edit this report.",
        );
        router.push(`/reports/${reportId}`);
        return;
      }
      throw err;
    }
  };

  if (loading || !hydrated) return <PageSpinner label="Loading report" />;

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

  if (!canEditReport(user, report)) {
    return (
      <div>
        <PageHeader title="Edit report" />
        <Card>
          <EmptyState
            icon={Lock}
            title="Access restricted"
            description="You don't have permission to edit this report. Ask the creator, your organisation owner, or an administrator if you need this report changed."
            action={
              <Link href={`/reports/${reportId}`}>
                <Button variant="outline">View report</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={`Case · v${report.version}`}
        title="Edit report"
        description="Saving will create a new version. The previous state is retained in the version history."
      />
      <ReportForm
        mode="edit"
        initialValues={apiToForm(report)}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        backHref={`/reports/${reportId}`}
      />
    </div>
  );
}
