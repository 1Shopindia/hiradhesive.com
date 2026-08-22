import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { termsContent } from "@/config/legalContent";
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
  component: TermsPage,
});

function TermsPage() {
  return <LegalPage {...termsContent} />;
}
