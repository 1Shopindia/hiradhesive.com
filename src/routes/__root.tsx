import { Outlet, createRootRouteWithContext, HeadContent, Scripts, useRouter, useRouterState, Link } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportError } from "../lib/error-reporting";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { Toaster } from "../components/ui/sonner";
import {
  SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, TWITTER_HANDLE,
  organizationSchema, localBusinessSchema, websiteSchema, jsonLdScript,
} from "../lib/seo";

function NotFoundComponent() {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader />
      <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="max-w-md text-center">
          <h1 className="text-7xl font-bold">404</h1>
          <p className="mt-4 text-xl font-semibold">Page not found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            The page you're looking for doesn't exist. Explore our{" "}
            <Link to="/products" className="text-brand underline">products</Link>,{" "}
            <Link to="/blogs" className="text-brand underline">blog</Link> or{" "}
            <Link to="/contact" className="text-brand underline">contact us</Link>.
          </p>
          <Link to="/" className="inline-flex mt-6 items-center rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:-translate-y-0.5 shadow-elegant transition-all">Go home</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportError(error, { boundary: "root" }); }, [error]);
  return (
    <div role="alert" className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong.</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-md bg-brand px-4 py-2 text-white text-sm">Try again</button>
      </div>
    </div>
  );
}

const DEFAULT_TITLE = `${SITE_NAME} — Tile Adhesive, Epoxy Grout & Waterproofing Manufacturer`;
const DEFAULT_DESC = "HIR Industries manufactures premium tile adhesives, epoxy grouts, waterproofing systems and construction chemicals with German-American-Japanese technology. 50+ years, 500+ products, serving 18+ countries.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1a1e5c" },
      { name: "format-detection", content: "telephone=yes" },
      { httpEquiv: "content-language", content: "en" },
      { title: DEFAULT_TITLE },
      { name: "description", content: DEFAULT_DESC },
      { name: "keywords", content: "construction chemicals, tile adhesive, epoxy grout, waterproofing, wall putty, industrial flooring, C2 tile adhesive, tile adhesive manufacturer India, HIR Industries" },
      { name: "author", content: SITE_NAME },
      { name: "publisher", content: SITE_NAME },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "bingbot", content: "index, follow" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: TWITTER_HANDLE },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      { name: "geo.region", content: "IN-GJ" },
      { name: "geo.placename", content: "Himatnagar, Gujarat, India" },
      { name: "geo.position", content: "23.5988;72.9636" },
      { name: "ICBM", content: "23.5988, 72.9636" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "mask-icon", href: "/mask-icon.svg", color: "#F58220" },
      { rel: "manifest", href: "/site.webmanifest" },

      { rel: "preload", href: "/fonts/gc-fodax.ttf", as: "font", type: "font/ttf", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },

      { rel: "dns-prefetch", href: "https://www.youtube.com" },
      { rel: "dns-prefetch", href: "https://i.ytimg.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap" },
    ],
    scripts: [
      jsonLdScript(organizationSchema()),
      jsonLdScript(localBusinessSchema()),
      jsonLdScript(websiteSchema()),
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: s => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");
  return (
    <QueryClientProvider client={queryClient}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-white focus:shadow-elegant">
        Skip to main content
      </a>
      <div className="min-h-dvh flex flex-col bg-background">
        {!isAdmin && (
          <ErrorBoundary name="site-header" fallback={() => null}>
            <SiteHeader />
          </ErrorBoundary>
        )}
        <main id="main-content" className="flex-1" tabIndex={-1}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <ErrorBoundary name={`page:${pathname}`} key={pathname}>
              <Outlet />
            </ErrorBoundary>
          </motion.div>
        </main>
        {!isAdmin && (
          <ErrorBoundary name="site-footer" fallback={() => null}>
            <SiteFooter />
          </ErrorBoundary>
        )}
      </div>
      {!isAdmin && (
        <ErrorBoundary name="whatsapp" fallback={() => null}>
          <WhatsAppButton />
        </ErrorBoundary>
      )}
      <Toaster />

      {/* eslint-disable-next-line @suppress */}
      <noscript>
        <p style={{ padding: "1rem", textAlign: "center" }}>
          HIR Industries — tile adhesive, epoxy grout and waterproofing solutions. Please enable JavaScript for the full experience.
        </p>
      </noscript>
    </QueryClientProvider>
  );
}

// Ensure {SITE_URL} used elsewhere is referenced so tree-shaking keeps constant.
void SITE_URL;
