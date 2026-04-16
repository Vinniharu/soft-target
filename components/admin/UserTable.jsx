"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Shield } from "lucide-react";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/format";

function initials(str) {
  return (str || "??")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
    .padEnd(2, "·")
    .slice(0, 2);
}

export function UserTable({ items }) {
  return (
    <Table>
      <THead>
        <tr>
          <TH>Name</TH>
          <TH>Role</TH>
          <TH className="hidden md:table-cell">Created</TH>
          <TH className="w-12 text-right" aria-label="Open" />
        </tr>
      </THead>
      <TBody>
        {items.map((u) => (
          <TR key={u.id} className="cursor-pointer">
            <TD>
              <Link
                href={`/admin/users/${u.id}`}
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs font-semibold">
                  {initials(u.name || u.email)}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-[var(--color-foreground)] truncate">
                    {u.name || (
                      <span className="text-[var(--color-muted-foreground)]">
                        No name set
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--color-muted-foreground)] truncate">
                    {u.email}
                  </div>
                </div>
              </Link>
            </TD>
            <TD>
              <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                {u.role === "admin" && <Shield className="h-3 w-3" />}
                {u.role}
              </Badge>
            </TD>
            <TD className="hidden md:table-cell text-[var(--color-muted-foreground)]">
              {formatDate(u.created_at)}
            </TD>
            <TD className="text-right">
              <Link href={`/admin/users/${u.id}`}>
                <ChevronRight className="inline h-4 w-4 text-[var(--color-muted-foreground)]" />
              </Link>
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
