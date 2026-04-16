"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Shield } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { UserForm } from "@/components/admin/UserForm";
import { listUsers, updateUser, deleteUser } from "@/lib/api/users";
import { useToast } from "@/lib/toast/ToastContext";
import { formatApiError, formatDate } from "@/lib/utils/format";
import { useAuth } from "@/lib/auth/AuthContext";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isSelf = currentUser?.id && userId === currentUser.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await listUsers({ limit: 200 });
        if (cancelled) return;
        const found = (res.items || []).find((u) => u.id === userId);
        setTarget(found || null);
      } catch (err) {
        toast.error("Failed to load user", formatApiError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, toast]);

  const handleUpdate = async (form) => {
    const body = { email: form.email, name: form.name, role: form.role };
    if (form.password && form.password.length > 0) body.password = form.password;
    const updated = await updateUser(userId, body);
    toast.success("User updated", updated.name || updated.email);
    setTarget(updated);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUser(userId);
      toast.success("User deleted", target?.name || target?.email);
      router.push("/admin/users");
    } catch (err) {
      toast.error("Delete failed", formatApiError(err));
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) return <PageSpinner label="Loading user" />;
  if (!target) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          User not found.
        </p>
        <Button className="mt-4" onClick={() => router.push("/admin/users")}>
          Back to users
        </Button>
      </div>
    );
  }

  const displayName = target.name || target.email;

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/admin/users")}
        className="mb-3 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Button>

      <PageHeader
        eyebrow="User"
        title={displayName}
        description={target.email}
        actions={
          !isSelf && (
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(true)}
              className="text-[var(--color-danger)] border-red-200 hover:bg-[var(--color-danger-subtle)]"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={target.role === "admin" ? "default" : "secondary"}>
            {target.role === "admin" && <Shield className="h-3 w-3" />}
            {target.role}
          </Badge>
          {isSelf && <Badge variant="outline">That's you</Badge>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
              Edit user
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
              Update the account details below.
            </p>
          </div>
          <CardContent className="p-6">
            <UserForm
              mode="edit"
              initialValues={{
                name: target.name || "",
                email: target.email,
                password: "",
                role: target.role,
              }}
              onSubmit={handleUpdate}
              submitLabel="Save changes"
            />
          </CardContent>
        </Card>

        <Card>
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
              Details
            </h3>
          </div>
          <CardContent className="p-6 space-y-3 text-sm">
            <MetaRow label="User ID" value={target.id} mono />
            <MetaRow label="Name" value={target.name || "—"} />
            <MetaRow label="Email" value={target.email} />
            <MetaRow label="Role" value={target.role} />
            <MetaRow label="Created" value={formatDate(target.created_at)} />
            <MetaRow label="Updated" value={formatDate(target.updated_at)} />
            {isSelf && (
              <div className="mt-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-xs text-[var(--color-muted-foreground)]">
                You can't delete your own account.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${displayName}?`}
        description="This will soft-delete the account and revoke all their active sessions. This action can be reversed by the backend admin if needed."
        confirmLabel="Delete user"
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
