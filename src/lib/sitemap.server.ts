/** Shared helpers for the XML sitemap routes (server-only). */

export const SITEMAP_BASE = "https://hiradhesive.com";

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** ISO date (YYYY-MM-DD) from a DB timestamp, or null when unknown. */
export function lastmod(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function xmlResponse(xml: string) {
  return new Response(xml, {
    headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
  });
}

type ProductRow = {
  slug: string;
  name: string;
  image: string | null;
  short: string | null;
  updated_at: string | null;
};

type BlogRow = {
  slug: string;
  title: string;
  image: string | null;
  updated_at: string | null;
  published_at: string | null;
};

/** Published products, same filter as the public product routes. */
export async function fetchSitemapProducts(): Promise<ProductRow[]> {
  try {
    const { getPublicProducts } = await import("@/lib/db/index.server");
    const products = await getPublicProducts();
    return products.map(p => ({
      slug: p.slug,
      name: p.name,
      image: p.image,
      short: p.short,
      updated_at: p.updated_at,
    }));
  } catch (error) {
    console.error('[sitemap] Failed to fetch products:', error);
    return [];
  }
}

/** Published blogs, same filter as the public blog routes. */
export async function fetchSitemapBlogs(): Promise<BlogRow[]> {
  try {
    const { getPublicBlogs } = await import("@/lib/db/index.server");
    const blogs = await getPublicBlogs();
    return blogs.map(b => ({
      slug: b.slug,
      title: b.title,
      image: b.image,
      updated_at: b.updated_at,
      published_at: b.published_at,
    }));
  } catch (error) {
    console.error('[sitemap] Failed to fetch blogs:', error);
    return [];
  }
}

/** Absolute URL for an image path that may already be absolute. */
export function imgUrl(path: string): string {
  const encoded = /^https?:\/\//i.test(path)
    ? path
    : `${SITEMAP_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  // Encode spaces and other unsafe characters so the XML stays valid.
  return encodeURI(encoded);
}

/**
 * Wraps a sitemap GET handler so a backend hiccup returns a valid (empty)
 * urlset with a short cache TTL instead of a 500 that crawlers penalise.
 */
export function safeSitemap(build: () => Promise<string> | string) {
  return async () => {
    try {
      return xmlResponse(await build());
    } catch (error) {
      console.error("[sitemap] generation failed", error);
      const fallback = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      ].join("\n");
      return new Response(fallback, {
        headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=60" },
      });
    }
  };
}
