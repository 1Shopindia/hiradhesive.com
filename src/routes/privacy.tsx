import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { privacyContent } from "@/config/legalContent";
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
  component: PrivacyPage,
});

function PrivacyPage() {
  return <LegalPage {...privacyContent} />;
}
