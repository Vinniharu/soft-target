"use client";

import React, { useRef, useState } from "react";
import { Download, ImageIcon } from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/Button";
import DocumentTemplate from "@/components/DocumentTemplate";
import { useToast } from "@/lib/toast/ToastContext";

export function ReportPreviewPanel({
  data,
  caseId,
  version,
}) {
  const reportRef = useRef(null);
  const toast = useToast();
  const [exportingImage, setExportingImage] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  async function capturePng() {
    // Wait for fonts so the capture renders in Inter, not a fallback
    if (typeof document !== "undefined" && document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        // ignore font loading errors
      }
    }
    return toPng(reportRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });
  }

  const handleImage = async () => {
    if (!reportRef.current) return;
    setExportingImage(true);
    try {
      const dataUrl = await capturePng();
      const link = document.createElement("a");
      link.download = `${caseId || "report"}-v${version || "draft"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      toast.error("Image export failed", err.message);
    } finally {
      setExportingImage(false);
    }
  };

  const handlePdf = async () => {
    if (!reportRef.current) return;
    setExportingPdf(true);
    try {
      const dataUrl = await capturePng();

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const scaledHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (scaledHeight <= pdfHeight) {
        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, scaledHeight, undefined, "FAST");
      } else {
        // Document is taller than one A4 page — slice it across pages
        const pageHeightPx =
          (pdfHeight * imgProps.width) / pdfWidth;
        let positionPx = 0;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = await loadImage(dataUrl);

        canvas.width = imgProps.width;
        canvas.height = pageHeightPx;

        while (positionPx < imgProps.height) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, -positionPx);
          const sliceUrl = canvas.toDataURL("image/png");
          if (positionPx > 0) pdf.addPage();
          pdf.addImage(
            sliceUrl,
            "PNG",
            0,
            0,
            pdfWidth,
            pdfHeight,
            undefined,
            "FAST",
          );
          positionPx += pageHeightPx;
        }
      }

      pdf.save(`${caseId || "report"}-v${version || "draft"}.pdf`);
    } catch (err) {
      toast.error("PDF export failed", err.message);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3">
        <div className="flex-1 min-w-0 text-sm">
          <div className="font-semibold text-[var(--color-foreground)]">
            Document preview
          </div>
          <div className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
            A4 render — downloads match exactly.
          </div>
        </div>
        <Button variant="outline" onClick={handleImage} isLoading={exportingImage}>
          <ImageIcon className="h-4 w-4" /> PNG
        </Button>
        <Button onClick={handlePdf} isLoading={exportingPdf}>
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </div>

      {/* Preview — DocumentTemplate is captured as-is; identical to download */}
      <div className="flex justify-center p-2 md:p-6 bg-slate-900 rounded-lg overflow-auto">
        <div className="scale-[0.55] sm:scale-[0.7] md:scale-[0.85] origin-top shadow-2xl">
          <DocumentTemplate ref={reportRef} data={data} />
        </div>
      </div>
    </div>
  );
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
