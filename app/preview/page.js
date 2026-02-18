"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/Button";
import DocumentTemplate from "@/components/DocumentTemplate";

export default function DocumentPreview() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("soft-target-draft");
    if (!saved) {
      router.push("/create");
      return;
    }
    setData(JSON.parse(saved));
    setLoading(false);
  }, [router]);

  const handleDownloadImage = async () => {
    if (reportRef.current === null) return;

    try {
      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `report-${data.caseId || "draft"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
      alert("Failed to generate image. See console for details.");
    }
  };

  const handleDownloadPDF = async () => {
    if (reportRef.current === null) return;

    try {
      // 1. Capture content as image first to ensure exact visual fidelity
      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      // 2. Create PDF (A4 dimensions in mm: 210 x 297)
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`report-${data.caseId || "draft"}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to generate PDF. See console for details.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading preview...
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-20">
      {/* Toolbar */}
      <div className="sticky top-16 z-40 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-border)] p-4 flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button variant="ghost" onClick={() => router.push("/create")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit
          </Button>
          <h2 className="font-bold hidden md:block">Document Preview</h2>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button variant="secondary" onClick={handleDownloadImage}>
            <ImageIcon className="mr-2 h-4 w-4" /> Download Image
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex justify-center p-4 md:p-8 bg-gray-900 overflow-auto">
        <div className="scale-[0.6] md:scale-[0.85] origin-top shadow-2xl">
          <DocumentTemplate ref={reportRef} data={data} />
        </div>
      </div>
    </div>
  );
}
