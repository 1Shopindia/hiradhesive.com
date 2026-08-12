import { jsPDF } from "jspdf";
import type { QuotePayload } from "./quote";

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string, mime: "image/png" | "image/jpeg"): void {
  const url = canvas.toDataURL(mime, 0.92);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function exportPdf(
  canvas: HTMLCanvasElement,
  spec: QuotePayload,
): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const imgData = canvas.toDataURL("image/jpeg", 0.9);

  const imgW = pageW - 60;
  const ratio = canvas.height / canvas.width;
  const imgH = imgW * ratio;
  doc.addImage(imgData, "JPEG", 30, 30, imgW, imgH);

  const y = Math.min(pageH - 130, 40 + imgH + 20);
  doc.setFontSize(14);
  doc.text("HIR Tile & Epoxy Visualizer", 30, y);
  doc.setFontSize(10);
  const lines = [
    `Design ID: ${spec.designId}`,
    `Room: ${spec.roomId}`,
    `Tile: ${spec.tile}    Size: ${spec.tileSize}`,
    `Epoxy: ${spec.epoxy}    Grout: ${spec.groutMm} mm, ${spec.groutFinish}`,
    `Created: ${new Date(spec.createdAt).toLocaleString()}`,
  ];
  lines.forEach((l, i) => doc.text(l, 30, y + 20 + i * 14));

  doc.save(`hir-design-${spec.designId}.pdf`);
}
