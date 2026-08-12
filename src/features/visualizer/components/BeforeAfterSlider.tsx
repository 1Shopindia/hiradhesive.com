import { useEffect, useRef, useState } from "react";
import { PreviewCanvas } from "./PreviewCanvas";
import type { RoomAssets } from "../types";

type Props = {
  assets: RoomAssets;
  state: {
    tilePresetId: string | null;
    customTile: { dataUrl: string; name: string } | null;
    tileSize: import("../types").TileSizeId;
    customTileSizeMm: [number, number];
    epoxyId: string;
    groutMm: number;
    groutFinish: "Matte" | "Semi Gloss" | "Gloss";
  };
};

export function BeforeAfterSlider({ assets, state }: Props) {
  const [x, setX] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!(e.buttons & 1)) return;
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const px = ((e.clientX - r.left) / r.width) * 100;
      setX(Math.max(0, Math.min(100, px)));
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="relative select-none"
      style={{ aspectRatio: `${assets.polygon.size[0]} / ${assets.polygon.size[1]}` }}
    >
      <div className="absolute inset-0">
        <PreviewCanvas
          assets={assets}
          tilePresetId={state.tilePresetId}
          customTileDataUrl={state.customTile?.dataUrl ?? null}
          tileSize={state.tileSize}
          customTileSizeMm={state.customTileSizeMm}
          epoxyId={state.epoxyId}
          groutMm={state.groutMm}
          groutFinish={state.groutFinish}
        />
      </div>
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${x}%` }}
      >
        <div className="h-full" style={{ width: `${(100 / x) * 100}%` }}>
          <PreviewCanvas
            assets={assets}
            tilePresetId={null}
            customTileDataUrl={null}
            tileSize={state.tileSize}
            customTileSizeMm={state.customTileSizeMm}
            epoxyId={state.epoxyId}
            groutMm={state.groutMm}
            groutFinish={state.groutFinish}
            showTiles={false}
          />
        </div>
      </div>
      <div
        className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
        style={{ left: `${x}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg">
          ⇔
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={x}
        onChange={(e) => setX(Number(e.target.value))}
        className="absolute inset-x-0 bottom-3 mx-auto w-2/3 opacity-0"
        aria-label="Compare"
      />
    </div>
  );
}
