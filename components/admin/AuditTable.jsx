"use client";

import React from "react";
import {
  FileText,
  UserPlus,
  UserCog,
  UserX,
  Download,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatDate, truncate } from "@/lib/utils/format";

const ACTION_META = {
  "report.create": { icon: FileText, label: "Report created", variant: "default" },
  "report.update": { icon: FileText, label: "Report updated", variant: "secondary" },
  "report.delete": { icon: FileText, label: "Report deleted", variant: "destructive" },
  "report.download": { icon: Download, label: "Report downloaded", variant: "secondary" },
  "user.create": { icon: UserPlus, label: "User created", variant: "default" },
  "user.update": { icon: UserCog, label: "User updated", variant: "secondary" },
  "user.delete": { icon: UserX, label: "User deleted", variant: "destructive" },
  "user.seed_admin": { icon: ShieldCheck, label: "Admin seeded", variant: "default" },
};

export function AuditTable({ items }) {
  return (
    <Table>
      <THead>
        <tr>
          <TH>Action</TH>
          <TH className="hidden md:table-cell">Actor</TH>
          <TH className="hidden lg:table-cell">Resource</TH>
          <TH className="hidden xl:table-cell">Details</TH>
          <TH className="text-right">When</TH>
        </tr>
      </THead>
      <TBody>
        {items.map((entry) => {
          const meta = ACTION_META[entry.action] || {
            icon: Activity,
            label: entry.action || "Unknown",
            variant: "outline",
          };
          const Icon = meta.icon;
          return (
            <TR key={entry.id}>
              <TD>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)]">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </div>
              </TD>
              <TD className="hidden md:table-cell font-mono text-xs text-[var(--color-muted-foreground)]">
                {entry.actor_id ? truncate(entry.actor_id, 14) : "System"}
              </TD>
              <TD className="hidden lg:table-cell text-xs text-[var(--color-muted-foreground)]">
                <span className="text-[var(--color-foreground)]">
                  {entry.resource_type}
                </span>
                {entry.resource_id && (
                  <span className="ml-1 font-mono">
                    · {truncate(entry.resource_id, 12)}
                  </span>
                )}
              </TD>
              <TD className="hidden xl:table-cell text-xs text-[var(--color-muted-foreground)] max-w-xs truncate">
                {entry.details ? truncate(JSON.stringify(entry.details), 60) : "—"}
              </TD>
              <TD className="text-right text-xs text-[var(--color-muted-foreground)] whitespace-nowrap">
                {formatDate(entry.created_at)}
              </TD>
            </TR>
          );
        })}
      </TBody>
    </Table>
  );
}
