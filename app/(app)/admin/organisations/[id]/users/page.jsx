"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  ArrowLeft,
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
import {
  getOrganisation,
  listOrgUsers,
  createUserInOrg,
} from "@/lib/api/organisations";
import { useToast } from "@/lib/toast/ToastContext";
import { formatApiError } from "@/lib/utils/format";

const PAGE_SIZE = 25;

const ROLE_OPTIONS = [
  { value: "user", label: "Operator (user)" },
  { value: "org_owner", label: "Organisation owner" },
];

export default function AdminOrganisationUsersPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params?.id;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchPage = useCallback(
    async (off) => {
      if (!orgId) return;
      setLoading(true);
      try {
        const [orgRes, usersRes] = await Promise.all([
          org ? Promise.resolve(org) : getOrganisation(orgId),
          listOrgUsers(orgId, { limit: PAGE_SIZE, offset: off }),
        ]);
        setOrg(orgRes);
        setItems(usersRes.items || []);
        setTotal(usersRes.total || 0);
      } catch (err) {
        toast.error("Failed to load members", formatApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [orgId, toast, org],
  );

  useEffect(() => {
    fetchPage(offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, offset]);

  const handleCreate = async (form) => {
    const created = await createUserInOrg(orgId, form);
    toast.success("Member created", created.name || created.email);
    setCreateOpen(false);
    fetchPage(offset);
  };

  const pageNum = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/admin/organisations/${orgId}`)}
        className="mb-3 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back to organisation
      </Button>

      <PageHeader
        eyebrow={org?.name || "Organisation"}
        title="Members"
        description={`${total} member${total === 1 ? "" : "s"} in this organisation.`}
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
            description="Add the first operator to this organisation."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <UserPlus className="h-4 w-4" /> Create member
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
        title="New member"
        description="Provision a new operator under this organisation."
      >
        <UserForm
          mode="create"
          onSubmit={handleCreate}
          roleOptions={ROLE_OPTIONS}
        />
      </Dialog>
    </div>
  );
}
