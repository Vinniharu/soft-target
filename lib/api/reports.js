import { apiFetch } from "./client";

export async function listReports({ limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch(`/reports?${params.toString()}`);
}

export async function getReport(reportId) {
  return apiFetch(`/reports/${encodeURIComponent(reportId)}`);
}

export async function createReport({ case_id, payload }) {
  return apiFetch("/reports", {
    method: "POST",
    body: JSON.stringify({ case_id, payload }),
  });
}

export async function updateMyReport(reportId, { case_id, payload }) {
  const body = {};
  if (case_id !== undefined) body.case_id = case_id;
  if (payload !== undefined) body.payload = payload;
  return apiFetch(`/reports/${encodeURIComponent(reportId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function downloadReportPdf(reportId, caseId, version) {
  const res = await apiFetch(`/reports/${encodeURIComponent(reportId)}/pdf`, {
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
