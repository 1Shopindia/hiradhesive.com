import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Calculator, Droplets, LayoutGrid, Grid3x3 } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { CTASection } from "@/components/CTASection";
import {
  SITE_URL,
  SITE_NAME,
  breadcrumbSchema,
  buildMeta,
  canonicalLinks,
  faqSchema,
  jsonLdScript,
} from "@/lib/seo";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdhesiveCalculator } from "@/features/calculator/components/AdhesiveCalculator";
import { GroutCalculator } from "@/features/calculator/components/GroutCalculator";
import { WaterproofingCalculator } from "@/features/calculator/components/WaterproofingCalculator";

const FAQS = [
  {
    q: "How do I calculate tile adhesive consumption?",
    a: "Multiply the adhesive density (kg per sq.m per mm) by the application bed thickness in mm, then by the total area in sq.m. The HIR Tile Adhesive Calculator derives the bed thickness automatically from tile type, tile size, surface and exposure, and adds 2% wastage.",
  },
  {
    q: "What is the formula for epoxy grout quantity?",
    a: "Grout consumption in kg per sq.m = ((Tile Length + Tile Width) × Tile Thickness × Joint Width) ÷ ((Tile Length + Joint Width) × (Tile Width + Joint Width)) × Specific Gravity, with all tile dimensions in millimetres.",
  },
  {
    q: "Which trowel size should I use for 600x600 mm tiles?",
    a: "A 8 × 8 mm notched trowel suits tiles from 300 × 300 mm up to 600 × 600 mm. Tiles above 600 mm need a 10 × 10 mm trowel and tiles above 800 mm need a 12 × 12 mm trowel with back-buttering.",
  },
  {
    q: "How much waterproofing coating do I need per square metre?",
    a: "Divide the number of coats by the product coverage in sq.m per kg per coat. For HIR RoofGuard at 0.9 sq.m/kg/coat with two coats, consumption is about 2.2 kg per sq.m before wastage.",
  },
  {
    q: "Is wastage included in the HIR Material Calculator results?",
    a: "Yes. Adhesive and grout estimates include 2% wastage and waterproofing estimates include 5% wastage, shown separately on the result card and in the downloadable PDF.",
  },
];

const TABS = [
  { id: "adhesive", label: "Tile Adhesive", short: "Adhesive", icon: LayoutGrid },
  { id: "grout", label: "Epoxy / Grout", short: "Grout", icon: Grid3x3 },
  { id: "waterproofing", label: "Waterproofing", short: "Waterproof", icon: Droplets },
] as const;

type TabId = (typeof TABS)[number]["id"];

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: buildMeta({
      title: "Tile Adhesive & Epoxy Grout Calculator | HIR",
      description:
        "Calculate tile adhesive, epoxy grout and waterproofing material requirements instantly using the HIR Material Calculator. Free, accurate, with PDF export.",
      path: "/calculator",
      keywords: [
        "Tile Adhesive Calculator",
        "Grout Calculator",
        "Epoxy Calculator",
        "Construction Material Calculator",
        "Tile Adhesive Consumption Calculator",
        "Grout Quantity Calculator",
        "Waterproofing Calculator",
        "Tile Material Estimator",
      ],
    }),
    links: canonicalLinks("/calculator"),
    scripts: [
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/calculator#app`,
        name: "HIR Material Calculator",
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Construction Material Estimator",
        operatingSystem: "Web browser",
        url: `${SITE_URL}/calculator`,
        description:
          "Free online tile adhesive, epoxy grout and waterproofing consumption calculator with trowel size recommendation, bag quantity and branded PDF export.",
        featureList: [
          "Tile adhesive consumption calculator",
          "Epoxy grout quantity calculator",
          "Waterproofing coverage calculator",
          "Trowel size recommendation",
          "Bag and pack quantity conversion",
          "Branded PDF estimate export",
        ],
        inLanguage: "en",
        isAccessibleForFree: true,
        publisher: { "@id": `${SITE_URL}/#organization` },
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      }),
      jsonLdScript(faqSchema(FAQS)),
      jsonLdScript(
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Material Calculator", path: "/calculator" },
        ]),
      ),
    ],
  }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const [tab, setTab] = useState<TabId>("adhesive");

  return (
    <div className="overflow-hidden">
      <section className="relative gradient-ink text-white py-14 md:py-20 px-4">
        <div aria-hidden="true" className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-brand/25 blur-3xl" />
        <div className="relative max-w-7xl mx-auto text-center">
          <Reveal>
            <p className="inline-flex items-center gap-2 text-brand font-semibold uppercase tracking-[0.2em] text-xs mb-4">
              <Calculator className="h-4 w-4" aria-hidden="true" /> Engineering Tools
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              HIR <span className="text-gradient-brand">Material Calculator</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-white/70 mt-5 max-w-2xl mx-auto text-base md:text-lg">
              Estimate tile adhesive, epoxy grout and waterproofing quantities in seconds — with grade
              recommendations, trowel guidance, bag counts and a branded PDF you can share with your site team.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-0 -mt-8 relative z-10 pb-16">
        <div
          role="tablist"
          aria-label="Material calculators"
          className="flex gap-1.5 p-1.5 bg-white border border-border rounded-2xl shadow-elegant mx-3 sm:mx-4 lg:mx-0 max-w-2xl lg:mx-auto"
        >
          {TABS.map(t => {
            const Icon = t.icon;
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                role="tab"
                type="button"
                id={`tab-${t.id}`}
                aria-selected={active}
                aria-controls={`panel-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`relative flex-1 min-h-12 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  active ? "text-white" : "text-brand-blue/70 hover:text-brand"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="calc-tab"
                    transition={{ type: "spring", stiffness: 340, damping: 30 }}
                    className="absolute inset-0 gradient-brand rounded-xl shadow-glow-brand"
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.short}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 px-3 sm:px-4 lg:px-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              id={`panel-${tab}`}
              role="tabpanel"
              aria-labelledby={`tab-${tab}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <ErrorBoundary name={`calculator:${tab}`} key={tab}>
                {tab === "adhesive" && <AdhesiveCalculator />}
                {tab === "grout" && <GroutCalculator />}
                {tab === "waterproofing" && <WaterproofingCalculator />}
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="bg-secondary/40 py-16 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-brand-blue">
              Calculator <span className="text-gradient-brand">FAQs</span>
            </h2>
          </Reveal>
          <div className="mt-8 space-y-3">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={0.04 * i}>
                <details className="group bg-white border border-border rounded-2xl p-5">
                  <summary className="cursor-pointer font-semibold text-brand-blue list-none flex items-start justify-between gap-4">
                    <span>{f.q}</span>
                    <span aria-hidden="true" className="text-brand shrink-0 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
