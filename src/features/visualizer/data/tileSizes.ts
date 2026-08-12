import type { TileSize } from "../types";

export const TILE_SIZES: TileSize[] = [
  { id: "300x300", label: "300 × 300 mm", widthMm: 300, heightMm: 300 },
  { id: "600x600", label: "600 × 600 mm", widthMm: 600, heightMm: 600 },
  { id: "600x1200", label: "600 × 1200 mm", widthMm: 600, heightMm: 1200 },
  { id: "800x800", label: "800 × 800 mm", widthMm: 800, heightMm: 800 },
  { id: "1000x1000", label: "1000 × 1000 mm", widthMm: 1000, heightMm: 1000 },
  { id: "custom", label: "Custom", widthMm: 600, heightMm: 600 },
];
