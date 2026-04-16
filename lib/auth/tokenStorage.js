const STORAGE_KEY = "st.tokens";

function isBrowser() {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
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
