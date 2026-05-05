"use client";

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DraftEditor } from "@/components/reports/DraftEditor";

export default function NewReportPage() {
  return (
    <div>
      <PageHeader
        eyebrow="New report"
        title="File a new investigation"
        description="Capture case details, primary target, and any soft target associations. Your work autosaves as you type."
      />
      <DraftEditor draftId={null} initialDraft={null} />
    </div>
  );
}
