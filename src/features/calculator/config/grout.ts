/** Configuration for the epoxy / grout calculator. */

export interface GroutPack {
  id: string;
  label: string;
  kg: number;
}

export const GROUT_PACKS: GroutPack[] = [
  { id: "1kg", label: "1 KG", kg: 1 },
  { id: "5kg", label: "5 KG", kg: 5 },
];

export const DEFAULT_SPECIFIC_GRAVITY = 1.75;
export const GROUT_WASTAGE_FACTOR = 0.02;

export interface GroutProduct {
  id: string;
  name: string;
  summary: string;
  minJointMm: number;
  maxJointMm: number;
}

export const GROUT_PRODUCTS: GroutProduct[] = [
  {
    id: "hir-epoxy-plus",
    name: "HIR Epoxy Grout Plus",
    summary: "Stain-free 3-component epoxy grout for joints from 1 to 12 mm.",
    minJointMm: 1,
    maxJointMm: 12,
  },
  {
    id: "hir-epoxy-wide",
    name: "HIR Epoxy Grout Wide Joint",
    summary: "Graded filler epoxy grout engineered for wide joints above 12 mm.",
    minJointMm: 12,
    maxJointMm: 30,
  },
];

/** Tile colour families → recommended HIR epoxy grout shade. */
export interface GroutShade {
  id: string;
  label: string;
  /** Hex swatch for the UI. */
  hex: string;
  recommend: string;
}

export const GROUT_SHADES: GroutShade[] = [
  { id: "white", label: "White / Ivory Tile", hex: "#f7f5f0", recommend: "HIR Epoxy — Bright White" },
  { id: "beige", label: "Beige / Sand Tile", hex: "#ddc9a3", recommend: "HIR Epoxy — Desert Beige" },
  { id: "grey", label: "Grey / Cement Tile", hex: "#9aa0a6", recommend: "HIR Epoxy — Urban Grey" },
  { id: "wood", label: "Wood / Brown Tile", hex: "#8a5a33", recommend: "HIR Epoxy — Walnut" },
  { id: "black", label: "Black / Charcoal Tile", hex: "#2b2b2f", recommend: "HIR Epoxy — Graphite Black" },
  { id: "marble", label: "Marble / Statuario", hex: "#eceff3", recommend: "HIR Epoxy — Pearl White" },
  { id: "metallic", label: "Designer / Metallic", hex: "#c9a227", recommend: "HIR Epoxy — Gold Glitter" },
];
