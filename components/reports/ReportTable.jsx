"use client";

import React from "react";
import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatRelative } from "@/lib/utils/format";

export function ReportTable({ items }) {
  return (
    <Table>
      <THead>
        <tr>
          <TH>Case</TH>
          <TH className="hidden md:table-cell">Version</TH>
          <TH className="hidden md:table-cell">Created</TH>
          <TH>Updated</TH>
          <TH className="w-12 text-right" aria-label="Open" />
        </tr>
      </THead>
      <TBody>
        {items.map((r) => (
          <TR key={r.id} className="cursor-pointer">
            <TD>
              <Link
                href={`/reports/${r.id}`}
                className="flex items-center gap-3 -mx-4 px-4 py-0"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium text-[var(--color-foreground)]">
                  {r.case_id}
                </span>
              </Link>
            </TD>
            <TD className="hidden md:table-cell">
              <Badge variant="secondary">v{r.version}</Badge>
            </TD>
            <TD className="hidden md:table-cell text-[var(--color-muted-foreground)]">
              {formatDate(r.created_at)}
            </TD>
            <TD className="text-[var(--color-muted-foreground)]">
              {formatRelative(r.updated_at)}
            </TD>
            <TD className="text-right">
              <Link href={`/reports/${r.id}`}>
                <ChevronRight className="inline h-4 w-4 text-[var(--color-muted-foreground)]" />
              </Link>
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
