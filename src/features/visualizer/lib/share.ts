import type { Design } from "../types";

// EXTENSION: replace with a real short-URL service when a backend is added.
// For now, share links carry only the design ID; the design payload lives in
// localStorage and is scoped to the same browser.
export function buildShareUrl(design: Design): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.searchParams.set("design", design.id);
  return url.toString();
}

export function shareWhatsApp(text: string, url: string): void {
  const encoded = encodeURIComponent(`${text}\n${url}`);
  window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener");
}

export function shareEmail(subject: string, body: string): void {
  const s = encodeURIComponent(subject);
  const b = encodeURIComponent(body);
  window.location.href = `mailto:?subject=${s}&body=${b}`;
}

export async function copyLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
