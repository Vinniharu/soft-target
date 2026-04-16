"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageSpinner } from "@/components/ui/Spinner";

export default function AppLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAuth();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageSpinner label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageSpinner label="Redirecting" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="max-w-7xl mx-auto w-full px-6 md:px-10 py-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
