import { apiFetch } from "./client";

export async function listOrganisations({
  limit = 50,
  offset = 0,
  includeDeleted = false,
} = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (includeDeleted) params.set("include_deleted", "true");
  return apiFetch(`/admin/organisations?${params.toString()}`);
}

export async function getOrganisation(orgId) {
  return apiFetch(`/admin/organisations/${encodeURIComponent(orgId)}`);
}

export async function createOrganisation({ name, owner }) {
  return apiFetch("/admin/organisations", {
    method: "POST",
    body: JSON.stringify({ name, owner }),
  });
}

export async function renameOrganisation(orgId, { name }) {
  return apiFetch(`/admin/organisations/${encodeURIComponent(orgId)}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function deleteOrganisation(orgId) {
  return apiFetch(`/admin/organisations/${encodeURIComponent(orgId)}`, {
    method: "DELETE",
  });
}

export async function listOrgUsers(orgId, { limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch(
    `/admin/organisations/${encodeURIComponent(orgId)}/users?${params.toString()}`,
  );
}

export async function createUserInOrg(orgId, { email, password, name, role }) {
  const body = { email, password, name };
  if (role !== undefined) body.role = role;
  return apiFetch(
    `/admin/organisations/${encodeURIComponent(orgId)}/users`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function listOrgReports(orgId, { limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch(
    `/admin/organisations/${encodeURIComponent(orgId)}/reports?${params.toString()}`,
  );
}
