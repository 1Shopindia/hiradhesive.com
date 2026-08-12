import { useRef, useState } from "react";
import { makeSeamlessTexture } from "../lib/seamlessTexture";

type Props = {
  onClose: () => void;
  onDone: (dataUrl: string, name: string) => void;
};

/**
 * Simple custom-tile uploader. Users pick a file, we crop it to a square,
 * apply optional rotation, and generate a seamless texture. Full perspective
 * correction UI is available as an extension point in `homography.ts`.
 */
export function CustomTileUploader({ onClose, onDone }: Props) {
  const [rotation, setRotation] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("Custom Tile");
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = () => fileRef.current?.click();

  const onFile = (f: File | null) => {
    if (!f) return;
    setName(f.name.replace(/\.[^.]+$/, ""));
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const done = async () => {
    if (!preview) return;
    setProcessing(true);
    try {
      const rotated = await rotateImage(preview, rotation);
      const seamless = await makeSeamlessTexture(rotated);
      onDone(seamless, name || "Custom Tile");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold">Upload Your Own Tile</h4>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900">✕</button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />

        {!preview ? (
          <button
            onClick={pick}
            className="flex h-52 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 text-neutral-600 hover:border-neutral-500 hover:bg-neutral-50"
          >
            <span className="text-sm">Click to pick a tile photo</span>
            <span className="mt-1 text-xs text-neutral-500">JPG · PNG · WEBP</span>
          </button>
        ) : (
          <>
            <div className="flex justify-center overflow-hidden rounded-xl bg-neutral-100 p-3">
              <img
                src={preview}
                alt="Tile preview"
                style={{ transform: `rotate(${rotation}deg)`, maxHeight: 220 }}
              />
            </div>
            <label className="mt-3 block text-sm">
              <span className="mb-1 block text-neutral-600">Rotate</span>
              <input
                type="range"
                min={0}
                max={360}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full"
              />
            </label>
            <label className="mt-3 block text-sm">
              <span className="mb-1 block text-neutral-600">Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2"
              />
            </label>
          </>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
            Cancel
          </button>
          {preview && (
            <button
              onClick={done}
              disabled={processing}
              className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-40"
            >
              {processing ? "Processing…" : "Use Tile"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

async function rotateImage(src: string, deg: number): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
  const rad = (deg * Math.PI) / 180;
  const size = Math.max(img.width, img.height);
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.translate(size / 2, size / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  return c.toDataURL("image/png");
}
