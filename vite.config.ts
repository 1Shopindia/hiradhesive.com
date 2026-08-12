// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    environments: {
      ssr: {
        build: {
          rollupOptions: {
            output: {
              // Keep @tanstack/start-{client,server}-core in the same SSR chunk.
              // Rolldown (Vite 8) otherwise splits createMiddleware and createCsrfMiddleware
              // into separate files with a circular dependency, causing:
              //   TypeError: createMiddleware is not a function
              // at module initialisation time on every production request.
              manualChunks(id: string) {
                if (id.includes("@tanstack/start-client-core") || id.includes("@tanstack/start-server-core")) {
                  return "tanstack-start-core";
                }
              },
            },
          },
        },
      },
    },
  },
});
