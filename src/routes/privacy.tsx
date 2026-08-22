import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { getLegalPage } from "@/lib/cms.functions";
import { buildMeta, canonicalLinks, breadcrumbSchema, jsonLdScript } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: buildMeta({
      title: "Privacy Policy | HIR Industries",
      description: "Privacy policy explaining how HIR Industries collects, uses, and protects your personal data when you use our website.",
      path: "/privacy",
      keywords: ["privacy policy", "data protection", "HIR Industries privacy"],
    }),
    links: canonicalLinks("/privacy"),
    scripts: [
      jsonLdScript(breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Privacy Policy", path: "/privacy" },
      ])),
    ],
  }),
  loader: async () => {
    try {
      const page = await getLegalPage({ data: { id: 'privacy' } });
      return {
        title: page.title,
        lastUpdated: new Date(page.last_updated).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        }),
        sections: page.content.sections,
      };
    } catch (error) {
      console.error('[Privacy] Failed to load:', error);
      // Fallback to default content if database fails
      return {
        title: "Privacy Policy",
        lastUpdated: "January 2026",
        sections: [],
      };
    }
  },
  component: PrivacyPage,
});

function PrivacyPage() {
  const data = Route.useLoaderData();
  return <LegalPage {...data} />;
}
