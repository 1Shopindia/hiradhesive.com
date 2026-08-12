import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import {
  SITEMAP_BASE as BASE, escapeXml, fetchSitemapBlogs, fetchSitemapProducts, imgUrl, safeSitemap,
} from "@/lib/sitemap.server";

export const Route = createFileRoute("/sitemap-images.xml")({
  server: {
    handlers: {
      GET: safeSitemap(async () => {
        const [products, blogs] = await Promise.all([fetchSitemapProducts(), fetchSitemapBlogs()]);
        const entries: string[] = [];
        for (const p of products) {
          if (!p.image) continue;
          entries.push(`  <url>
    <loc>${BASE}/products/${p.slug}</loc>
    <image:image>
      <image:loc>${imgUrl(p.image)}</image:loc>
      <image:title>${escapeXml(p.name)}</image:title>
      <image:caption>${escapeXml(p.short ?? p.name)}</image:caption>
    </image:image>
  </url>`);
        }
        for (const b of blogs) {
          if (!b.image) continue;
          entries.push(`  <url>
    <loc>${BASE}/blogs/${b.slug}</loc>
    <image:image>
      <image:loc>${imgUrl(b.image)}</image:loc>
      <image:title>${escapeXml(b.title)}</image:title>
    </image:image>
  </url>`);
        }
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
          ...entries,
          `</urlset>`,
        ].join("\n");
        return xml;
      }),
    },
  },
});
