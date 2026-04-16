"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReportForm } from "@/components/reports/ReportForm";
import { createReport } from "@/lib/api/reports";
import { useToast } from "@/lib/toast/ToastContext";

export default function NewReportPage() {
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (apiPayload) => {
    const created = await createReport(apiPayload);
    toast.success("Report created", `${created.case_id} · v${created.version}`);
    router.push(`/reports/${created.id}`);
  };

  return (
    <div>
      <PageHeader
        eyebrow="New report"
        title="File a new investigation"
        description="Capture case details, primary target, and any soft target associations."
      />
      <ReportForm
        mode="create"
        onSubmit={handleSubmit}
        submitLabel="Create report"
        backHref="/reports"
      />
    </div>
  );
}
