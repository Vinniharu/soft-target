import { apiUrl } from "./config";
import { getTokens, saveTokens, clearTokens } from "../auth/tokenStorage";

export class ApiError extends Error {
  constructor(message, { status, detail, errors } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.errors = errors;
  }
}

async function parseErrorBody(res) {
  try {
    const body = await res.json();
    return {
      detail: body?.detail,
      errors: body?.errors,
    };
  } catch {
    return {};
  }
}

let refreshInFlight = null;

async function refreshAccessToken(refreshToken) {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const res = await fetch(apiUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      const { detail } = await parseErrorBody(res);
      throw new ApiError(detail || "Session expired", { status: res.status, detail });
    }
    return res.json();
  })();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

function emitAuthExpired() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("auth:expired"));
}

export async function apiFetch(path, init = {}) {
  const tokens = getTokens();
  const { raw = false, skipAuth = false, ...rest } = init;

  const doFetch = (accessToken) => {
    const headers = { ...(rest.headers || {}) };
    if (rest.body && !headers["Content-Type"] && typeof rest.body === "string") {
      headers["Content-Type"] = "application/json";
    }
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    return fetch(apiUrl(path), { ...rest, headers });
  };

  let res;
  try {
    res = await doFetch(skipAuth ? null : tokens?.access_token);
  } catch (e) {
    throw new ApiError(e.message || "Network error", { status: 0 });
  }

  if (res.status === 401 && !skipAuth && tokens?.refresh_token) {
    try {
      const fresh = await refreshAccessToken(tokens.refresh_token);
      saveTokens(fresh);
      res = await doFetch(fresh.access_token);
    } catch {
      clearTokens();
      emitAuthExpired();
      throw new ApiError("Session expired — please log in again", { status: 401 });
    }
  }

  if (!res.ok) {
    const { detail, errors } = await parseErrorBody(res);
    throw new ApiError(detail || `Request failed (${res.status})`, {
      status: res.status,
      detail,
      errors,
    });
  }

  if (raw) return res;
  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}
