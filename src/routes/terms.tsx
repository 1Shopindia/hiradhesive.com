import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { getLegalPage } from "@/lib/cms.functions";
import { buildMeta, canonicalLinks, breadcrumbSchema, jsonLdScript } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: buildMeta({
      title: "Terms & Conditions | HIR Industries",
      description: "Terms and conditions for using the HIR Industries website and purchasing our tile adhesives, grouts, and waterproofing products.",
      path: "/terms",
      keywords: ["terms and conditions", "HIR Industries terms", "purchase terms"],
    }),
    links: canonicalLinks("/terms"),
    scripts: [
      jsonLdScript(breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Terms & Conditions", path: "/terms" },
      ])),
    ],
  }),
  loader: async () => {
    try {
      const page = await getLegalPage({ data: { id: 'terms' } });
      return {
        title: page.title,
        lastUpdated: new Date(page.last_updated).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        }),
        sections: page.content.sections,
      };
    } catch (error) {
      console.error('[Terms] Failed to load:', error);
      // Fallback to default content if database fails
      return {
        title: "Terms & Conditions",
        lastUpdated: "January 2026",
        sections: [],
      };
    }
  },
  component: TermsPage,
});

function TermsPage() {
  const data = Route.useLoaderData();
  return <LegalPage {...data} />;
}
