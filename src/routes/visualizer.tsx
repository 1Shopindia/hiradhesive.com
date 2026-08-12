import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useVisualizerStore } from "@/features/visualizer/store";
import { buildMeta, canonicalLinks } from "@/lib/seo";

const Step1Room = lazy(() =>
  import("@/features/visualizer/components/steps/Step1Room").then((m) => ({ default: m.Step1Room })),
);
const Step2Size = lazy(() =>
  import("@/features/visualizer/components/steps/Step2Size").then((m) => ({ default: m.Step2Size })),
);
const Step3Tile = lazy(() =>
  import("@/features/visualizer/components/steps/Step3Tile").then((m) => ({ default: m.Step3Tile })),
);
const Step4Epoxy = lazy(() =>
  import("@/features/visualizer/components/steps/Step4Epoxy").then((m) => ({ default: m.Step4Epoxy })),
);
const Step5Consultant = lazy(() =>
  import("@/features/visualizer/components/steps/Step5Consultant").then((m) => ({
    default: m.Step5Consultant,
  })),
);
const Step6Preview = lazy(() =>
  import("@/features/visualizer/components/steps/Step6Preview").then((m) => ({ default: m.Step6Preview })),
);

export const Route = createFileRoute("/visualizer")({
  head: () => ({
    meta: buildMeta({
      title: "Free Tile & Epoxy Grout Visualizer | HIR Industries",
      description: "Preview any tile pattern and epoxy grout colour on realistic room photos before you buy. Compare, save, share and request a quote — 100% free.",
      path: "/visualizer",
      keywords: ["tile visualizer", "epoxy grout visualizer", "floor tile preview tool", "HIR visualizer"],
    }),
    links: canonicalLinks("/visualizer"),
  }),
  component: VisualizerPage,
});

function VisualizerPage() {
  const step = useVisualizerStore((s) => s.step);
  return (
    <div className="min-h-screen bg-neutral-50">
      <Suspense fallback={<div className="p-10 text-center text-neutral-500">Loading…</div>}>
        {step === 1 && <Step1Room />}
        {step === 2 && <Step2Size />}
        {step === 3 && <Step3Tile />}
        {step === 4 && <Step4Epoxy />}
        {step === 5 && <Step5Consultant />}
        {step === 6 && <Step6Preview />}
      </Suspense>
    </div>
  );
}
