import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import {
  SITEMAP_BASE as BASE, escapeXml, fetchSitemapProducts, imgUrl, lastmod, safeSitemap,
} from "@/lib/sitemap.server";

export const Route = createFileRoute("/sitemap-products.xml")({
  server: {
    handlers: {
      GET: safeSitemap(async () => {
        const products = await fetchSitemapProducts();
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...products.map((p) => {
            const lm = lastmod(p.updated_at);
            return [
              `  <url>`,
              `    <loc>${BASE}/products/${p.slug}</loc>`,
              lm ? `    <lastmod>${lm}</lastmod>` : null,
              `    <changefreq>monthly</changefreq>`,
              `    <priority>0.8</priority>`,
              `    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/products/${p.slug}"/>`,
              `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/products/${p.slug}"/>`,
              p.image
                ? `    <image:image>\n      <image:loc>${imgUrl(p.image)}</image:loc>\n      <image:title>${escapeXml(p.name)}</image:title>\n      <image:caption>${escapeXml(p.short ?? p.name)}</image:caption>\n    </image:image>`
                : null,
              `  </url>`,
            ].filter(Boolean).join("\n");
          }),
          `</urlset>`,
        ].join("\n");
        return xml;
      }),
    },
  },
});
