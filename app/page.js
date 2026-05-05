"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/auth/AuthContext";
import { homeForRole } from "@/lib/auth/roles";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, hydrated, user } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    router.replace(homeForRole(user?.role));
  }, [hydrated, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <PageSpinner label="Loading" />
    </div>
  );
}
