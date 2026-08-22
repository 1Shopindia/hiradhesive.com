import { useEffect, useState } from "react";
import { getSiteSettings, adminSaveSetting, adminUploadPdf, adminUploadImage } from "./cms.functions";

const ADMIN_TOKEN = "Hir@2026";

export type SiteSettings = Record<string, string>;

let snap: SiteSettings | null = null;
let loading: Promise<SiteSettings> | null = null;
const subs = new Set<() => void>();

async function fetchSettings(): Promise<SiteSettings> {
  const data = await getSiteSettings();
  snap = data ?? {};
  subs.forEach(cb => { try { cb(); } catch (e) { console.error("[settings]", e); } });
  return snap;
}

function ensure() {
  if (snap || loading) return;
  loading = fetchSettings()
    .catch(e => { console.error("[settings] load failed", e); return (snap ??= {}); })
    .finally(() => { loading = null; });
}

export function useSiteSettings(): SiteSettings {
  const [value, setValue] = useState<SiteSettings>(() => snap ?? {});
  useEffect(() => {
    ensure();
    if (snap) setValue(snap);
    const cb = () => { if (snap) setValue({ ...snap }); };
    subs.add(cb);
    return () => { subs.delete(cb); };
  }, []);
  return value;
}

export async function saveSetting(key: string, value: string | null) {
  await adminSaveSetting({ data: { token: ADMIN_TOKEN, key, value } });
  snap = null;
  await fetchSettings();
}

/** Uploads a PDF and returns the public download path. */
export async function uploadPdf(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
  const { url } = await uploadPdfRaw(file.name, dataUrl);
  return url;
}

async function uploadPdfRaw(filename: string, dataUrl: string) {
  return adminUploadPdf({ data: { token: ADMIN_TOKEN, filename, dataUrl } });
}

/** Uploads an image and returns the public URL. */
export async function uploadImage(file: File, bucket: "product-images" | "blog-images"): Promise<string> {
  console.log(`[settings-store] uploadImage called for bucket: ${bucket}, file: ${file.name}`);
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
  console.log(`[settings-store] File read as data URL, length: ${dataUrl.length}`);
  const { url } = await uploadImageRaw(bucket, file.name, dataUrl);
  console.log(`[settings-store] Upload complete, returned URL: ${url}`);
  return url;
}

async function uploadImageRaw(bucket: "product-images" | "blog-images", filename: string, dataUrl: string) {
  return adminUploadImage({ data: { token: ADMIN_TOKEN, bucket, filename, dataUrl } });
}
