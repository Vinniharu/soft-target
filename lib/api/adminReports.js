import { apiFetch } from "./client";

export async function updateReport(reportId, { case_id, payload }) {
  const body = {};
  if (case_id !== undefined) body.case_id = case_id;
  if (payload !== undefined) body.payload = payload;
  return apiFetch(`/admin/reports/${encodeURIComponent(reportId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteReport(reportId) {
  return apiFetch(`/admin/reports/${encodeURIComponent(reportId)}`, {
    method: "DELETE",
  });
}
