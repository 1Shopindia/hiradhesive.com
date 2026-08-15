import { useEffect, useState } from "react";
import { products as seedProducts, blogs as seedBlogs } from "./site-data";
import type { CMSProduct, CMSBlog } from "./content-store-types";
import {
  listPublicProducts, listPublicBlogs,
  adminListProducts, adminListBlogs,
  adminSaveProduct, adminDeleteProduct,
  adminSaveBlog, adminDeleteBlog,
} from "./cms.functions";

export type { CMSProduct, CMSBlog };

/* ------------------------------------------------------------------ */
/* Admin auth token (shared with the client-side admin gate)          */
/* ------------------------------------------------------------------ */

// Match the client-side admin login in src/routes/admin.tsx.
const ADMIN_TOKEN = "Hir@2026";
const ADMIN_KEY = "hir_admin_authed_v2";

function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(ADMIN_KEY) === "1"; } catch { return false; }
}

/* ------------------------------------------------------------------ */
/* SSR seed (used only for the very first render before fetch lands)  */
/* ------------------------------------------------------------------ */

const BRAND_TAIL = "HIR Industries";

function trimTo(str: string, max: number): string {
  const clean = str.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:!?-]+$/, "") + "…";
}
function deriveProductSeoTitle(name: string, categoryLabel?: string | null, category?: string | null) {
  return trimTo(`${name} — ${categoryLabel || category || "Construction Chemicals"} | ${BRAND_TAIL}`, 60);
}
function deriveProductSeoDesc(name: string, short?: string | null, features?: string[] | null, area?: string | null) {
  if (short && short.length > 60) return trimTo(short, 158);
  const feat = features?.slice(0, 3).join(", ");
  return trimTo([`${name} by ${BRAND_TAIL}.`, area ? `${area}.` : "", short || "", feat ? `Key features: ${feat}.` : "", "Buy premium tile adhesive, grouts and construction chemicals."].filter(Boolean).join(" "), 158);
}
function deriveBlogSeoTitle(title: string) { return trimTo(`${title} | ${BRAND_TAIL} Blog`, 60); }
function deriveBlogSeoDesc(title: string, excerpt?: string | null, sections?: { body?: string }[]) {
  const src = excerpt || sections?.find(s => s.body)?.body || `${title}. Expert guidance from HIR Industries.`;
  return trimTo(src, 158);
}
function deriveBlogCategory(title: string, slug: string) {
  const t = `${title} ${slug}`.toLowerCase();
  if (t.includes("epoxy") || t.includes("grout")) return "Grouts & Sealants";
  if (t.includes("waterproof")) return "Waterproofing";
  if (t.includes("wall") || t.includes("putty")) return "Wall Solutions";
  if (t.includes("tile") || t.includes("adhesive")) return "Tile Adhesives";
  return "Construction Insights";
}

function seedProductsList(): CMSProduct[] {
  return seedProducts.map((p, i) => ({
    slug: p.slug, name: p.name, image: p.image ?? null, category: p.category,
    short: p.short ?? null, description: p.short ?? null,
    category_label: p.categoryLabel ?? null, application_area: p.applicationArea ?? null,
    pack: p.pack ?? null, coverage: p.coverage ?? null,
    surface: p.surface ?? null, color: p.color ?? null,
    features: p.features ?? null, applications: p.applications ?? null,
    gallery: [], video_url: null, published: true,
    seo_title: deriveProductSeoTitle(p.name, p.categoryLabel, p.category),
    seo_description: deriveProductSeoDesc(p.name, p.short, p.features, p.applicationArea),
    pdf: p.pdf ?? null, shades_image: p.shadesImage ?? null,
    application_list: p.applicationList ?? null, sort_order: i,
  }));
}
function seedBlogsList(): CMSBlog[] {
  return seedBlogs.map((b, i) => ({
    slug: b.slug, title: b.title, image: b.image ?? null, excerpt: b.excerpt ?? null,
    sections: b.sections, author: "HIR Industries",
    category: deriveBlogCategory(b.title, b.slug), published: true,
    published_at: new Date().toISOString(),
    seo_title: deriveBlogSeoTitle(b.title),
    seo_description: deriveBlogSeoDesc(b.title, b.excerpt, b.sections),
    sort_order: i,
  }));
}

/* ------------------------------------------------------------------ */
/* Snapshot cache — filled on first fetch, kept in-memory              */
/* ------------------------------------------------------------------ */

let productsSnap: CMSProduct[] | null = null;
let blogsSnap: CMSBlog[] | null = null;
let productsLoading: Promise<CMSProduct[]> | null = null;
let blogsLoading: Promise<CMSBlog[]> | null = null;
let lastError: Error | null = null;

