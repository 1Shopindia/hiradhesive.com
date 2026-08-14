import { Download } from "lucide-react";
import { useSiteSettings } from "@/lib/settings-store";

/**
 * Download button for the main HIR company catalogue.
 * Renders nothing until an admin uploads a catalogue in the dashboard.
 */
export function CatalogueDownload({ variant = "light", className = "" }: { variant?: "light" | "dark"; className?: string }) {
  const settings = useSiteSettings();
  const url = settings.catalogue_pdf;
  if (!url) return null;

  const title = settings.catalogue_title || "HIR Master Product Catalogue";
  const base = "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all hover:-translate-y-0.5";
  const skin = variant === "dark"
    ? "bg-white/10 border border-white/20 text-white hover:bg-brand hover:border-brand"
    : "bg-brand text-white hover:brightness-110";

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Force download by fetching and creating blob
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'HIR-Industries-Catalogue.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(error => {
        console.error('Download failed:', error);
        // Fallback to direct link
        window.open(url, '_blank');
      });
  };

  return (
    <a
      href={url}
      onClick={handleDownload}
      aria-label={`Download ${title} (PDF)`}
      className={`${base} ${skin} ${className}`}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Download Catalogue (PDF)
    </a>
  );
}
