import { useState } from "react";
import { TILE_PRESETS } from "../../data/tiles";
import { useVisualizerStore } from "../../store";
import { CustomTileUploader } from "../CustomTileUploader";
import { WizardShell } from "../WizardShell";

export function Step3Tile() {
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const tilePresetId = useVisualizerStore((s) => s.tilePresetId);
  const customTile = useVisualizerStore((s) => s.customTile);
  const setTilePreset = useVisualizerStore((s) => s.setTilePreset);
  const setCustomTile = useVisualizerStore((s) => s.setCustomTile);

  return (
    <WizardShell
      title="Choose Tile"
      subtitle="Pick from our library or upload your own tile photo."
      canProceed={!!(tilePresetId || customTile)}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {TILE_PRESETS.map((t) => {
          const selected = tilePresetId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTilePreset(t.id)}
              className={[
                "overflow-hidden rounded-xl border text-left transition",
                selected
                  ? "border-neutral-900 ring-2 ring-neutral-900"
                  : "border-neutral-200 hover:border-neutral-400",
              ].join(" ")}
            >
              <div
                className="aspect-square"
                style={{ background: `url(${t.textureUrl}) center/cover`, backgroundColor: t.swatch }}
              />
              <div className="p-2.5 text-sm font-medium text-neutral-900">{t.name}</div>
            </button>
          );
        })}

        <button
          onClick={() => setUploaderOpen(true)}
          className={[
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed text-neutral-600 transition hover:border-neutral-500 hover:text-neutral-900",
            customTile ? "border-neutral-900 text-neutral-900" : "border-neutral-300",
          ].join(" ")}
        >
          {customTile ? (
            <>
              <div
                className="mt-2 h-16 w-16 rounded"
                style={{ background: `url(${customTile.dataUrl}) center/cover` }}
              />
              <div className="mt-2 px-3 py-2 text-sm">
                Your Tile <span className="text-neutral-500">(tap to replace)</span>
              </div>
            </>
          ) : (
            <div className="px-3 py-6 text-center text-sm">
              + Upload Your Own Tile
              <div className="text-xs text-neutral-500">JPG · PNG · WEBP</div>
            </div>
          )}
        </button>
      </div>

      {uploaderOpen && (
        <CustomTileUploader
          onClose={() => setUploaderOpen(false)}
          onDone={(dataUrl, name) => {
            setCustomTile({ dataUrl, name });
            setUploaderOpen(false);
          }}
        />
      )}
    </WizardShell>
  );
}
