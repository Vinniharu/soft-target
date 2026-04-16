const STORAGE_KEY = "st.tokens";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getTokens() {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.access_token || !parsed?.refresh_token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveTokens(tokens) {
  if (!isBrowser() || !tokens) return;
  const withTime = { ...tokens, saved_at: Date.now() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withTime));
}

export function clearTokens() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function decodeJwt(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = payload.length % 4;
    const padded = pad ? payload + "=".repeat(4 - pad) : payload;
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    try {
      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const pad = payload.length % 4;
      const padded = pad ? payload + "=".repeat(4 - pad) : payload;
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }
}

export function userFromTokens(tokens) {
  if (!tokens?.access_token) return null;
  const claims = decodeJwt(tokens.access_token);
  if (!claims) return null;
  return {
    id: claims.sub || claims.user_id || null,
    email: claims.email || null,
    role: claims.role || "user",
    exp: claims.exp || null,
  };
}
