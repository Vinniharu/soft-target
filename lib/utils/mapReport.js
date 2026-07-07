function toNumberOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function buildCoordinates(lat, lng) {
  const latitude = toNumberOrNull(lat);
  const longitude = toNumberOrNull(lng);
  if (latitude == null || longitude == null) return null;
  if (latitude < -90 || latitude > 90) return null;
  if (longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}

function formatCoordsDisplay(lat, lng) {
  const latitude = toNumberOrNull(lat);
  const longitude = toNumberOrNull(lng);
  if (latitude == null || longitude == null) return "";
  return `${latitude}, ${longitude}`;
}

function nullIfBlank(v) {
  if (v === undefined || v === null) return null;
  const trimmed = String(v).trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function formToApi(form) {
  const imeiNumbers = [form?.target?.imei, form?.target?.imei2]
    .map(nullIfBlank)
    .filter(Boolean);
  const phoneNumbers = [form?.target?.phone, form?.target?.altPhone]
    .map(nullIfBlank)
    .filter(Boolean);

  return {
    case_id: (form?.caseId || "").trim(),
    payload: {
      primary_target: {
        name: nullIfBlank(form?.target?.name),
        imei_numbers: imeiNumbers,
        phone_numbers: phoneNumbers,
        location: nullIfBlank(form?.target?.location),
        coordinates: buildCoordinates(form?.target?.lat, form?.target?.lng),
        notes: nullIfBlank(form?.target?.notes),
      },
      soft_targets: (form?.softTargets || []).map((t) => ({
        phone: nullIfBlank(t?.phone),
        location: nullIfBlank(t?.location),
        coordinates: buildCoordinates(t?.lat, t?.lng),
        notes: nullIfBlank(t?.notes),
      })),
      summary: nullIfBlank(form?.summary || form?.generalNote || form?.general_note),
      general_note: nullIfBlank(form?.generalNote || form?.general_note || form?.summary),
    },
  };
}

export function apiToForm(report) {
  if (!report) return null;
  const data = report.data || report.payload || report;
  const pt = data?.primary_target || {};
  const softs = data?.soft_targets || [];

  const ptCoords = pt.coordinates || null;
  const ptLat = ptCoords?.latitude ?? "";
  const ptLng = ptCoords?.longitude ?? "";

  return {
    caseId: report.case_id || "",
    date: (report.created_at || new Date().toISOString()).split("T")[0],
    target: {
      name: pt.name || "",
      imei: pt.imei_numbers?.[0] || "",
      imei2: pt.imei_numbers?.[1] || "",
      phone: pt.phone_numbers?.[0] || "",
      altPhone: pt.phone_numbers?.[1] || "",
      location: pt.location || "",
      lat: ptLat,
      lng: ptLng,
      coordinates: formatCoordsDisplay(ptLat, ptLng),
      notes: pt.notes || "",
    },
    softTargets: softs.length
      ? softs.map((t) => ({
          phone: t.phone || "",
          location: t.location || "",
          lat: t.coordinates?.latitude ?? "",
          lng: t.coordinates?.longitude ?? "",
          notes: t.notes || "",
        }))
      : [{ phone: "", location: "", lat: "", lng: "", notes: "" }],
    summary: data?.summary || data?.general_note || data?.generalNote || "",
    generalNote:
      data?.general_note ||
      data?.generalNote ||
      data?.general_notes ||
      data?.generalNotes ||
      data?.notes ||
      data?.summary ||
      report?.general_note ||
      report?.generalNote ||
      report?.notes ||
      "",
  };
}

export function emptyForm() {
  return {
    caseId: "",
    date: new Date().toISOString().split("T")[0],
    target: {
      name: "",
      imei: "",
      imei2: "",
      phone: "",
      altPhone: "",
      location: "",
      lat: "",
      lng: "",
      coordinates: "",
      notes: "",
    },
    softTargets: [{ phone: "", location: "", lat: "", lng: "", notes: "" }],
    summary: "",
    generalNote: "",
  };
}
