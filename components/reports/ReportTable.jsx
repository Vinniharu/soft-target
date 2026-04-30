"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Eye, Edit3, MoreHorizontal } from "lucide-react";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Menu, MenuItem } from "@/components/ui/Menu";
import { formatDate, formatRelative } from "@/lib/utils/format";

export function ReportTable({ items, currentUserId }) {
  const router = useRouter();
  const [menu, setMenu] = useState({ open: false, anchorRect: null, report: null });

  const openMenuForRow = (event, report) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({ open: true, anchorRect: rect, report });
  };

  const closeMenu = () => setMenu((m) => ({ ...m, open: false }));

  const handleView = () => {
    if (menu.report) router.push(`/reports/${menu.report.id}`);
    closeMenu();
  };

  const handleEdit = () => {
    if (menu.report) router.push(`/reports/${menu.report.id}/edit`);
    closeMenu();
  };

  const canEdit = (report) =>
    !!currentUserId && !!report?.user_id && report.user_id === currentUserId;

  return (
    <>
      <Table>
        <THead>
          <tr>
            <TH>Case</TH>
            <TH className="hidden md:table-cell">Version</TH>
            <TH className="hidden md:table-cell">Created</TH>
            <TH>Updated</TH>
            <TH className="w-12 text-right" aria-label="Actions" />
          </tr>
        </THead>
        <TBody>
          {items.map((r) => (
            <TR
              key={r.id}
              tabIndex={0}
              role="button"
              aria-label={`Open actions for ${r.case_id}`}
              onClick={(e) => openMenuForRow(e, r)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openMenuForRow(e, r);
                }
              }}
              className="cursor-pointer focus:outline-none focus-visible:bg-[var(--color-surface-2)]"
            >
              <TD>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium text-[var(--color-foreground)]">
                    {r.case_id}
                  </span>
                </div>
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
                <MoreHorizontal className="inline h-4 w-4 text-[var(--color-muted-foreground)]" />
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <Menu
        open={menu.open}
        onClose={closeMenu}
        anchorRect={menu.anchorRect}
        align="start"
      >
        <MenuItem icon={Eye} onClick={handleView}>
          View report
        </MenuItem>
        {canEdit(menu.report) && (
          <MenuItem icon={Edit3} onClick={handleEdit}>
            Edit report
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
