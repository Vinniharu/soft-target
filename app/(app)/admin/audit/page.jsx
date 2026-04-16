"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { AuditTable } from "@/components/admin/AuditTable";
import { listAudit } from "@/lib/api/audit";
import { useToast } from "@/lib/toast/ToastContext";
import { formatApiError } from "@/lib/utils/format";

const PAGE_SIZE = 50;

export default function AdminAuditPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const fetchPage = useCallback(
    async (off) => {
      setLoading(true);
      try {
        const res = await listAudit({ limit: PAGE_SIZE, offset: off });
        setItems(res.items || []);
        setTotal(res.total || 0);
      } catch (err) {
        toast.error("Failed to load audit log", formatApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchPage(offset);
  }, [fetchPage, offset]);

  const pageNum = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Audit log"
        description={`${total} event${total === 1 ? "" : "s"} recorded, newest first.`}
        actions={
          <Button variant="outline" size="sm" onClick={() => fetchPage(offset)}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      {loading ? (
        <Card>
          <PageSpinner label="Loading audit log" />
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={ScrollText}
            title="No audit events"
            description="Actions on the system will appear here as they happen."
          />
        </Card>
      ) : (
        <>
          <AuditTable items={items} />
          <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
            <div>
              Page {pageNum} of {pageCount} · {total} total
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={offset + PAGE_SIZE >= total}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
