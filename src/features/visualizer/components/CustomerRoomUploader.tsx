import { useEffect, useRef, useState } from "react";
import { saveCustomRoom } from "../lib/customRoomStore";
import { loadImage } from "../lib/seamlessTexture";
import type { Point, RoomPolygon } from "../types";

type Props = {
  onClose: () => void;
  onSaved: (key: string) => void;
};

const MIN_W = 1200;
const MIN_H = 700;

/**
 * Upload your own room:
 * 1. Pick a photo, validate size & aspect ratio
 * 2. Adjust a 4-point floor polygon (manual editor is always shown so users
 *    stay in control — auto floor detection is a heuristic and unreliable).
 * 3. Save to localStorage-backed customRoomStore.
 *
 * EXTENSION: add auto-detect (Sobel on luminance + largest bright quad in
 * lower half) and fallback to the manual editor only when confidence < 0.6.
 */
export function CustomerRoomUploader({ onClose, onSaved }: Props) {
  const [file, setFile] = useState<{ url: string; w: number; h: number; name: string } | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const onPick = async (f: File) => {
    if (!f.type.match(/^image\/(jpeg|png|webp)$/)) {
      setErr("Please pick a JPG, PNG or WEBP image.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErr("Image is larger than 10 MB.");
      return;
    }
    const url = URL.createObjectURL(f);
    const img = await loadImage(url);
    if (img.width < MIN_W || img.height < MIN_H) {
      setErr(`Please upload a higher-resolution photo (min ${MIN_W}×${MIN_H}).`);
      return;
    }
    setErr(null);
    setFile({ url, w: img.width, h: img.height, name: f.name.replace(/\.[^.]+$/, "") });
    imgRef.current = img;
    // Sensible default trapezoid: front full-width at 95% h, back inset at 55% h.
    setPoints([
      [img.width * 0.05, img.height * 0.98],
      [img.width * 0.95, img.height * 0.98],
      [img.width * 0.7, img.height * 0.6],
      [img.width * 0.3, img.height * 0.6],
    ]);
  };

  // Redraw on canvas
  useEffect(() => {
    if (!file || !canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const scale = 800 / file.w;
    canvas.width = file.w * scale;
    canvas.height = file.h * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = p[0] * scale;
      const y = p[1] * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fill();

    points.forEach((p) => {
      const x = p[0] * scale;
      const y = p[1] * scale;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.stroke();
    });
  }, [points, file]);

  function pointerDown(e: React.PointerEvent) {
    if (!canvasRef.current || !file) return;
    const r = canvasRef.current.getBoundingClientRect();
    const scale = file.w / r.width;
    const x = (e.clientX - r.left) * scale;
    const y = (e.clientY - r.top) * scale;
    let best = -1;
    let dmin = Infinity;
    points.forEach((p, i) => {
      const d = Math.hypot(p[0] - x, p[1] - y);
      if (d < dmin) {
        dmin = d;
        best = i;
      }
    });
    if (dmin < 60) setDragging(best);
  }
  function pointerMove(e: React.PointerEvent) {
    if (dragging === null || !canvasRef.current || !file) return;
    const r = canvasRef.current.getBoundingClientRect();
    const scale = file.w / r.width;
    const x = Math.max(0, Math.min(file.w, (e.clientX - r.left) * scale));
    const y = Math.max(0, Math.min(file.h, (e.clientY - r.top) * scale));
    setPoints((pts) => pts.map((p, i) => (i === dragging ? [x, y] : p)));
  }
  function pointerUp() {
    setDragging(null);
  }

  const save = async () => {
    if (!file || !imgRef.current) return;
    // Downsize the image to keep localStorage happy.
    const targetW = 1600;
    const scale = targetW / file.w;
    const c = document.createElement("canvas");
    c.width = targetW;
    c.height = Math.round(file.h * scale);
    c.getContext("2d")!.drawImage(imgRef.current, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL("image/jpeg", 0.85);

    const polygon: RoomPolygon = {
      size: [c.width, c.height],
      points: points.map((p) => [p[0] * scale, p[1] * scale] as Point),
      pixelsPerMeter: 300,
    };
    const key = `custom-${Date.now().toString(36)}`;
    saveCustomRoom({
      key,
      name: file.name || "My Room",
      imageDataUrl: dataUrl,
      polygon,
      createdAt: Date.now(),
    });
    onSaved(key);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold">Upload Your Room</h4>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900">✕</button>
        </div>

        {!file ? (
          <>
            <label className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 text-neutral-600 hover:border-neutral-500 hover:bg-neutral-50">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
              />
              <div className="text-sm font-medium">Click to pick a room photo</div>
              <div className="mt-1 text-xs text-neutral-500">
                Straight-on shot, camera at eye level, floor clearly visible. Min {MIN_W}×{MIN_H}px.
              </div>
            </label>
            {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
          </>
        ) : (
          <>
            <p className="mb-3 text-sm text-neutral-600">
              Drag the four corners to trace the floor: front-left, front-right, back-right, back-left.
            </p>
            <canvas
              ref={canvasRef}
              onPointerDown={pointerDown}
              onPointerMove={pointerMove}
              onPointerUp={pointerUp}
              onPointerLeave={pointerUp}
              className="w-full cursor-crosshair rounded-xl border border-neutral-200 bg-neutral-50"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setFile(null);
                  setPoints([]);
                }}
                className="rounded-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              >
                Change Photo
              </button>
              <button
                onClick={save}
                className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
              >
                Save Room
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
