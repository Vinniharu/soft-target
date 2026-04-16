"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReportTable } from "@/components/reports/ReportTable";
import { listReports } from "@/lib/api/reports";
import { useToast } from "@/lib/toast/ToastContext";
import { formatApiError } from "@/lib/utils/format";

const PAGE_SIZE = 25;

export default function ReportsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const fetchPage = useCallback(
    async (off) => {
      setLoading(true);
      try {
        const res = await listReports({ limit: PAGE_SIZE, offset: off });
        setItems(res.items || []);
        setTotal(res.total || 0);
      } catch (err) {
        toast.error("Failed to load reports", formatApiError(err));
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
        title="Reports"
        description={`${total} report${total === 1 ? "" : "s"} on file.`}
        actions={
          <Link href="/reports/new">
            <Button>
              <Plus className="h-4 w-4" /> New report
            </Button>
          </Link>
        }
      />

      {loading ? (
        <Card>
          <PageSpinner label="Loading reports" />
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No reports yet"
            description="You haven't filed any reports. Create the first one to get started."
            action={
              <Link href="/reports/new">
                <Button>
                  <Plus className="h-4 w-4" /> Create report
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          <ReportTable items={items} />
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
