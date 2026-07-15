"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Eye, Edit3, Trash2, MoreHorizontal } from "lucide-react";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Menu, MenuItem } from "@/components/ui/Menu";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { canEditReport, canDeleteReport } from "@/lib/auth/roles";
import { deleteReport } from "@/lib/api/reports";
import { useToast } from "@/lib/toast/ToastContext";
import { formatApiError, formatDate, formatRelative } from "@/lib/utils/format";

export function ReportTable({
  items,
  currentUser,
  showCreator = false,
  basePath = "/reports",
  onDelete,
  onChange,
}) {
  const router = useRouter();
  const toast = useToast();
  const [menu, setMenu] = useState({ open: false, anchorRect: null, report: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, report: null });
  const [deleting, setDeleting] = useState(false);

  const openMenuForRow = (event, report) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({ open: true, anchorRect: rect, report });
  };

  const closeMenu = () => setMenu((m) => ({ ...m, open: false }));

  const handleView = () => {
    if (menu.report) router.push(`${basePath}/${menu.report.id}`);
    closeMenu();
  };

  const handleEdit = () => {
    if (menu.report) router.push(`${basePath}/${menu.report.id}/edit`);
    closeMenu();
  };

  const handleDeleteClick = () => {
    if (menu.report) setConfirmDelete({ open: true, report: menu.report });
    closeMenu();
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.report) return;
    setDeleting(true);
    try {
      if (onDelete) {
        await onDelete(confirmDelete.report.id);
      } else {
        await deleteReport(confirmDelete.report.id);
      }
      toast.success("Report deleted", confirmDelete.report.case_id);
      setConfirmDelete({ open: false, report: null });
      onChange?.();
    } catch (err) {

      if (err?.status === 403) {
        toast.error(
          "Not allowed",
          "Only your organisation owner can delete reports.",
        );
      } else {
        toast.error("Delete failed", formatApiError(err));
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Table>
        <THead>
          <tr>
            <TH>Case</TH>
            {showCreator && <TH className="hidden md:table-cell">Creator</TH>}
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
              {showCreator && (
                <TD className="hidden md:table-cell text-[var(--color-muted-foreground)]">
                  {r.creator?.name ||
                    r.creator?.email ||
                    (r.user_id ? r.user_id.slice(0, 8) : "—")}
                </TD>
              )}
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
        {canEditReport(currentUser, menu.report) && (
          <MenuItem icon={Edit3} onClick={handleEdit}>
            Edit report
          </MenuItem>
        )}
        {canDeleteReport(currentUser, menu.report) && (
          <MenuItem icon={Trash2} onClick={handleDeleteClick} danger>
            Delete report
          </MenuItem>
        )}
      </Menu>

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) =>
          setConfirmDelete((s) => ({ ...s, open }))
        }
        title={`Delete ${confirmDelete.report?.case_id || "report"}?`}
        description="This soft-deletes the report. The PDF on disk is preserved. This action can be reversed by the backend admin if needed."
        confirmLabel="Delete report"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
