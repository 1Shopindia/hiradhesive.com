import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITEMAP_BASE as BASE, xmlResponse } from "@/lib/sitemap.server";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const maps = ["sitemap-pages.xml", "sitemap-products.xml", "sitemap-blogs.xml", "sitemap-images.xml"];
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...maps.map(m => `  <sitemap><loc>${BASE}/${m}</loc></sitemap>`),
          `</sitemapindex>`,
        ].join("\n");
        return xmlResponse(xml);
      },
    },
  },
});
