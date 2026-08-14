import { createFileRoute } from "@tanstack/react-router";

/**
 * Backward compatibility route for old /storage/product-pdfs/... URLs
 * 
 * Existing database records store URLs like:
 *   /storage/product-pdfs/hir-main-catalogue-1-1786714317210.pdf
 * 
 * This route redirects them to the new API endpoint:
 *   /api/public/pdf/hir-main-catalogue-1-1786714317210.pdf
 * 
 * This allows existing database values to work without database migration.
 * New uploads use /api/public/pdf/... directly.
 */
export const Route = createFileRoute("/storage/product-pdfs/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = (params as { _splat?: string })._splat ?? "";
        const filename = decodeURIComponent(raw);

        // Redirect to the new API endpoint
        const newUrl = `/api/public/pdf/${filename}`;
        
        console.log(`[storage/product-pdfs] Redirecting legacy URL: /storage/product-pdfs/${filename} → ${newUrl}`);
        
        return new Response(null, {
          status: 301, // Permanent redirect
          headers: {
            Location: newUrl,
            "Cache-Control": "public, max-age=31536000", // Cache redirect for 1 year
          },
        });
      },
    },
  },
});
