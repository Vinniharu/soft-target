import { apiFetch } from "./client";

export async function getMyOrg() {
  return apiFetch("/org/me");
}

export async function listMyOrgUsers({ limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch(`/org/users?${params.toString()}`);
}

export async function getMyOrgUser(userId) {
  return apiFetch(`/org/users/${encodeURIComponent(userId)}`);
}

export async function createMyOrgUser({ email, password, name }) {
  return apiFetch("/org/users", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export async function updateMyOrgUser(userId, { email, password, name } = {}) {
  const body = {};
  if (email !== undefined) body.email = email;
  if (name !== undefined) body.name = name;
  if (password !== undefined && password !== "") body.password = password;
  return apiFetch(`/org/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteMyOrgUser(userId) {
  return apiFetch(`/org/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}

export async function listMyOrgReports({ limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch(`/org/reports?${params.toString()}`);
}

export async function getOrgReport(reportId) {
  return apiFetch(`/org/reports/${encodeURIComponent(reportId)}`);
}

export async function updateOrgReport(reportId, { case_id, payload } = {}) {
  const body = {};
  if (case_id !== undefined) body.case_id = case_id;
  if (payload !== undefined) body.payload = payload;
  return apiFetch(`/org/reports/${encodeURIComponent(reportId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteOrgReport(reportId) {
  return apiFetch(`/org/reports/${encodeURIComponent(reportId)}`, {
    method: "DELETE",
  });
}

export async function downloadOrgReportPdf(reportId, caseId, version) {
  const res = await apiFetch(`/org/reports/${encodeURIComponent(reportId)}/pdf`, {
    raw: true,
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const filename =
    match?.[1] ||
    `${caseId || "report"}-v${version || "1"}.pdf`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return filename;
}

