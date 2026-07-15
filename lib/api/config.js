const FALLBACK_API_BASE = "http://41.242.60.230:4382";

export const API_BASE =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
  FALLBACK_API_BASE;

export const API_PREFIX = "/api/v1";

export function apiUrl(path) {
  const cleaned = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${API_PREFIX}${cleaned}`;
}

export function rawUrl(path) {
  const cleaned = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${cleaned}`;
}
