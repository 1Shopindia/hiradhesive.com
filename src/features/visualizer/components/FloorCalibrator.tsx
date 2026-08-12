import { useEffect, useMemo, useRef, useState } from "react";
import {
  clearCalibration,
  getCalibration,
  saveCalibration,
} from "../lib/calibrationStore";
import { homographyUnitSquareToQuad } from "../lib/homography";
import type { Point, RoomAssets } from "../types";

type Props = {
  assets: RoomAssets;
  /** Real tile edge length in meters, for the debug grid preview. */
  tileMeters: number;
  onClose: () => void;
  onSaved: () => void; // caller bumps calibrationVersion
};

/**
 * Manual floor calibrator.
 *
 * Shows the room photo scaled to fit and 4 draggable handles labelled
 * front-left / front-right / back-right / back-left (matching the
 * polygon.json point order: [bl, br, tr, tl]).
 *
 * A toggleable "Tile grid" overlay renders a projective grid from the
 * unit square to the current 4 handles so the user can see, in real
 * time, whether tile lines will converge to the room's true vanishing
 * point.
 *
 * All edits stay local until "Save Calibration" — Reset clears the
 * override so the built-in polygon.json is used again.
 */
export function FloorCalibrator({ assets, tileMeters, onClose, onSaved }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showGrid, setShowGrid] = useState(true);

  const initial = useMemo(
    () => (assets.polygon.points.slice(0, 4) as [Point, Point, Point, Point]),
    [assets],
  );
  const [pts, setPts] = useState<[Point, Point, Point, Point]>(initial);
  const [widthMeters, setWidthMeters] = useState<string>(
    String(assets.polygon.widthMeters ?? ""),
  );
  const [depthMeters, setDepthMeters] = useState<string>(
    String(assets.polygon.depthMeters ?? ""),
  );
  const [dragging, setDragging] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [w, h] = assets.polygon.size;

  useEffect(() => {
    setPts(initial);
    const cal = getCalibration(assets.id);
    if (cal) {
      setPts(cal.points);
      setWidthMeters(String(cal.widthMeters ?? assets.polygon.widthMeters ?? ""));
      setDepthMeters(String(cal.depthMeters ?? assets.polygon.depthMeters ?? ""));
    }
  }, [assets, initial]);

  // Draw image + polygon + optional projective grid.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scale = 900 / w;
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(assets.image, 0, 0, canvas.width, canvas.height);

    // Polygon outline.
    ctx.strokeStyle = "rgba(52,211,153,0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = p[0] * scale;
      const y = p[1] * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "rgba(16,185,129,0.15)";
    ctx.fill();

    // Debug grid via true projective homography from unit square to quad.
    if (showGrid) {
      const [bl, br, tr, tl] = pts;
      const project = homographyUnitSquareToQuad(tl, tr, br, bl);

      // Estimate grid density from real-world width/depth if provided.
      const wM = parseFloat(widthMeters) || 4;
      const dM = parseFloat(depthMeters) || 4;
      const cols = Math.max(2, Math.min(40, Math.round(wM / Math.max(0.05, tileMeters))));
      const rows = Math.max(2, Math.min(40, Math.round(dM / Math.max(0.05, tileMeters))));

      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 1;

      // Vertical grid lines (constant u).
      for (let i = 0; i <= cols; i++) {
        const u = i / cols;
        ctx.beginPath();
        for (let j = 0; j <= 24; j++) {
          const v = j / 24;
          const [x, y] = project(u, v);
          const sx = x * scale;
          const sy = y * scale;
          if (j === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }
      // Horizontal grid lines (constant v).
      for (let j = 0; j <= rows; j++) {
        const v = j / rows;
        ctx.beginPath();
        for (let i = 0; i <= 24; i++) {
          const u = i / 24;
          const [x, y] = project(u, v);
          const sx = x * scale;
          const sy = y * scale;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }
    }

    // Handles + labels (drawn last, above grid).
    const labels = ["Front-Left", "Front-Right", "Back-Right", "Back-Left"];
    pts.forEach((p, i) => {
      const x = p[0] * scale;
      const y = p[1] * scale;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(15,23,42,0.9)";
      ctx.font = "bold 12px system-ui, sans-serif";
      ctx.fillText(labels[i], x + 14, y + 4);
    });
  }, [assets, pts, showGrid, widthMeters, depthMeters, tileMeters, w, h]);

  function onPointerDown(e: React.PointerEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    const scale = w / r.width;
    const x = (e.clientX - r.left) * scale;
    const y = (e.clientY - r.top) * scale;
    let best = -1;
    let dmin = Infinity;
    pts.forEach((p, i) => {
      const d = Math.hypot(p[0] - x, p[1] - y);
      if (d < dmin) {
        dmin = d;
        best = i;
      }
    });
    if (dmin < 80) setDragging(best);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (dragging === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    const scale = w / r.width;
    const x = Math.max(0, Math.min(w, (e.clientX - r.left) * scale));
    const y = Math.max(0, Math.min(h, (e.clientY - r.top) * scale));
    setPts((prev) => {
      const next = prev.slice() as [Point, Point, Point, Point];
      next[dragging] = [x, y];
      return next;
    });
  }
  function onPointerUp() {
    setDragging(null);
  }

  const save = () => {
    saveCalibration(assets.id, {
      points: pts,
      widthMeters: widthMeters ? parseFloat(widthMeters) : undefined,
      depthMeters: depthMeters ? parseFloat(depthMeters) : undefined,
      updatedAt: Date.now(),
    });
    setMessage("Calibration saved.");
    onSaved();
    setTimeout(() => setMessage(null), 1500);
  };

  const reset = () => {
    clearCalibration(assets.id);
    setPts(initial);
    setMessage("Calibration cleared — using default polygon.");
    onSaved();
    setTimeout(() => setMessage(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold">Calibrate Floor — {assets.name}</h4>
            <p className="text-xs text-neutral-500">
              Drag the 4 handles so they sit exactly where the floor meets the walls / skirting.
              The white grid shows how tiles will warp — verify lines converge to the room's true
              vanishing point.
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            className="w-full cursor-crosshair rounded-xl border border-neutral-200 bg-neutral-50 touch-none"
          />
          <aside className="space-y-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
              />
              <span>Show tile grid debug overlay</span>
            </label>
            <div>
              <label className="block text-xs text-neutral-600 mb-1">Real floor width (m)</label>
              <input
                type="number"
                step="0.1"
                min={0.5}
                value={widthMeters}
                onChange={(e) => setWidthMeters(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-600 mb-1">Real floor depth (m)</label>
              <input
                type="number"
                step="0.1"
                min={0.5}
                value={depthMeters}
                onChange={(e) => setDepthMeters(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-1.5"
              />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={save}
                className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
              >
                Save Calibration
              </button>
              <button
                onClick={reset}
                className="rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-200"
              >
                Reset to Default
              </button>
              {message && <span className="text-xs text-emerald-600">{message}</span>}
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Calibration is stored in your browser per room. To share across devices, export via
              devtools (<code>localStorage['hir-visualizer:floor-calibration:v1']</code>).
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
