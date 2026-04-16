"use client";

import React from "react";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ToastProvider } from "@/lib/toast/ToastContext";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
