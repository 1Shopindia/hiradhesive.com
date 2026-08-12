import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import {
  SITEMAP_BASE as BASE, escapeXml, fetchSitemapBlogs, imgUrl, lastmod, safeSitemap,
} from "@/lib/sitemap.server";

export const Route = createFileRoute("/sitemap-blogs.xml")({
  server: {
    handlers: {
      GET: safeSitemap(async () => {
        const blogs = await fetchSitemapBlogs();
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
          ...blogs.map((b) => {
            const lm = lastmod(b.updated_at) ?? lastmod(b.published_at);
            return [
              `  <url>`,
              `    <loc>${BASE}/blogs/${b.slug}</loc>`,
              lm ? `    <lastmod>${lm}</lastmod>` : null,
              `    <changefreq>monthly</changefreq>`,
              `    <priority>0.7</priority>`,
              b.image
                ? `    <image:image>\n      <image:loc>${imgUrl(b.image)}</image:loc>\n      <image:title>${escapeXml(b.title)}</image:title>\n    </image:image>`
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
