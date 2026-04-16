"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { isAdmin, hydrated, isAuthenticated } = useAuth();

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace("/login");
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) return <PageSpinner label="Verifying access" />;

  if (!isAdmin) {
    return (
      <EmptyState
        icon={Lock}
        title="Access restricted"
        description="This section is only available to administrators. If you need access, contact your system administrator."
      />
    );
  }

  return children;
}
