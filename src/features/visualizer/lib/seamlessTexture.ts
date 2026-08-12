/**
 * Turn an arbitrary image into a (roughly) seamless 512×512 tile by
 * mirroring the borders and feathering the seams. Runs on the main thread —
 * fast enough for a single 512×512 image.
 *
 * EXTENSION: Move to a Web Worker (`seamlessWorker.ts`) if we ever process
 * many textures in bulk.
 */
export async function makeSeamlessTexture(src: string, size = 512): Promise<string> {
  const img = await loadImage(src);
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;

  // Center-crop the input square.
  const s = Math.min(img.width, img.height);
  const sx = (img.width - s) / 2;
  const sy = (img.height - s) / 2;
  ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);

  // Feather borders with mirrored copies.
  const feather = Math.round(size * 0.15);
  const strip = ctx.getImageData(0, 0, size, feather);
  // top ← flipped bottom (blend)
  const bottom = ctx.getImageData(0, size - feather, size, feather);
  blend(strip, bottom, 0.5);
  ctx.putImageData(strip, 0, 0);

  const left = ctx.getImageData(0, 0, feather, size);
  const right = ctx.getImageData(size - feather, 0, feather, size);
  blend(left, right, 0.5);
  ctx.putImageData(left, 0, 0);

  return c.toDataURL("image/jpeg", 0.9);
}

function blend(a: ImageData, b: ImageData, mix: number): void {
  const d1 = a.data;
  const d2 = b.data;
  for (let i = 0; i < d1.length; i += 4) {
    d1[i] = d1[i] * (1 - mix) + d2[i] * mix;
    d1[i + 1] = d1[i + 1] * (1 - mix) + d2[i + 1] * mix;
    d1[i + 2] = d1[i + 2] * (1 - mix) + d2[i + 2] * mix;
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image ${src}`));
    img.src = src;
  });
}
