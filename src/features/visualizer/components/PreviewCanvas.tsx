import { useEffect, useMemo, useRef, useState } from "react";
import { EPOXIES } from "../data/epoxies";
import { getTilePreset } from "../data/tiles";
import { TILE_SIZES } from "../data/tileSizes";
import { homographyUnitSquareToQuad } from "../lib/homography";
import { composite, polygonToMaskCanvas } from "../lib/maskCompositor";
import { renderTiledFloor } from "../lib/perspectiveWarp";
import { loadImage } from "../lib/seamlessTexture";
import type { RoomAssets, TileSizeId } from "../types";

type Props = {
  assets: RoomAssets;
  tilePresetId: string | null;
  customTileDataUrl: string | null;
  tileSize: TileSizeId;
  customTileSizeMm: [number, number];
  epoxyId: string;
  groutMm: number;
  groutFinish: "Matte" | "Semi Gloss" | "Gloss";
  showTiles?: boolean;
  /** When true, overlay the projective tile grid on top of the render. */
  showGridDebug?: boolean;
};


export function PreviewCanvas(props: Props) {
  const [finalCanvas, setFinalCanvas] = useState<HTMLCanvasElement | null>(null);
  const [rendering, setRendering] = useState(false);
  const outRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  // Cache room mask (depends only on polygon)
  const mask = useMemo(() => polygonToMaskCanvas(props.assets.polygon), [props.assets]);

  useEffect(() => {
    if (props.showTiles === false) {
      // Just show the raw room image.
      const c = document.createElement("canvas");
      const [w, h] = props.assets.polygon.size;
      c.width = w;
      c.height = h;
      c.getContext("2d")!.drawImage(props.assets.image, 0, 0, w, h);
      setFinalCanvas(c);
      return;
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setRendering(true);
      try {
        const preset = props.tilePresetId ? getTilePreset(props.tilePresetId) : null;
        const textureSrc = props.customTileDataUrl ?? preset?.textureUrl;
        if (!textureSrc) {
          const c = document.createElement("canvas");
          const [w, h] = props.assets.polygon.size;
          c.width = w;
          c.height = h;
          c.getContext("2d")!.drawImage(props.assets.image, 0, 0, w, h);
          setFinalCanvas(c);
          return;
        }
        const texture = await loadImage(textureSrc);

        const sizeDef =
          props.tileSize === "custom"
            ? {
                widthMm: props.customTileSizeMm[0],
                heightMm: props.customTileSizeMm[1],
              }
            : TILE_SIZES.find((s) => s.id === props.tileSize)!;
        const epoxy = EPOXIES.find((e) => e.id === props.epoxyId)!;

        const [w, h] = props.assets.polygon.size;
        const tiledCanvas = document.createElement("canvas");
        tiledCanvas.width = w;
        tiledCanvas.height = h;
        const tctx = tiledCanvas.getContext("2d")!;
        renderTiledFloor(tctx, {
          roomSize: [w, h],
          polygon: props.assets.polygon,
          tileWidthMm: sizeDef.widthMm,
          tileHeightMm: sizeDef.heightMm,
          groutMm: props.groutMm,
          epoxyHex: epoxy.hex,
          groutFinish: props.groutFinish,
          texture,
        });

        const composed = composite(props.assets.image, tiledCanvas, mask);
        setFinalCanvas(composed);
      } finally {
        setRendering(false);
      }
    }, 100);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [
    props.assets,
    props.tilePresetId,
    props.customTileDataUrl,
    props.tileSize,
    props.customTileSizeMm,
    props.epoxyId,
    props.groutMm,
    props.groutFinish,
    props.showTiles,
    mask,
  ]);

  useEffect(() => {
    if (!finalCanvas || !outRef.current) return;
    const parent = outRef.current;
    parent.innerHTML = "";
    finalCanvas.style.width = "100%";
    finalCanvas.style.height = "auto";
    finalCanvas.style.display = "block";
    finalCanvas.style.borderRadius = "12px";
    parent.appendChild(finalCanvas);
  }, [finalCanvas]);

  return (
    <div className="relative">
      <div
        ref={outRef}
        aria-label="Room preview"
        className="w-full overflow-hidden rounded-xl bg-neutral-100 shadow-lg"
        style={{ aspectRatio: `${props.assets.polygon.size[0]} / ${props.assets.polygon.size[1]}` }}
      />
      {props.showGridDebug && <DebugGridOverlay assets={props.assets} tileMm={
        props.tileSize === "custom"
          ? props.customTileSizeMm[0]
          : (TILE_SIZES.find((s) => s.id === props.tileSize)?.widthMm ?? 600)
      } />}
      {rendering && (
        <div className="absolute top-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
          Rendering…
        </div>
      )}
    </div>
  );
}

function DebugGridOverlay({ assets, tileMm }: { assets: RoomAssets; tileMm: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const [w, h] = assets.polygon.size;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);

    const [bl, br, tr, tl] = assets.polygon.points as [
      [number, number],
      [number, number],
      [number, number],
      [number, number],
    ];
    const project = homographyUnitSquareToQuad(tl, tr, br, bl);
    const tileM = tileMm / 1000;
    const wM = assets.polygon.widthMeters ?? 4;
    const dM = assets.polygon.depthMeters ?? 4;
    const cols = Math.max(2, Math.min(60, Math.round(wM / tileM)));
    const rows = Math.max(2, Math.min(60, Math.round(dM / tileM)));

    ctx.strokeStyle = "rgba(52,211,153,0.9)";
    ctx.lineWidth = 2;
    // Floor polygon.
    ctx.beginPath();
    assets.polygon.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    });
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= cols; i++) {
      const u = i / cols;
      ctx.beginPath();
      for (let j = 0; j <= 24; j++) {
        const v = j / 24;
        const [x, y] = project(u, v);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (let j = 0; j <= rows; j++) {
      const v = j / rows;
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) {
        const u = i / 24;
        const [x, y] = project(u, v);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, [assets, tileMm]);

  return (
    <canvas
      ref={ref}
      aria-label="Tile grid debug"
      className="pointer-events-none absolute inset-0 h-full w-full rounded-xl"
    />
  );
}

export function useLatestPreviewCanvas() {
  // Utility for export/share: find the latest rendered canvas inside PreviewCanvas.
  return () => document.querySelector<HTMLCanvasElement>("[aria-label='Room preview'] canvas");
}

