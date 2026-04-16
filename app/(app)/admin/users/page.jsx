"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dialog } from "@/components/ui/Dialog";
import { UserTable } from "@/components/admin/UserTable";
import { UserForm } from "@/components/admin/UserForm";
import { listUsers, createUser } from "@/lib/api/users";
import { useToast } from "@/lib/toast/ToastContext";
import { formatApiError } from "@/lib/utils/format";

const PAGE_SIZE = 25;

export default function AdminUsersPage() {
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
        const res = await listUsers({ limit: PAGE_SIZE, offset: off });
        setItems(res.items || []);
        setTotal(res.total || 0);
      } catch (err) {
        toast.error("Failed to load users", formatApiError(err));
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
    const created = await createUser(form);
    toast.success("User created", created.name || created.email);
    setCreateOpen(false);
    fetchPage(offset);
  };

  const pageNum = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Users"
        description={`${total} active user${total === 1 ? "" : "s"} in the system.`}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="h-4 w-4" /> New user
          </Button>
        }
      />

      {loading ? (
        <Card>
          <PageSpinner label="Loading users" />
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No users yet"
            description="Provision the first operator account to get started."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <UserPlus className="h-4 w-4" /> Create user
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <UserTable items={items} />
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
        title="New user"
        description="Provision a new operator or administrator account."
      >
        <UserForm mode="create" onSubmit={handleCreate} />
      </Dialog>
    </div>
  );
}