const subs = new Set<() => void>();
function subscribe(cb: () => void) { subs.add(cb); return () => { subs.delete(cb); }; }
function notify() {
  subs.forEach(cb => {
    try { cb(); } catch (e) { console.error("[content-store] subscriber failed", e); }
  });
}

export function contentError(): Error | null { return lastError; }

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Runs a fetch with one retry; never rejects for transient network issues. */
async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let err: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const value = await fn();
      lastError = null;
      return value;
    } catch (e) {
      err = e;
      if (attempt === 0) await sleep(600);
    }
  }
  lastError = err instanceof Error ? err : new Error(String(err));
  console.error(`[content-store] ${label} failed`, lastError);
  throw lastError;
}

async function fetchProducts(): Promise<CMSProduct[]> {
  const list = await withRetry("listProducts", () =>
    isAdmin()
      ? adminListProducts({ data: { token: ADMIN_TOKEN } })
      : listPublicProducts(),
  );
  productsSnap = Array.isArray(list) ? list : [];
  notify();
  return productsSnap;
}
async function fetchBlogs(): Promise<CMSBlog[]> {
  const list = await withRetry("listBlogs", () =>
    isAdmin()
      ? adminListBlogs({ data: { token: ADMIN_TOKEN } })
      : listPublicBlogs(),
  );
  blogsSnap = Array.isArray(list) ? list : [];
  notify();
  return blogsSnap;
}

/**
 * Kick off a load. Failures are swallowed here on purpose: the hooks keep
 * showing the bundled seed content so the site never renders an empty page,
 * and the error stays readable through `contentError()`.
 */
function ensureProducts() {
  if (productsSnap || productsLoading) return;
  productsLoading = fetchProducts()
    .catch(() => productsSnap ?? seedProductsList())
    .finally(() => { productsLoading = null; });
}
function ensureBlogs() {
  if (blogsSnap || blogsLoading) return;
  blogsLoading = fetchBlogs()
    .catch(() => blogsSnap ?? seedBlogsList())
    .finally(() => { blogsLoading = null; });
}

/* ------------------------------------------------------------------ */
/* Mutations                                                          */
/* ------------------------------------------------------------------ */

export async function saveProduct(p: CMSProduct, originalSlug?: string) {
  await adminSaveProduct({ token: ADMIN_TOKEN, product: p, originalSlug });
  await fetchProducts();
}
export async function deleteProduct(slug: string) {
  await adminDeleteProduct({ token: ADMIN_TOKEN, slug });
  await fetchProducts();
}
export async function saveBlog(b: CMSBlog, originalSlug?: string) {
  await adminSaveBlog({ token: ADMIN_TOKEN, blog: b, originalSlug });
  await fetchBlogs();
}
export async function deleteBlog(slug: string) {
  await adminDeleteBlog({ token: ADMIN_TOKEN, slug });
  await fetchBlogs();
}

// Force a refresh from the server (e.g. after login state changes).
export async function refreshContent() {
  productsSnap = null; blogsSnap = null;
  // allSettled: one failing list must not block the other from refreshing.
  const results = await Promise.allSettled([fetchProducts(), fetchBlogs()]);
  const failed = results.find(r => r.status === "rejected");
  if (failed && failed.status === "rejected") {
    console.error("[content-store] refresh failed", failed.reason);
  }
}

/* ------------------------------------------------------------------ */
/* React hooks                                                        */
/* ------------------------------------------------------------------ */

export function useAllProducts(): CMSProduct[] {
  const [list, setList] = useState<CMSProduct[]>(() => productsSnap ?? seedProductsList());
  useEffect(() => {
    ensureProducts();
    if (productsSnap) setList(productsSnap);
    return subscribe(() => { if (productsSnap) setList([...productsSnap]); });
  }, []);
  return list;
}

export function useAllBlogs(): CMSBlog[] {
  const [list, setList] = useState<CMSBlog[]>(() => blogsSnap ?? seedBlogsList());
  useEffect(() => {
    ensureBlogs();
    if (blogsSnap) setList(blogsSnap);
    return subscribe(() => { if (blogsSnap) setList([...blogsSnap]); });
  }, []);
  return list;
}

export function usePublicProducts(): CMSProduct[] {
  return useAllProducts().filter(p => p.published).sort((a, b) => a.sort_order - b.sort_order);
}
export function usePublicBlogs(): CMSBlog[] {
  return useAllBlogs().filter(b => b.published).sort((a, b) => a.sort_order - b.sort_order);
}

/* ------------------------------------------------------------------ */
/* File → data URL helper (used by admin uploads)                     */
/* ------------------------------------------------------------------ */

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}
