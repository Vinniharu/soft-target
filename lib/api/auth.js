import { apiFetch } from "./client";
import { rawUrl } from "./config";
import { ApiError } from "./client";

export async function login(email, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
}

export async function refresh(refreshToken) {
  return apiFetch("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
    skipAuth: true,
  });
}

export async function health() {
  const res = await fetch(rawUrl("/healthz"));
  if (!res.ok) {
    throw new ApiError("Health check failed", { status: res.status });
  }
  return res.json();
}
