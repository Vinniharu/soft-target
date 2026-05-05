"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dialog } from "@/components/ui/Dialog";
import { OrganisationForm } from "@/components/admin/OrganisationForm";
import {
  listOrganisations,
  createOrganisation,
} from "@/lib/api/organisations";
import { useToast } from "@/lib/toast/ToastContext";
import { formatApiError, formatDate } from "@/lib/utils/format";

const PAGE_SIZE = 25;

export default function AdminOrganisationsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchPage = useCallback(
    async (off) => {
      setLoading(true);
      try {
        const res = await listOrganisations({ limit: PAGE_SIZE, offset: off });
        setItems(res.items || []);
        setTotal(res.total || 0);
      } catch (err) {
        toast.error("Failed to load organisations", formatApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchPage(offset);
  }, [fetchPage, offset]);

  const handleCreate = async (form) => {
    const created = await createOrganisation(form);
    toast.success("Organisation created", created.name);
    setCreateOpen(false);
    fetchPage(offset);
  };

  const pageNum = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Organisations"
        description={`${total} active organisation${total === 1 ? "" : "s"} in the system.`}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New organisation
          </Button>
        }
      />

      {loading ? (
        <Card>
          <PageSpinner label="Loading organisations" />
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No organisations yet"
            description="Create the first organisation and its owner to get started."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Create organisation
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <TH>Name</TH>
                <TH className="hidden md:table-cell">Owner</TH>
                <TH className="hidden md:table-cell">Created</TH>
                <TH className="w-12 text-right" aria-label="Open" />
              </tr>
            </THead>
            <TBody>
              {items.map((o) => (
                <TR key={o.id} className="cursor-pointer">
                  <TD>
                    <Link
                      href={`/admin/organisations/${o.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-[var(--color-foreground)] truncate">
                        {o.name}
                      </span>
                    </Link>
                  </TD>
                  <TD className="hidden md:table-cell text-[var(--color-muted-foreground)] font-mono text-xs">
                    {o.owner_user_id?.slice(0, 8) || "—"}
                  </TD>
                  <TD className="hidden md:table-cell text-[var(--color-muted-foreground)]">
                    {formatDate(o.created_at)}
                  </TD>
                  <TD className="text-right">
                    <Link href={`/admin/organisations/${o.id}`}>
                      <ChevronRight className="inline h-4 w-4 text-[var(--color-muted-foreground)]" />
                    </Link>
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

      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New organisation"
        description="Create an organisation and provision its owner account."
      >
        <OrganisationForm mode="create" onSubmit={handleCreate} />
      </Dialog>
    </div>
  );
}
