import React, { forwardRef } from "react";

const DocumentTemplate = forwardRef(({ data }, ref) => {
  if (!data) return null;

  const summaryText =
    data.summary ||
    data.generalNote ||
    data.general_note ||
    data.general_notes ||
    data.notes ||
    (typeof data.general === "string" ? data.general : null);

  const hasSoftTargetNotes = data.softTargets?.some(
    (t) => t?.notes && String(t.notes).trim() !== ""
  );

  return (
    <div
      ref={ref}
      className="bg-white text-black p-8 md:p-12 w-[210mm] min-h-[297mm] mx-auto shadow-2xl relative font-sans"
    >
      {/* Header */}
      <div className="border-b-4 border-red-600 pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
            Investigation Report
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              Confidential
            </span>
            <span className="text-xs text-red-600 font-bold uppercase tracking-wider">
              // Law Enforcement Sensitive
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-gray-900">
            CASE ID: <span className="font-mono text-base">{data.caseId}</span>
          </div>
          <div className="text-sm text-gray-600">DATE: {data.date}</div>
        </div>
      </div>

      {/* Target Info */}
      <div className="mb-8">
        <h2 className="text-xl font-bold uppercase text-red-600 border-b-2 border-gray-100 mb-4 pb-1 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-600"></span> Primary Target
          Information
        </h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2.5 font-bold w-1/4 text-gray-500 uppercase text-xs tracking-wider">
                IMEI 1
              </td>
              <td className="py-2.5 font-mono font-bold text-black">
                {data.target?.imei || "N/A"}
              </td>
              <td className="py-2.5 font-bold w-1/4 text-gray-500 uppercase text-xs tracking-wider">
                IMEI 2
              </td>
              <td className="py-2.5 font-mono font-bold text-black">
                {data.target?.imei2 || "N/A"}
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2.5 font-bold w-1/4 text-gray-500 uppercase text-xs tracking-wider">
                Phone Number
              </td>
              <td className="py-2.5 font-mono font-bold text-lg text-black">
                {data.target?.phone || "N/A"}
              </td>
              <td className="py-2.5 font-bold w-1/4 text-gray-500 uppercase text-xs tracking-wider">
                Alt Number
              </td>
              <td className="py-2.5 font-mono font-bold text-lg text-black">
                {data.target?.altPhone || "N/A"}
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2.5 font-bold text-gray-500 uppercase text-xs tracking-wider">
                Primary Location
              </td>
              <td className="py-2.5 font-medium text-black" colSpan="3">
                {data.target?.location || "N/A"}
              </td>
            </tr>
            <tr className={data.target?.notes && String(data.target.notes).trim() !== "" ? "border-b border-gray-100" : ""}>
              <td className="py-2.5 font-bold text-gray-500 uppercase text-xs tracking-wider">
                Coordinates
              </td>
              <td className="py-2.5 font-mono text-black" colSpan="3">
                {data.target?.coordinates || "N/A"}
              </td>
            </tr>
            {data.target?.notes && String(data.target.notes).trim() !== "" && (
              <tr>
                <td className="py-2.5 font-bold text-gray-500 uppercase text-xs tracking-wider align-top">
                  Notes
                </td>
                <td
                  className="py-2.5 font-sans text-black whitespace-pre-wrap"
                  colSpan="3"
                >
                  {data.target.notes}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Soft Target List */}
      <div className="mb-8">
        <h2 className="text-xl font-bold uppercase text-red-600 border-b-2 border-gray-100 mb-4 pb-1 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-600"></span> Soft Target Analysis
        </h2>
        <div className="overflow-hidden border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-900 uppercase font-black text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 border-r border-gray-200 w-12 text-center text-red-600">
                  #
                </th>
                <th className="px-4 py-3 border-r border-gray-200">
                  Phone Number
                </th>
                <th className="px-4 py-3 border-r border-gray-200">Location</th>
                <th className="px-4 py-3 text-right">Coordinates</th>
                {hasSoftTargetNotes && (
                  <th className="px-4 py-3 border-l border-gray-200">Notes</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.softTargets?.map((target, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-4 py-2.5 font-bold text-center text-red-600 border-r border-gray-100">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2.5 font-mono font-medium border-r border-gray-100">
                    {target.phone || "-"}
                  </td>
                  <td className="px-4 py-2.5 border-r border-gray-100">
                    {target.location || "-"}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-right text-xs text-gray-500">
                    {target.lat && target.lng
                      ? `${target.lat}, ${target.lng}`
                      : target.lat || target.lng || "-"}
                  </td>
                  {hasSoftTargetNotes && (
                    <td className="px-4 py-2.5 border-l border-gray-100 font-sans text-xs text-gray-700 whitespace-pre-wrap">
                      {target.notes || "-"}
                    </td>
                  )}
                </tr>
              ))}
              {(!data.softTargets || data.softTargets.length === 0) && (
                <tr>
                  <td
                    colSpan={hasSoftTargetNotes ? "5" : "4"}
                    className="px-4 py-12 text-center text-gray-400 italic bg-gray-50"
                  >
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {summaryText && String(summaryText).trim() !== "" && (
        <div className="mb-12">
          <h2 className="text-xl font-bold uppercase text-red-600 border-b-2 border-gray-100 mb-4 pb-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600"></span> Summary
          </h2>
          <div className="bg-gray-50 border border-gray-200 p-4 text-sm font-sans text-gray-800 whitespace-pre-wrap leading-relaxed">
            {summaryText}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 border-t-2 border-red-600 pt-4 flex justify-between text-[10px] uppercase font-bold tracking-widest text-red-600/50">
        <div>Soft Target v1.0 // Generated Report</div>
        <div>Confidential // Official Report</div>
      </div>
    </div>
  );
});

DocumentTemplate.displayName = "DocumentTemplate";
export default DocumentTemplate;
