"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  NotebookPen,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Menu, MenuItem } from "@/components/ui/Menu";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { listDrafts, deleteDraft } from "@/lib/api/drafts";
import { useToast } from "@/lib/toast/ToastContext";
import { formatApiError, formatDate, formatRelative } from "@/lib/utils/format";

const PAGE_SIZE = 25;
const DRAFT_CAP = 10;

export default function DraftsListPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const [menu, setMenu] = useState({ open: false, anchorRect: null, draft: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, draft: null });
  const [deleting, setDeleting] = useState(false);

  const fetchPage = useCallback(
    async (off) => {
      setLoading(true);
      try {
        const res = await listDrafts({ limit: PAGE_SIZE, offset: off });
        setItems(res.items || []);
        setTotal(res.total || 0);
      } catch (err) {
        toast.error("Failed to load drafts", formatApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchPage(offset);
  }, [fetchPage, offset]);

  const openMenuForRow = (event, draft) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({ open: true, anchorRect: rect, draft });
  };
  const closeMenu = () => setMenu((m) => ({ ...m, open: false }));

  const handleOpen = () => {
    if (menu.draft) router.push(`/reports/drafts/${menu.draft.id}`);
    closeMenu();
  };
  const handleDeleteClick = () => {
    if (menu.draft) setConfirmDelete({ open: true, draft: menu.draft });
    closeMenu();
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.draft) return;
    setDeleting(true);
    try {
      await deleteDraft(confirmDelete.draft.id);
      toast.success("Draft deleted");
      setConfirmDelete({ open: false, draft: null });
      fetchPage(offset);
    } catch (err) {
      toast.error("Delete failed", formatApiError(err));
    } finally {
      setDeleting(false);
    }
  };

  const atCap = total >= DRAFT_CAP;
  const pageNum = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const newReportButton = (
    <Link href="/reports/new" className={atCap ? "pointer-events-none" : ""}>
      <Button disabled={atCap} title={atCap ? `You have ${total} of ${DRAFT_CAP} drafts. Delete one to start another.` : undefined}>
        <Plus className="h-4 w-4" /> New report
      </Button>
    </Link>
  );

  return (
    <div>
      <PageHeader
        title="Drafts"
        description={`${total} of ${DRAFT_CAP} drafts in progress.`}
        actions={newReportButton}
      />

      {loading ? (
        <Card>
          <PageSpinner label="Loading drafts" />
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={NotebookPen}
            title="No drafts"
            description="Drafts autosave as you fill out a new report. Start one and we'll keep it here until you're ready to file."
            action={newReportButton}
          />
        </Card>
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <TH>Title</TH>
                <TH>Last saved</TH>
                <TH className="hidden md:table-cell">Created</TH>
                <TH className="w-12 text-right" aria-label="Actions" />
              </tr>
            </THead>
            <TBody>
              {items.map((d) => (
                <TR
                  key={d.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open ${d.title || "untitled draft"}`}
                  onClick={(e) => openMenuForRow(e, d)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openMenuForRow(e, d);
                    }
                  }}
                  className="cursor-pointer focus:outline-none focus-visible:bg-[var(--color-surface-2)]"
                >
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
                        <NotebookPen className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium text-[var(--color-foreground)] truncate">
                        {d.title || (
                          <span className="text-[var(--color-muted-foreground)]">
                            Untitled draft
                          </span>
                        )}
                      </span>
                    </div>
                  </TD>
                  <TD className="text-[var(--color-muted-foreground)]">
                    {formatRelative(d.updated_at)}
                  </TD>
                  <TD className="hidden md:table-cell text-[var(--color-muted-foreground)]">
                    {formatDate(d.created_at)}
                  </TD>
                  <TD className="text-right">
                    <MoreHorizontal className="inline h-4 w-4 text-[var(--color-muted-foreground)]" />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>

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

      <Menu
        open={menu.open}
        onClose={closeMenu}
        anchorRect={menu.anchorRect}
        align="start"
      >
        <MenuItem icon={Eye} onClick={handleOpen}>
          Open draft
        </MenuItem>
        <MenuItem icon={Trash2} onClick={handleDeleteClick} danger>
          Delete draft
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete((s) => ({ ...s, open }))}
        title={`Delete ${confirmDelete.draft?.title || "this draft"}?`}
        description="This permanently deletes the draft. The action cannot be undone."
        confirmLabel="Delete draft"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
