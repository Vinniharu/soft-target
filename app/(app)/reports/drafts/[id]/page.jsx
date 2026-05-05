"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import { DraftEditor } from "@/components/reports/DraftEditor";
import { getDraft } from "@/lib/api/drafts";
import { useToast } from "@/lib/toast/ToastContext";
import { formatApiError } from "@/lib/utils/format";

export default function DraftEditorPage() {
  const params = useParams();
  const draftId = params?.id;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!draftId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getDraft(draftId);
        if (!cancelled) setDraft(data);
      } catch (err) {
        if (cancelled) return;
        if (err?.status === 404) {
          setNotFound(true);
        } else {
          toast.error("Failed to load draft", formatApiError(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [draftId, toast]);

  if (loading) return <PageSpinner label="Loading draft" />;

  if (notFound || !draft) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Draft not found.
        </p>
        <Link href="/reports/drafts">
          <Button className="mt-4">Back to drafts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Draft"
        title={draft.title || "Untitled draft"}
        description="Edits autosave as you type. Submit when you're ready to file the report."
      />
      <DraftEditor draftId={draft.id} initialDraft={draft} />
    </div>
  );
}
