export const ROLES = {
  ADMIN: "admin",
  ORG_OWNER: "org_owner",
  USER: "user",
};

export function roleLabel(role) {
  if (role === ROLES.ADMIN) return "Administrator";
  if (role === ROLES.ORG_OWNER) return "Organisation owner";
  if (role === ROLES.USER) return "Operator";
  return role || "—";
}

export function homeForRole(role) {
  if (role === ROLES.ADMIN) return "/admin/organisations";
  if (role === ROLES.ORG_OWNER) return "/org/reports";
  return "/reports";
}

export function canEditReport(user, report) {
  if (!user || !report) return false;
  if (user.role === ROLES.ADMIN) return true;
  if (user.role === ROLES.ORG_OWNER) {
    if (report.user_id === user.id) return true;
    const userOrgId = user.organisation?.id;
    return !!userOrgId && (report.organisation_id === userOrgId || report.creator?.organisation?.id === userOrgId);
  }
  return report.user_id === user.id;
}

export function canDeleteReport(user, report) {
  if (!user || !report) return false;
  if (user.role === ROLES.ADMIN) return true;
  if (user.role === ROLES.ORG_OWNER) {
    if (report.user_id === user.id) return true;
    const userOrgId = user.organisation?.id;
    return !!userOrgId && (report.organisation_id === userOrgId || report.creator?.organisation?.id === userOrgId);
  }
  return false;
}

