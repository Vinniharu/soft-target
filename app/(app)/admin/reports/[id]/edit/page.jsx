"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSpinner } from "@/components/ui/Spinner";
import { ReportForm } from "@/components/reports/ReportForm";
import { getReport } from "@/lib/api/reports";
import { updateReport } from "@/lib/api/adminReports";
import { apiToForm } from "@/lib/utils/mapReport";
import { formatApiError } from "@/lib/utils/format";
import { useToast } from "@/lib/toast/ToastContext";

export default function AdminEditReportPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params?.id;
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    if (!reportId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getReport(reportId);
        if (cancelled) return;
        setInitial(apiToForm(data));
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

  const handleSubmit = async (apiPayload) => {
    const updated = await updateReport(reportId, apiPayload);
    toast.success("Report updated", `${updated.case_id} · v${updated.version}`);
    router.push(`/admin/reports/${updated.id}`);
  };

  if (loading) return <PageSpinner label="Loading report" />;

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Edit report"
        description="Saving will create a new version. The previous state is retained in the version history."
      />
      <ReportForm
        mode="edit"
        initialValues={initial}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        backHref={`/admin/reports/${reportId}`}
      />
    </div>
  );
}
