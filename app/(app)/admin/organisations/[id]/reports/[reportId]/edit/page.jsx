"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSpinner } from "@/components/ui/Spinner";
import { ReportForm } from "@/components/reports/ReportForm";
import {
  getOrganisationReport,
  updateOrganisationReport,
} from "@/lib/api/organisations";
import { apiToForm } from "@/lib/utils/mapReport";
import { formatApiError } from "@/lib/utils/format";
import { useToast } from "@/lib/toast/ToastContext";

export default function AdminEditOrganisationReportPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params?.id;
  const reportId = params?.reportId;
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    if (!orgId || !reportId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getOrganisationReport(orgId, reportId);
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
  }, [orgId, reportId, toast]);

  const handleSubmit = async (apiPayload) => {
    const updated = await updateOrganisationReport(orgId, reportId, apiPayload);
    toast.success("Report updated", `${updated.case_id} · v${updated.version}`);
    router.push(`/admin/organisations/${orgId}/reports/${updated.id}`);
  };

  if (loading) return <PageSpinner label="Loading report" />;

  return (
    <div>
      <PageHeader
        eyebrow="Administration · Organisation report"
        title="Edit report"
        description="Saving will create a new version. The previous state is retained in the version history."
      />
      <ReportForm
        mode="edit"
        initialValues={initial}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        backHref={`/admin/organisations/${orgId}/reports/${reportId}`}
      />
    </div>
  );
}
