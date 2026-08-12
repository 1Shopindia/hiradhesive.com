import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITEMAP_BASE as BASE, xmlResponse } from "@/lib/sitemap.server";

export const Route = createFileRoute("/sitemap-pages.xml")({
  server: {
    handlers: {
      GET: () => {
        const paths = [
          { p: "/", cf: "weekly", pr: "1.0" },
          { p: "/products", cf: "weekly", pr: "0.9" },
          { p: "/blogs", cf: "weekly", pr: "0.8" },
          { p: "/about", cf: "monthly", pr: "0.6" },
          { p: "/contact", cf: "monthly", pr: "0.6" },
          { p: "/visualizer", cf: "monthly", pr: "0.5" },
          { p: "/calculator", cf: "monthly", pr: "0.8" },
        ];
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...paths.map(({ p, cf, pr }) => `  <url>
    <loc>${BASE}${p}</loc>
    <changefreq>${cf}</changefreq>
    <priority>${pr}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}${p}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}${p}"/>
  </url>`),
          `</urlset>`,
        ].join("\n");
        return xmlResponse(xml);
      },
    },
  },
});
