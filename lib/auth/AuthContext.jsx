"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  clearTokens,
  getTokens,
  saveTokens,
} from "./tokenStorage";
import { login as apiLogin } from "../api/auth";
import { getMe } from "../api/me";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [tokens, setTokens] = useState(null);
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate session on mount: if tokens exist, fetch /auth/me as the
  // authoritative profile. Never decode the JWT client-side.
  useEffect(() => {
    const existing = getTokens();
    if (!existing) {
      setHydrated(true);
      return;
    }
    setTokens(existing);
    let cancelled = false;
    getMe()
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch(() => {
        // /me failed (token dead or refresh failed) — clear and continue
        if (cancelled) return;
        clearTokens();
        setTokens(null);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Global "session expired" handler fired by the API client.
  useEffect(() => {
    const onExpired = () => {
      setTokens(null);
      setUser(null);
      clearTokens();
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const publicPaths = ["/", "/login"];
        if (!publicPaths.includes(path)) {
          router.replace("/login");
        }
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("auth:expired", onExpired);
      return () => window.removeEventListener("auth:expired", onExpired);
    }
  }, [router]);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getMe();
      setUser(profile);
      return profile;
    } catch {
      return null;
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await apiLogin(email, password);
    saveTokens(result);
    setTokens(result);
    // Try to fetch the authoritative profile from /auth/me. Fall back to a
    // minimal user object built from the login response if /me fails.
    try {
      const profile = await getMe();
      setUser(profile);
    } catch {
      setUser({
        id: null,
        email,
        name: null,
        role: result.role || "user",
      });
    }
    return result; // login form reads `role` for routing
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setTokens(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      tokens,
      user,
      hydrated,
      isAuthenticated: !!tokens,
      isAdmin: user?.role === "admin",
      login,
      logout,
      refreshProfile,
    }),
    [tokens, user, hydrated, login, logout, refreshProfile],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
