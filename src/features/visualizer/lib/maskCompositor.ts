import type { RoomPolygon } from "../types";

/** Rasterize the polygon into a white-on-black mask canvas. */
export function polygonToMaskCanvas(polygon: RoomPolygon): HTMLCanvasElement {
  const [w, h] = polygon.size;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(polygon.points[0][0], polygon.points[0][1]);
  for (let i = 1; i < polygon.points.length; i++) {
    ctx.lineTo(polygon.points[i][0], polygon.points[i][1]);
  }
  ctx.closePath();
  ctx.fill();
  return c;
}

/**
 * Build a luminance-only version of the room image: the neutralized
 * grayscale of the original, remapped around mid-gray. Multiplying/overlaying
 * this on tiles transfers shadows and highlights without shifting hue.
 */
function buildLuminanceLayer(
  roomImage: HTMLImageElement,
  w: number,
  h: number,
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(roomImage, 0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  // Compute mean luminance to normalize around mid-gray.
  let sum = 0;
  const N = d.length / 4;
  for (let i = 0; i < d.length; i += 4) {
    sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  }
  const mean = sum / N;
  // Remap so mean luminance -> 128; contrast preserved.
  const gain = 0.85;
  for (let i = 0; i < d.length; i += 4) {
    const y = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    const v = Math.max(0, Math.min(255, 128 + (y - mean) * gain));
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/**
 * Composite `tiled` (the warped tile+grout canvas) over `roomImage`,
 * clipped by `mask` (white=floor). Returns a final canvas ready for display.
 *
 * Pipeline:
 *  1. Draw the room photo.
 *  2. Paint the tiles clipped to the floor mask.
 *  3. Overlay a neutralized luminance layer (from the room) in "overlay"
 *     mode so real shadows and highlights transfer onto the tiles without
 *     changing their color.
 *  4. Feather the mask edge slightly so tiles blend naturally into
 *     baseboards / rug edges rather than showing a hard cutout.
 *  5. Add a soft vignette darkening near the room's back wall for depth.
 */
export function composite(
  roomImage: HTMLImageElement,
  tiled: HTMLCanvasElement,
  mask: HTMLCanvasElement,
): HTMLCanvasElement {
  const w = tiled.width;
  const h = tiled.height;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d")!;

  // Base: room photo.
  ctx.drawImage(roomImage, 0, 0, w, h);

  // Feathered mask: slight blur so the tile edge doesn't look cut with scissors.
  const softMask = document.createElement("canvas");
  softMask.width = w;
  softMask.height = h;
  const smctx = softMask.getContext("2d")!;
  smctx.filter = "blur(2px)";
  smctx.drawImage(mask, 0, 0, w, h);
  smctx.filter = "none";

  // Masked tile layer (tiles ∩ soft mask).
  const masked = document.createElement("canvas");
  masked.width = w;
  masked.height = h;
  const mctx = masked.getContext("2d")!;
  mctx.drawImage(tiled, 0, 0);
  mctx.globalCompositeOperation = "destination-in";
  mctx.drawImage(softMask, 0, 0);
  mctx.globalCompositeOperation = "source-over";

  ctx.drawImage(masked, 0, 0);

  // Luminance borrow: overlay a normalized grayscale of the room, clipped
  // to the mask, in "overlay" mode. This transfers highlights AND shadows.
  const lum = buildLuminanceLayer(roomImage, w, h);
  const lumMasked = document.createElement("canvas");
  lumMasked.width = w;
  lumMasked.height = h;
  const lmctx = lumMasked.getContext("2d")!;
  lmctx.drawImage(lum, 0, 0);
  lmctx.globalCompositeOperation = "destination-in";
  lmctx.drawImage(softMask, 0, 0);
  lmctx.globalCompositeOperation = "source-over";

  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.55;
  ctx.drawImage(lumMasked, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  // Extra shadow pass: multiply the original room (masked) at low alpha,
  // so deep shadows near furniture / walls still read on the tiles.
  const shadow = document.createElement("canvas");
  shadow.width = w;
  shadow.height = h;
  const sctx = shadow.getContext("2d")!;
  sctx.drawImage(roomImage, 0, 0, w, h);
  sctx.globalCompositeOperation = "destination-in";
  sctx.drawImage(softMask, 0, 0);
  sctx.globalCompositeOperation = "source-over";

  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.18;
  ctx.drawImage(shadow, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  // Depth vignette: darken back of floor (top of mask bbox) for perspective.
  const vignette = document.createElement("canvas");
  vignette.width = w;
  vignette.height = h;
  const vctx = vignette.getContext("2d")!;
  const grad = vctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(0,0,0,0.28)");
  grad.addColorStop(0.55, "rgba(0,0,0,0.05)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  vctx.fillStyle = grad;
  vctx.fillRect(0, 0, w, h);
  vctx.globalCompositeOperation = "destination-in";
  vctx.drawImage(softMask, 0, 0);
  vctx.globalCompositeOperation = "source-over";

  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.9;
  ctx.drawImage(vignette, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  return out;
}
