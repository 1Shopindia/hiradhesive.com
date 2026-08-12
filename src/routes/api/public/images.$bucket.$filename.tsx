import { createFileRoute } from "@tanstack/react-router";

/**
 * Public endpoint for serving images from storage.
 * Serves images from product-images and blog-images buckets.
 */
export const Route = createFileRoute("/api/public/images/$bucket/$filename")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { bucket, filename } = params;

        // Validate bucket
        if (!["product-images", "blog-images"].includes(bucket)) {
          return new Response("Invalid bucket", { status: 400 });
        }

        // Validate filename format
        if (
          !/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|svg|avif)$/i.test(filename) ||
          filename.includes("..")
        ) {
          return new Response("Invalid filename", { status: 400 });
        }

        try {
          const { getFile } = await import("@/lib/storage/index.server");
          const data = await getFile(bucket, filename);

          // Determine content type from extension
          const ext = filename.split(".").pop()?.toLowerCase();
          const contentTypeMap: Record<string, string> = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp",
            svg: "image/svg+xml",
            avif: "image/avif",
          };
          const contentType = contentTypeMap[ext || ""] || "application/octet-stream";

          return new Response(data, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=3600",
            },
          });
        } catch (e: any) {
          console.error("[api/public/images]", e);
          if (e?.statusCode === 404) {
            return new Response("Not found", { status: 404 });
          }
          return new Response("Unable to load image", { status: 500 });
        }
      },
    },
  },
});
