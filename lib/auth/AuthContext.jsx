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
  userFromTokens,
} from "./tokenStorage";
import { login as apiLogin } from "../api/auth";
import { getMe } from "../api/me";

const AuthContext = createContext(null);

function mergeUser(jwtUser, profile) {
  if (!profile) return jwtUser;
  return {
    id: profile.id ?? jwtUser?.id ?? null,
    email: profile.email ?? jwtUser?.email ?? null,
    name: profile.name ?? null,
    role: profile.role ?? jwtUser?.role ?? "user",
    created_at: profile.created_at ?? null,
    updated_at: profile.updated_at ?? null,
  };
}

export function AuthProvider({ children }) {
  const router = useRouter();
  const [tokens, setTokens] = useState(null);
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  const refreshProfile = useCallback(async (fallbackUser) => {
    try {
      const profile = await getMe();
      setUser((prev) => mergeUser(prev || fallbackUser, profile));
      return profile;
    } catch {
      // Keep JWT-derived user on failure (non-fatal)
      return null;
    }
  }, []);

  useEffect(() => {
    const existing = getTokens();
    if (existing) {
      const jwtUser = userFromTokens(existing);
      setTokens(existing);
      setUser(jwtUser);
      refreshProfile(jwtUser).finally(() => setHydrated(true));
    } else {
      setHydrated(true);
    }
  }, [refreshProfile]);

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

  const login = useCallback(
    async (email, password) => {
      const result = await apiLogin(email, password);
      saveTokens(result);
      setTokens(result);
      const jwtUser = userFromTokens(result);
      // Seed role from login response immediately
      const seeded = jwtUser
        ? { ...jwtUser, role: result.role || jwtUser.role || "user" }
        : { id: null, email, role: result.role || "user" };
      setUser(seeded);
      // Fetch authoritative profile (includes name)
      await refreshProfile(seeded);
      return result;
    },
    [refreshProfile],
  );

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
