"use client";

import React from "react";
import Link from "next/link";
import { Eye, Edit3, Trash2, FileText } from "lucide-react";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatRelative, truncate } from "@/lib/utils/format";

export function AdminReportTable({ items, onDelete }) {
  return (
    <Table>
      <THead>
        <tr>
          <TH>Case</TH>
          <TH className="hidden md:table-cell">Version</TH>
          <TH className="hidden lg:table-cell">Owner</TH>
          <TH className="hidden md:table-cell">Created</TH>
          <TH>Updated</TH>
          <TH className="text-right">Actions</TH>
        </tr>
      </THead>
      <TBody>
        {items.map((r) => (
          <TR key={r.id}>
            <TD>
              <Link
                href={`/admin/reports/${r.id}`}
                className="flex items-center gap-3"
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
            <TD className="hidden lg:table-cell font-mono text-xs text-[var(--color-muted-foreground)]">
              {r.user_id ? truncate(r.user_id, 14) : "—"}
            </TD>
            <TD className="hidden md:table-cell text-[var(--color-muted-foreground)]">
              {formatDate(r.created_at)}
            </TD>
            <TD className="text-[var(--color-muted-foreground)]">
              {formatRelative(r.updated_at)}
            </TD>
            <TD className="text-right">
              <div className="inline-flex items-center gap-1">
                <Link href={`/admin/reports/${r.id}`}>
                  <Button variant="ghost" size="icon" aria-label="View">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/admin/reports/${r.id}/edit`}>
                  <Button variant="ghost" size="icon" aria-label="Edit">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </Link>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete"
                    className="text-[var(--color-muted-foreground)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]"
                    onClick={() => onDelete(r)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
