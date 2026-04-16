"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSpinner } from "@/components/ui/Spinner";
import { ReportForm } from "@/components/reports/ReportForm";
import { createReport } from "@/lib/api/reports";
import { getDraft, saveDraft, clearDraft } from "@/lib/api/drafts";
import { emptyForm } from "@/lib/utils/mapReport";
import { useToast } from "@/lib/toast/ToastContext";

export default function NewReportPage() {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState(null);
  const [draftRestoredAt, setDraftRestoredAt] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState({
    state: "idle",
    lastSavedAt: null,
  });

  // Block autosave once the user submits — prevents a stale PUT after we
  // DELETE the draft on success.
  const submittingRef = useRef(false);

  // Load the existing draft on mount (if any).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const draft = await getDraft();
        if (cancelled) return;
        if (draft?.payload) {
          setInitial(draft.payload);
          if (draft.updated_at) setDraftRestoredAt(draft.updated_at);
        } else {
          setInitial(emptyForm());
        }
      } catch {
        // Failed to load draft; start with an empty form rather than blocking.
        setInitial(emptyForm());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAutoSave = useCallback(async (formState) => {
    if (submittingRef.current) return;
    setAutoSaveStatus((s) => ({ ...s, state: "saving" }));
    try {
      const res = await saveDraft(formState);
      if (submittingRef.current) return;
      setAutoSaveStatus({
        state: "saved",
        lastSavedAt: res?.updated_at || new Date().toISOString(),
      });
    } catch (err) {
      if (submittingRef.current) return;
      setAutoSaveStatus((s) => ({
        ...s,
        state: "error",
        error: err?.message,
      }));
    }
  }, []);

  const handleDiscardDraft = useCallback(async () => {
    try {
      await clearDraft();
    } catch {
      // best-effort
    }
    setInitial(emptyForm());
    setDraftRestoredAt(null);
    setAutoSaveStatus({ state: "idle", lastSavedAt: null });
    toast.success("Draft discarded", "Starting with a blank form.");
  }, [toast]);

  const handleSubmit = async (apiPayload) => {
    submittingRef.current = true;
    try {
      const created = await createReport(apiPayload);
      // Clear server-side draft. Best-effort — failure shouldn't block navigation.
      try {
        await clearDraft();
      } catch {
        // ignore
      }
      toast.success(
        "Report created",
        `${created.case_id} · v${created.version}`,
      );
      router.push(`/reports/${created.id}`);
    } finally {
      // Note: leaving submittingRef true prevents any late autosave from firing
      // before the navigation completes.
    }
  };

  if (loading) return <PageSpinner label="Loading workspace" />;

  return (
    <div>
      <PageHeader
        eyebrow="New report"
        title="File a new investigation"
        description="Capture case details, primary target, and any soft target associations. Your work autosaves as you type."
      />
      <ReportForm
        mode="create"
        initialValues={initial}
        onSubmit={handleSubmit}
        submitLabel="Create report"
        backHref="/reports"
        onAutoSave={handleAutoSave}
        autoSaveStatus={autoSaveStatus}
        onDiscardDraft={draftRestoredAt ? handleDiscardDraft : null}
        draftRestoredAt={draftRestoredAt}
      />
    </div>
  );
}
