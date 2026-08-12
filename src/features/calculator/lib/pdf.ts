import { BRAND, SITE_URL } from "@/lib/seo";

export interface PdfRow {
  label: string;
  value: string;
}

export interface PdfPayload {
  title: string;
  calcId: string;
  inputs: PdfRow[];
  results: PdfRow[];
  recommendations: string[];
  note?: string;
}

const NAVY: [number, number, number] = [26, 30, 92];
const ORANGE: [number, number, number] = [255, 106, 0];

async function loadLogo(): Promise<string | null> {
  try {
    const res = await fetch("/images/hir-logo-pdf.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function downloadCalculationPdf(payload: PdfPayload) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const M = 40;

  // Header band
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 92, "F");
  const logo = await loadLogo();
  if (logo) {
    try {
      // White panel keeps the navy/orange mark legible on the dark band.
      const lw = 108;
      const lh = lw * (850 / 1600);
      doc.setFillColor(255, 255, 255);
      doc.rect(M - 6, 14, lw + 12, lh + 12, "F");
      doc.addImage(logo, "PNG", M, 20, lw, lh, "hir-logo", "NONE");
    } catch {
      /* logo optional */
    }
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("HIR Material Calculator", pageW - M, 40, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(payload.title, pageW - M, 56, { align: "right" });
  doc.text(new Date().toLocaleString("en-IN"), pageW - M, 70, { align: "right" });

  let y = 122;
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(payload.title, M, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 120);
  doc.text(`Calculation ID: ${payload.calcId}`, M, y);
  y += 24;

  const section = (heading: string, rows: PdfRow[]) => {
    doc.setFillColor(...ORANGE);
    doc.rect(M, y - 11, 4, 14, "F");
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(heading, M + 12, y);
    y += 14;
    doc.setFontSize(10);
    rows.forEach((r, i) => {
      if (y > 760) {
        doc.addPage();
        y = 60;
      }
      if (i % 2 === 0) {
        doc.setFillColor(246, 247, 251);
        doc.rect(M, y - 9, pageW - M * 2, 18, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 84, 100);
      doc.text(r.label, M + 8, y + 3);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 22, 40);
      doc.text(r.value, pageW - M - 8, y + 3, { align: "right" });
      y += 18;
    });
    y += 18;
  };

  section("Your Inputs", payload.inputs);
  section("Calculated Results", payload.results);

  if (payload.recommendations.length) {
    doc.setFillColor(...ORANGE);
    doc.rect(M, y - 11, 4, 14, "F");
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Recommended HIR Products", M + 12, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 64, 82);
    payload.recommendations.forEach(line => {
      const wrapped = doc.splitTextToSize(`•  ${line}`, pageW - M * 2 - 10);
      doc.text(wrapped, M + 8, y);
      y += wrapped.length * 13 + 4;
    });
    y += 12;
  }

  if (payload.note) {
    doc.setFontSize(8);
    doc.setTextColor(130, 132, 145);
    const note = doc.splitTextToSize(payload.note, pageW - M * 2);
    doc.text(note, M, y);
  }

  // Footer
  const h = doc.internal.pageSize.getHeight();
  doc.setFillColor(...NAVY);
  doc.rect(0, h - 58, pageW, 58, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text(BRAND.legalName, M, h - 36);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${BRAND.streetAddress}, ${BRAND.addressLocality}, ${BRAND.addressRegion} ${BRAND.postalCode}`,
    M,
    h - 24,
  );
  doc.text(`${BRAND.phone}  |  ${BRAND.email}  |  ${SITE_URL}`, M, h - 12);

  doc.save(`${payload.calcId}.pdf`);
}
