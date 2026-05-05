"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ReportForm } from "./ReportForm";
import { createReport } from "@/lib/api/reports";
import {
  createDraft,
  updateDraft,
  deleteDraft,
} from "@/lib/api/drafts";
import { emptyForm } from "@/lib/utils/mapReport";
import { useToast } from "@/lib/toast/ToastContext";

const TITLE_DEBOUNCE_MS = 1500;

function isMeaningfulPayload(form) {
  if (!form) return false;
  if (form.caseId && String(form.caseId).trim() !== "") return true;
  if (form.summary && String(form.summary).trim() !== "") return true;
  const t = form.target || {};
  for (const k of [
    "name",
    "imei",
    "imei2",
    "phone",
    "altPhone",
    "location",
    "lat",
    "lng",
    "notes",
  ]) {
    if (t[k] && String(t[k]).trim() !== "") return true;
  }
  if (Array.isArray(form.softTargets)) {
    for (const st of form.softTargets) {
      if (!st) continue;
      for (const k of ["phone", "location", "lat", "lng", "notes"]) {
        if (st[k] && String(st[k]).trim() !== "") return true;
      }
    }
  }
  return false;
}

export function DraftEditor({ draftId: initialDraftId, initialDraft }) {
  const router = useRouter();
  const toast = useToast();

  const draftIdRef = useRef(initialDraftId || null);
  const creatingRef = useRef(false);
  const submittingRef = useRef(false);

  const initialFormValues = initialDraft?.payload || emptyForm();

  const [title, setTitle] = useState(initialDraft?.title || "");
  const titleRef = useRef(title);
  titleRef.current = title;

  const [autoSaveStatus, setAutoSaveStatus] = useState({
    state: "idle",
    lastSavedAt: null,
  });

  const draftRestoredAt = initialDraft?.updated_at || null;

  const handleAutoSave = useCallback(
    async (formState) => {
      if (submittingRef.current) return;

      const id = draftIdRef.current;

      if (!id) {
        // Lazy create: only fire POST once the user has actually typed
        // something meaningful, and never fire two creates in parallel.
        if (creatingRef.current) return;
        if (!isMeaningfulPayload(formState)) return;

        creatingRef.current = true;
        setAutoSaveStatus((s) => ({ ...s, state: "saving" }));
        try {
          const created = await createDraft({
            title: titleRef.current || undefined,
            payload: formState,
          });
          if (submittingRef.current) return;
          draftIdRef.current = created.id;
          setAutoSaveStatus({
            state: "saved",
            lastSavedAt: created.updated_at || new Date().toISOString(),
          });
          // Move the URL to the canonical /reports/drafts/{id} location so
          // refresh, back-nav, and bookmarking all behave.
          router.replace(`/reports/drafts/${created.id}`);
        } catch (err) {
          if (submittingRef.current) return;
          setAutoSaveStatus({
            state: "error",
            error: err?.message,
          });
          if (err?.status === 409) {
            toast.error(
              "Draft limit reached",
              "You have 10 drafts. Delete one before starting another.",
            );
            router.push("/reports/drafts");
          } else if (err?.status === 413) {
            toast.error(
              "Draft too large to save",
              "Trim the report payload (over 256 KB).",
            );
          }
        } finally {
          creatingRef.current = false;
        }
        return;
      }

      // Existing draft — debounced PUT.
      setAutoSaveStatus((s) => ({ ...s, state: "saving" }));
      try {
        const res = await updateDraft(id, {
          title: titleRef.current || undefined,
          payload: formState,
        });
        if (submittingRef.current) return;
        setAutoSaveStatus({
          state: "saved",
          lastSavedAt: res?.updated_at || new Date().toISOString(),
        });
      } catch (err) {
        if (submittingRef.current) return;
        setAutoSaveStatus({
          state: "error",
          error: err?.message,
        });
        if (err?.status === 404) {
          toast.error(
            "Draft no longer exists",
            "It may have been deleted in another tab.",
          );
          router.push("/reports/drafts");
        } else if (err?.status === 413) {
          toast.error(
            "Draft too large to save",
            "Trim the report payload (over 256 KB).",
          );
        }
      }
    },
    [router, toast],
  );

  const handleTitleChange = useCallback((next) => {
    setTitle(next);
  }, []);

  // Title-only autosave: when the user only edits the title (no form-field
  // changes), the watch() subscription in ReportForm doesn't fire. Mirror
  // title edits into their own debounced PUT so they don't get lost.
  // Skipped while there's no draft id yet — the title will be sent along
  // with the eventual create that fires when the form gets meaningful input.
  const initialTitleRef = useRef(initialDraft?.title || "");
  useEffect(() => {
    if (submittingRef.current) return;
    if (!draftIdRef.current) return;
    if (title === initialTitleRef.current) return;
    const t = setTimeout(async () => {
      try {
        const res = await updateDraft(draftIdRef.current, { title });
        if (submittingRef.current) return;
        initialTitleRef.current = title;
        setAutoSaveStatus({
          state: "saved",
          lastSavedAt: res?.updated_at || new Date().toISOString(),
        });
      } catch (err) {
        if (submittingRef.current) return;
        if (err?.status === 404) {
          toast.error(
            "Draft no longer exists",
            "It may have been deleted in another tab.",
          );
          router.push("/reports/drafts");
        } else {
          setAutoSaveStatus({ state: "error", error: err?.message });
        }
      }
    }, TITLE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [title, router, toast]);

  const handleDiscardDraft = useCallback(async () => {
    const id = draftIdRef.current;
    if (id) {
      try {
        await deleteDraft(id);
      } catch {
        // best-effort
      }
    }
    toast.success("Draft discarded", "Your draft has been removed.");
    router.push("/reports/drafts");
  }, [router, toast]);

  const handleSubmit = async (apiPayload) => {
    submittingRef.current = true;
    try {
      const created = await createReport(apiPayload);
      const id = draftIdRef.current;
      if (id) {
        deleteDraft(id).catch(() => {
          // best-effort cleanup
        });
      }
      toast.success(
        "Report created",
        `${created.case_id} · v${created.version}`,
      );
      router.push(`/reports/${created.id}`);
    } catch (err) {
      submittingRef.current = false;
      throw err; // ReportForm will toast the error
    }
  };

  return (
    <ReportForm
      mode="create"
      initialValues={initialFormValues}
      onSubmit={handleSubmit}
      submitLabel="Create report"
      backHref="/reports/drafts"
      onAutoSave={handleAutoSave}
      autoSaveStatus={autoSaveStatus}
      onDiscardDraft={handleDiscardDraft}
      draftRestoredAt={draftRestoredAt}
      title={title}
      onTitleChange={handleTitleChange}
    />
  );
}
