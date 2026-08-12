// Utility: compute an affine matrix that maps three source points to three
// destination points. Used to warp a texture rectangle into a triangular
// slice of the destination polygon (which, combined with a triangle fan,
// approximates a full perspective warp with no WebGL required).

export type Affine = { a: number; b: number; c: number; d: number; e: number; f: number };

export function affineFromTriangles(
  src: [number, number][],
  dst: [number, number][],
): Affine {
  // Solve for matrix M so that M * [x y 1]^T = [x' y']^T for the three point pairs.
  // Two systems of 3 equations each.
  const [[x1, y1], [x2, y2], [x3, y3]] = src;
  const [[u1, v1], [u2, v2], [u3, v3]] = dst;

  const det = x1 * (y2 - y3) - y1 * (x2 - x3) + (x2 * y3 - x3 * y2);
  if (Math.abs(det) < 1e-8) {
    return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  }
  const invDet = 1 / det;

  const a = ((u1 * (y2 - y3)) + (u2 * (y3 - y1)) + (u3 * (y1 - y2))) * invDet;
  const c = ((u1 * (x3 - x2)) + (u2 * (x1 - x3)) + (u3 * (x2 - x1))) * invDet;
  const e =
    ((u1 * (x2 * y3 - x3 * y2)) +
      (u2 * (x3 * y1 - x1 * y3)) +
      (u3 * (x1 * y2 - x2 * y1))) *
    invDet;

  const b = ((v1 * (y2 - y3)) + (v2 * (y3 - y1)) + (v3 * (y1 - y2))) * invDet;
  const d = ((v1 * (x3 - x2)) + (v2 * (x1 - x3)) + (v3 * (x2 - x1))) * invDet;
  const f =
    ((v1 * (x2 * y3 - x3 * y2)) +
      (v2 * (x3 * y1 - x1 * y3)) +
      (v3 * (x1 * y2 - x2 * y1))) *
    invDet;

  return { a, b, c, d, e, f };
}

/**
 * Projective homography from the unit square to an arbitrary quadrilateral.
 *
 * Corners of the unit square are:
 *   (0,0) -> tl, (1,0) -> tr, (1,1) -> br, (0,1) -> bl
 *
 * Returns a function project(u, v) -> [x, y] that applies the homography.
 * Unlike bilinear interpolation over the same corners, this preserves
 * straight lines and produces a real vanishing point — grid lines drawn in
 * (u, v) space converge in image space just like they do in a photograph.
 *
 * Formula: standard closed-form solution for unit-square-to-quad, see
 * Heckbert, "Fundamentals of Texture Mapping and Image Warping" (1989).
 */
export function homographyUnitSquareToQuad(
  tl: [number, number],
  tr: [number, number],
  br: [number, number],
  bl: [number, number],
): (u: number, v: number) => [number, number] {
  const [x0, y0] = tl;
  const [x1, y1] = tr;
  const [x2, y2] = br;
  const [x3, y3] = bl;

  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const sx = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const sy = y0 - y1 + y2 - y3;

  const denom = dx1 * dy2 - dx2 * dy1;
  // Degenerate (affine) quad: fall back to bilinear so we still produce something.
  if (Math.abs(denom) < 1e-8) {
    return (u, v) => {
      const topX = x0 + (x1 - x0) * u;
      const topY = y0 + (y1 - y0) * u;
      const botX = x3 + (x2 - x3) * u;
      const botY = y3 + (y2 - y3) * u;
      return [topX + (botX - topX) * v, topY + (botY - topY) * v];
    };
  }

  const g = (sx * dy2 - dx2 * sy) / denom;
  const h = (dx1 * sy - sx * dy1) / denom;

  const a = x1 - x0 + g * x1;
  const b = x3 - x0 + h * x3;
  const c = x0;
  const d = y1 - y0 + g * y1;
  const e = y3 - y0 + h * y3;
  const f = y0;

  return (u, v) => {
    const w = g * u + h * v + 1;
    return [(a * u + b * v + c) / w, (d * u + e * v + f) / w];
  };
}

