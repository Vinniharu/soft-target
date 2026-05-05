"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dialog } from "@/components/ui/Dialog";
import { UserForm } from "@/components/admin/UserForm";
import { listMyOrgUsers, createMyOrgUser } from "@/lib/api/org";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/lib/toast/ToastContext";
import { formatApiError, formatDate } from "@/lib/utils/format";

const PAGE_SIZE = 25;

export default function OrgMembersPage() {
  const toast = useToast();
  const { organisation } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchPage = useCallback(
    async (off) => {
      setLoading(true);
      try {
        const res = await listMyOrgUsers({ limit: PAGE_SIZE, offset: off });
        setItems(res.items || []);
        setTotal(res.total || 0);
      } catch (err) {
        toast.error("Failed to load members", formatApiError(err));
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
    const created = await createMyOrgUser({
      email: form.email,
      password: form.password,
      name: form.name,
    });
    toast.success("Member created", created.name || created.email);
    setCreateOpen(false);
    fetchPage(offset);
  };

  const pageNum = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        eyebrow={organisation?.name}
        title="Members"
        description={`${total} member${total === 1 ? "" : "s"} in your organisation.`}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="h-4 w-4" /> New member
          </Button>
        }
      />

      {loading ? (
        <Card>
          <PageSpinner label="Loading members" />
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No members yet"
            description="Add the first operator to your organisation."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <UserPlus className="h-4 w-4" /> Create member
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <OrgUserTable items={items} />
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
        title="New member"
        description="Add a new operator to your organisation."
      >
        <UserForm mode="create" showRole={false} onSubmit={handleCreate} />
      </Dialog>
    </div>
  );
}

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

function OrgUserTable({ items }) {
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
                href={`/org/users/${u.id}`}
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
              <Badge
                variant={u.role === "org_owner" ? "default" : "secondary"}
              >
                {u.role === "org_owner" && <Shield className="h-3 w-3" />}
                {u.role}
              </Badge>
            </TD>
            <TD className="hidden md:table-cell text-[var(--color-muted-foreground)]">
              {formatDate(u.created_at)}
            </TD>
            <TD className="text-right">
              <Link href={`/org/users/${u.id}`}>
                <ChevronRight className="inline h-4 w-4 text-[var(--color-muted-foreground)]" />
              </Link>
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
