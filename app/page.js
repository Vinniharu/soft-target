"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/auth/AuthContext";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [hydrated, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <PageSpinner label="Loading" />
    </div>
  );
}
