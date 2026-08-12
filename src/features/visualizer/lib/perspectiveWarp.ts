import type { Point, RoomPolygon } from "../types";
import { affineFromTriangles, homographyUnitSquareToQuad } from "./homography";


// Estimate a 4-point trapezoid enclosing the polygon and its "world" size.
// For a 4-point polygon we assume order:
//   [bottomLeft, bottomRight, topRight, topLeft] in image coords.
// For polygons with more points we fall back to the axis-aligned bounding
// box (accurate enough for premium visualization on empty floors).
function extractQuad(polygon: RoomPolygon): {
  bl: Point;
  br: Point;
  tr: Point;
  tl: Point;
} {
  if (polygon.points.length === 4) {
    const [bl, br, tr, tl] = polygon.points;
    return { bl, br, tr, tl };
  }
  const xs = polygon.points.map((p) => p[0]);
  const ys = polygon.points.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  return { bl: [x0, y1], br: [x1, y1], tr: [x1, y0], tl: [x0, y0] };
}

export type WarpOptions = {
  roomSize: [number, number]; // canvas size in room-image pixels
  polygon: RoomPolygon;
  tileWidthMm: number;
  tileHeightMm: number;
  groutMm: number;
  epoxyHex: string;
  groutFinish: "Matte" | "Semi Gloss" | "Gloss";
  texture: HTMLImageElement; // seamless tile texture
  subdivisions?: number; // segments per axis of the trapezoid (default 12)
};

/**
 * Render tiles into the room polygon using an inverse-mapped grid.
 *
 * We subdivide the trapezoid in "world space" (where each cell is one tile),
 * then for each cell forward-project its four world corners to the image
 * polygon corners via bilinear interpolation and draw the texture there.
 *
 * This produces a strong perspective illusion without WebGL: tiles at the
 * back of the room appear smaller, and grout lines converge to the vanishing
 * point of the trapezoid.
 */
export function renderTiledFloor(
  ctx: CanvasRenderingContext2D,
  opts: WarpOptions,
): void {
  const { bl, br, tr, tl } = extractQuad(opts.polygon);
  const pxPerM = opts.polygon.pixelsPerMeter;

  // Real-world floor dimensions in metres.
  //
  // Width can be measured from the front edge (which is at true scale in
  // one-point perspective). Depth CANNOT be recovered from the image side
  // length — that edge is heavily foreshortened, so using it gives too few
  // rows and stretched tiles toward the back. Prefer `depthMeters` from
  // polygon.json; fall back to a perspective-aware estimate assuming a
  // camera with a typical field of view.
  const frontWidthPx = Math.hypot(br[0] - bl[0], br[1] - bl[1]);
  const backWidthPx = Math.hypot(tr[0] - tl[0], tr[1] - tl[1]);

  const widthM = opts.polygon.widthMeters ?? frontWidthPx / pxPerM;

  let depthM: number;
  if (opts.polygon.depthMeters) {
    depthM = opts.polygon.depthMeters;
  } else {
    // Perspective estimate: for a camera pointed roughly horizontally, if the
    // back edge appears at fraction r = backWidthPx / frontWidthPx of the
    // front edge, then real depth ≈ widthM * (1 - r) / r * k, where k is a
    // camera-geometry constant (~1.2 for typical interior shots).
    const r = Math.max(0.15, backWidthPx / frontWidthPx);
    depthM = (widthM * (1 - r) / r) * 1.2;
  }

  const tileWm = opts.tileWidthMm / 1000;
  const tileHm = opts.tileHeightMm / 1000;

  const cols = Math.max(1, Math.round(widthM / tileWm));
  const rows = Math.max(1, Math.round(depthM / tileHm));


  const tex = opts.texture;
  const texW = tex.width;
  const texH = tex.height;
  const _ = opts.subdivisions;
  void _;

  // Clip to the polygon so nothing escapes the floor.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(opts.polygon.points[0][0], opts.polygon.points[0][1]);
  for (let i = 1; i < opts.polygon.points.length; i++) {
    ctx.lineTo(opts.polygon.points[i][0], opts.polygon.points[i][1]);
  }
  ctx.closePath();
  ctx.clip();

  // True projective homography from unit square (u,v) to the image quad.
  // (u=0,v=0)=tl (back-left), (u=1,v=0)=tr (back-right),
  // (u=1,v=1)=br (front-right), (u=0,v=1)=bl (front-left).
  // Unlike bilinear interpolation, this converges tile edges toward a real
  // vanishing point, matching the room's own perspective.
  const projectH = homographyUnitSquareToQuad(tl, tr, br, bl);
  function project(u: number, v: number): Point {
    return projectH(u, v);
  }


  // Grout background: paint the epoxy color across the whole polygon first,
  // so gaps at cell borders read as grout.
  ctx.fillStyle = opts.epoxyHex;
  ctx.fillRect(0, 0, opts.roomSize[0], opts.roomSize[1]);

  // Draw each tile cell as two triangles, each with an affine transform.
  // Inset each cell edge by half the grout ratio so the epoxy background
  // shows through as a visible line. Clamp so 1 mm grout is still readable
  // and very fat grout never eats the whole tile.
  const rawRatio = opts.groutMm / opts.tileWidthMm;
  const groutInset = Math.min(0.08, Math.max(0.006, rawRatio)) * 0.5 + rawRatio * 0.5;

  for (let row = 0; row < rows; row++) {
    const v0 = row / rows;
    const v1 = (row + 1) / rows;
    for (let col = 0; col < cols; col++) {
      const u0 = col / cols;
      const u1 = (col + 1) / cols;

      // Inset within cell for grout gap.
      const uu0 = u0 + (u1 - u0) * groutInset;
      const uu1 = u1 - (u1 - u0) * groutInset;
      const vv0 = v0 + (v1 - v0) * groutInset;
      const vv1 = v1 - (v1 - v0) * groutInset;

      const p00 = project(uu0, vv0);
      const p10 = project(uu1, vv0);
      const p11 = project(uu1, vv1);
      const p01 = project(uu0, vv1);

      // Texture rectangle: full texture per tile; tile texture is already seamless.
      // Draw two triangles: (p00, p10, p11) and (p00, p11, p01)
      drawTexturedTriangle(ctx, tex, [[0, 0], [texW, 0], [texW, texH]], [p00, p10, p11]);
      drawTexturedTriangle(ctx, tex, [[0, 0], [texW, texH], [0, texH]], [p00, p11, p01]);
    }
  }

  // Grout finish highlight (very subtle gloss line for Semi Gloss / Gloss).
  if (opts.groutFinish !== "Matte") {
    const glossAlpha = opts.groutFinish === "Gloss" ? 0.12 : 0.06;
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = `rgba(255,255,255,${glossAlpha})`;
    ctx.fillRect(0, 0, opts.roomSize[0], opts.roomSize[1]);
    ctx.globalCompositeOperation = "source-over";
  }

  ctx.restore();
}

function drawTexturedTriangle(
  ctx: CanvasRenderingContext2D,
  tex: HTMLImageElement,
  srcTri: [number, number][],
  dstTri: [number, number][],
): void {
  const m = affineFromTriangles(srcTri, dstTri);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dstTri[0][0], dstTri[0][1]);
  ctx.lineTo(dstTri[1][0], dstTri[1][1]);
  ctx.lineTo(dstTri[2][0], dstTri[2][1]);
  ctx.closePath();
  ctx.clip();
  ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
  ctx.drawImage(tex, 0, 0);
  ctx.restore();
}
