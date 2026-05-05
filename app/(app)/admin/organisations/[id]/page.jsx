"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Users,
  FileText,
  Trash2,
  Pencil,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { Dialog, ConfirmDialog } from "@/components/ui/Dialog";
import { OrganisationForm } from "@/components/admin/OrganisationForm";
import {
  getOrganisation,
  renameOrganisation,
  deleteOrganisation,
  listOrgUsers,
  listOrgReports,
} from "@/lib/api/organisations";
import { useToast } from "@/lib/toast/ToastContext";
import { formatApiError, formatDate } from "@/lib/utils/format";

export default function AdminOrganisationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params?.id;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberTotal, setMemberTotal] = useState(0);
  const [reports, setReports] = useState([]);
  const [reportTotal, setReportTotal] = useState(0);

  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [orgRes, usersRes, reportsRes] = await Promise.all([
        getOrganisation(orgId),
        listOrgUsers(orgId, { limit: 5 }),
        listOrgReports(orgId, { limit: 5 }),
      ]);
      setOrg(orgRes);
      setMembers(usersRes.items || []);
      setMemberTotal(usersRes.total || 0);
      setReports(reportsRes.items || []);
      setReportTotal(reportsRes.total || 0);
    } catch (err) {
      toast.error("Failed to load organisation", formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [orgId, toast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRename = async (form) => {
    const updated = await renameOrganisation(orgId, { name: form.name });
    toast.success("Organisation renamed", updated.name);
    setRenameOpen(false);
    setOrg(updated);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteOrganisation(orgId);
      toast.success("Organisation deleted", org?.name);
      router.push("/admin/organisations");
    } catch (err) {
      toast.error("Delete failed", formatApiError(err));
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) return <PageSpinner label="Loading organisation" />;
  if (!org) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Organisation not found.
        </p>
        <Button
          className="mt-4"
          onClick={() => router.push("/admin/organisations")}
        >
          Back to organisations
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/admin/organisations")}
        className="mb-3 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back to organisations
      </Button>

      <PageHeader
        eyebrow="Organisation"
        title={org.name}
        description={`Created ${formatDate(org.created_at)}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setRenameOpen(true)}>
              <Pencil className="h-4 w-4" /> Rename
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(true)}
              className="text-[var(--color-danger)] border-red-200 hover:bg-[var(--color-danger-subtle)]"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                Members
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                {memberTotal} total
              </p>
            </div>
            <Link href={`/admin/organisations/${orgId}/users`}>
              <Button variant="outline" size="sm">
                <Users className="h-3.5 w-3.5" /> Manage
              </Button>
            </Link>
          </div>
          <CardContent className="p-0">
            {members.length === 0 ? (
              <div className="p-6 text-sm text-[var(--color-muted-foreground)] text-center">
                No members yet.
              </div>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {members.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-3 px-6 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-[var(--color-foreground)] truncate">
                        {u.name || u.email}
                      </div>
                      <div className="text-xs text-[var(--color-muted-foreground)] truncate">
                        {u.email} · {u.role}
                      </div>
                    </div>
                    <Link
                      href={`/admin/organisations/${orgId}/users/${u.id}`}
                      className="text-xs text-[var(--color-primary)] hover:underline flex-shrink-0"
                    >
                      Edit
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                Reports
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                {reportTotal} total
              </p>
            </div>
            <Link href="/admin/reports">
              <Button variant="outline" size="sm">
                <FileText className="h-3.5 w-3.5" /> Open admin reports
              </Button>
            </Link>
          </div>
          <CardContent className="p-0">
            {reports.length === 0 ? (
              <div className="p-6 text-sm text-[var(--color-muted-foreground)] text-center">
                No reports yet.
              </div>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {reports.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 px-6 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-[var(--color-foreground)] truncate">
                        {r.case_id}
                      </div>
                      <div className="text-xs text-[var(--color-muted-foreground)] truncate">
                        {r.creator?.name || r.creator?.email || "—"} · v{r.version}
                      </div>
                    </div>
                    <Link
                      href={`/reports/${r.id}`}
                      className="text-xs text-[var(--color-primary)] hover:underline flex-shrink-0"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
              Details
            </h3>
          </div>
          <CardContent className="p-6 space-y-3 text-sm">
            <MetaRow label="Organisation ID" value={org.id} mono />
            <MetaRow label="Owner user ID" value={org.owner_user_id} mono />
            <MetaRow label="Created" value={formatDate(org.created_at)} />
            <MetaRow label="Updated" value={formatDate(org.updated_at)} />
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename organisation"
      >
        <OrganisationForm
          mode="edit"
          initialValues={{ name: org.name }}
          onSubmit={handleRename}
        />
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${org.name}?`}
        description="This soft-deletes the organisation and revokes every member's session. Members will be signed out and unable to log in. This action can be reversed by the backend admin."
        confirmLabel="Delete organisation"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function MetaRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[var(--color-muted-foreground)] flex-shrink-0">
        {label}
      </span>
      <span
        className={`text-right ${mono ? "font-mono text-xs" : "font-medium"} text-[var(--color-foreground)] break-all`}
      >
        {value}
      </span>
    </div>
  );
}
