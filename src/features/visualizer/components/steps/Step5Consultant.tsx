import { useMemo } from "react";
import { EPOXIES } from "../../data/epoxies";
import { getTilePreset } from "../../data/tiles";
import { TILE_SIZES } from "../../data/tileSizes";
import { bestRecommendation, scoreCurrent } from "../../lib/aiConsultant";
import { useRoomAssets } from "../../hooks/useRoomAssets";
import { useVisualizerStore } from "../../store";
import { WizardShell } from "../WizardShell";

const CARDS = [
  { key: "designScore", label: "Design Score" },
  { key: "luxury", label: "Luxury Match" },
  { key: "modern", label: "Modern Match" },
  { key: "hotel", label: "Hotel Style" },
  { key: "maintenance", label: "Easy Maintenance" },
  { key: "family", label: "Family Friendly" },
] as const;

export function Step5Consultant() {
  const roomId = useVisualizerStore((s) => s.roomId);
  const customRoomKey = useVisualizerStore((s) => s.customRoomKey);
  const { assets } = useRoomAssets({ roomId, customRoomKey });
  const tilePresetId = useVisualizerStore((s) => s.tilePresetId);
  const tileSize = useVisualizerStore((s) => s.tileSize);
  const epoxyId = useVisualizerStore((s) => s.epoxyId);
  const groutMm = useVisualizerStore((s) => s.groutMm);
  const apply = useVisualizerStore((s) => s.applyRecommendation);

  const scores = useMemo(() => {
    if (!assets) return null;
    return scoreCurrent(assets.category, tilePresetId, tileSize, epoxyId, groutMm);
  }, [assets, tilePresetId, tileSize, epoxyId, groutMm]);

  const rec = useMemo(() => (assets ? bestRecommendation(assets.category) : null), [assets]);

  if (!assets) return null;

  return (
    <WizardShell
      title="AI Interior Consultant"
      subtitle="Deterministic scoring for your current selection, plus the best combination for this room."
    >
      {tilePresetId ? null : (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Uploaded tiles use the same scoring, but library tiles have detailed traits — go back to Step&nbsp;3 for richer analysis.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {CARDS.map((c) => {
          const value = scores ? (scores[c.key as keyof typeof scores] as number) : 0;
          const reason = scores ? scores.reasons[c.key] : null;
          return (
            <div key={c.key} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-baseline justify-between">
                <div className="text-sm font-medium text-neutral-700">{c.label}</div>
                <div className="text-xl font-semibold tabular-nums text-neutral-900">
                  {value}
                  <span className="text-sm text-neutral-500">/100</span>
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-neutral-900 transition-all"
                  style={{ width: `${value}%` }}
                />
              </div>
              {reason && <p className="mt-2 text-xs text-neutral-500">{reason}</p>}
            </div>
          );
        })}
      </div>

      {rec && (
        <div className="mt-6 rounded-xl border border-neutral-900 bg-neutral-900 p-5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-neutral-400">
                Best Match for {assets.category}
              </div>
              <div className="mt-1 text-lg font-semibold">
                {getTilePreset(rec.tilePresetId)?.name} · {TILE_SIZES.find((s) => s.id === rec.tileSize)?.label}
              </div>
              <div className="text-sm text-neutral-300">
                {EPOXIES.find((e) => e.id === rec.epoxyId)?.name} grout · {rec.groutMm} mm
              </div>
            </div>
            <button
              onClick={() =>
                apply({
                  tilePresetId: rec.tilePresetId,
                  tileSize: rec.tileSize,
                  epoxyId: rec.epoxyId,
                  groutMm: rec.groutMm,
                })
              }
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
            >
              Apply Best Recommendation
            </button>
          </div>
          <p className="mt-3 text-sm text-neutral-300">{rec.reason}</p>
        </div>
      )}
    </WizardShell>
  );
}
