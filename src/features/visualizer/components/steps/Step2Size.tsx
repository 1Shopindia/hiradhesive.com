import { TILE_SIZES } from "../../data/tileSizes";
import { useVisualizerStore } from "../../store";
import { WizardShell } from "../WizardShell";

export function Step2Size() {
  const tileSize = useVisualizerStore((s) => s.tileSize);
  const setTileSize = useVisualizerStore((s) => s.setTileSize);
  const customMm = useVisualizerStore((s) => s.customTileSizeMm);
  const setCustomMm = useVisualizerStore((s) => s.setCustomTileSizeMm);

  return (
    <WizardShell
      title="Choose Tile Size"
      subtitle="Larger tiles feel modern and open; smaller tiles read as detailed and traditional."
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {TILE_SIZES.map((s) => {
          const selected = tileSize === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setTileSize(s.id)}
              className={[
                "rounded-xl border p-5 text-left transition",
                selected
                  ? "border-neutral-900 ring-2 ring-neutral-900"
                  : "border-neutral-200 hover:border-neutral-400",
              ].join(" ")}
            >
              <div className="text-lg font-semibold text-neutral-900">{s.label}</div>
              <div className="mt-1 text-xs text-neutral-500">
                {s.id === "custom"
                  ? "Enter your own dimensions"
                  : `${s.widthMm} × ${s.heightMm} mm`}
              </div>
              <div
                className="mt-3 border border-neutral-300"
                style={{
                  width: `${Math.min(120, s.widthMm / 10)}px`,
                  height: `${Math.min(120, s.heightMm / 10)}px`,
                  background:
                    "repeating-linear-gradient(45deg, #f4f4f4, #f4f4f4 6px, #eaeaea 6px, #eaeaea 12px)",
                }}
              />
            </button>
          );
        })}
      </div>

      {tileSize === "custom" && (
        <div className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 p-4">
          <label className="flex flex-col text-sm">
            <span className="mb-1 text-neutral-500">Width (mm)</span>
            <input
              type="number"
              min={50}
              max={3000}
              value={customMm[0]}
              onChange={(e) => setCustomMm([Number(e.target.value) || 0, customMm[1]])}
              className="w-32 rounded-md border border-neutral-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col text-sm">
            <span className="mb-1 text-neutral-500">Height (mm)</span>
            <input
              type="number"
              min={50}
              max={3000}
              value={customMm[1]}
              onChange={(e) => setCustomMm([customMm[0], Number(e.target.value) || 0])}
              className="w-32 rounded-md border border-neutral-300 px-3 py-2"
            />
          </label>
        </div>
      )}
    </WizardShell>
  );
}
