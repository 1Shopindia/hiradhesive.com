import { createFileRoute } from "@tanstack/react-router";

/**
 * Public download endpoint for catalogue / technical datasheet PDFs.
 * The storage is private filesystem; this route streams a validated file
 * so anyone can download without exposing storage credentials.
 */
export const Route = createFileRoute("/api/public/pdf/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = (params as { _splat?: string })._splat ?? "";
        const path = decodeURIComponent(raw);

        // Only allow simple, safe object paths ending in .pdf
        if (!/^[a-zA-Z0-9/_-]+\.pdf$/.test(path) || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        try {
          const { getFile } = await import("@/lib/storage/index.server");
          const data = await getFile("product-pdfs", path);

          const filename = path.split("/").pop() || "document.pdf";
          return new Response(data, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `inline; filename="${filename}"`,
              "Cache-Control": "public, max-age=3600",
            },
          });
        } catch (e: any) {
          console.error("[api/public/pdf]", e);
          if (e?.statusCode === 404) {
            return new Response("Not found", { status: 404 });
          }
          return new Response("Unable to load document", { status: 500 });
        }
      },
    },
  },
});
