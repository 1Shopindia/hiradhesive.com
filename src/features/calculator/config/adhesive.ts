/**
 * Configuration for the HIR Tile Adhesive calculator.
 *
 * Source of truth: official HIR catalogue / product specifications.
 * Everything here is data-only (centralised recommendation matrix) so the
 * engine can later be served from the admin panel without touching the
 * calculation or UI code.
 */

export type TileTypeId =
  | "ceramic"
  | "vitrified"
  | "large-vitrified"
  | "porcelain"
  | "marble"
  | "granite"
  | "natural-stone"
  | "large-format"
  | "ultra-large-slab"
  | "composite-stone"
  | "tile-on-tile"
  | "stone-framing"
  | "glass"
  | "metal"
  | "wood"
  | "quartz";

export type Surface = "floor" | "wall";
export type Location = "indoor" | "outdoor";

export interface TileTypeConfig {
  id: TileTypeId;
  label: string;
  /** Base bed thickness in mm before size / surface adjustments. */
  baseBedMm: number;
  /** Typical porosity note shown to the user. */
  note: string;
}

export const TILE_TYPES: TileTypeConfig[] = [
  { id: "ceramic", label: "Ceramic Tile", baseBedMm: 3, note: "Porous body, high water absorption" },
  { id: "vitrified", label: "Vitrified Tile (Standard)", baseBedMm: 3, note: "Standard vitrified up to 1000 × 1000 mm" },
  { id: "large-vitrified", label: "Vitrified Tile (Large)", baseBedMm: 4, note: "Large vitrified tiles above 1000 mm" },
  { id: "porcelain", label: "Porcelain Tile", baseBedMm: 4, note: "Very low absorption, dense body" },
  { id: "marble", label: "Marble", baseBedMm: 4, note: "Moisture sensitive, use white adhesive" },
  { id: "granite", label: "Granite", baseBedMm: 4, note: "Heavy, dense natural stone" },
  { id: "natural-stone", label: "Natural Stone", baseBedMm: 4, note: "Variable back profile, non-staining adhesive" },
  { id: "large-format", label: "Large Format Slab", baseBedMm: 5, note: "Large slabs, back-buttering required" },
  { id: "ultra-large-slab", label: "Ultra Large Format Slab", baseBedMm: 5, note: "Slabs up to 1600 × 3200 mm, high movement" },
  { id: "composite-stone", label: "Composite / Artificial Stone", baseBedMm: 5, note: "Engineered stone, maximum flexibility needed" },
  { id: "tile-on-tile", label: "Tile on Tile", baseBedMm: 4, note: "Overlay on existing tiled surface" },
  { id: "stone-framing", label: "Stone / Tile Framing Work", baseBedMm: 4, note: "Framing & cladding installations" },
  { id: "glass", label: "Glass Surface", baseBedMm: 1.5, note: "Non-absorbent substrate — reactive adhesive only" },
  { id: "metal", label: "Metal / Aluminium Surface", baseBedMm: 1.5, note: "Non-absorbent substrate — reactive adhesive only" },
  { id: "wood", label: "Wood / Plywood Surface", baseBedMm: 1.5, note: "Movement-prone substrate — reactive adhesive" },
  { id: "quartz", label: "Quartz / Composite Surface", baseBedMm: 1.5, note: "Special bonding application" },
];

export interface AdhesiveGrade {
  id: string;
  name: string;
  /** Short marketing / technical description. */
  summary: string;
  /** Indian standard classification. */
  classification: string;
  /** Bag / pack sizes available, in kg. */
  bagSizesKg: number[];
  /** Catalogue coverage: kg per sq.ft at the grade's reference thickness. */
  coverageKgPerSqft: number;
  /** Reference thickness (mm) at which coverageKgPerSqft is published. */
  referenceThicknessMm: number;
}

export const ADHESIVE_GRADES: Record<string, AdhesiveGrade> = {
  alpha: {
    id: "alpha",
    name: "HIR ALPHA",
    summary:
      "Cement based adhesive for ceramic & standard vitrified tiles, marble and stone on interior/exterior floors and walls.",
    classification: "Type2T (C2T)",
    bagSizesKg: [20],
    coverageKgPerSqft: 0.54,
    referenceThicknessMm: 3,
  },
  beta: {
    id: "beta",
    name: "HIR BETA",
    summary:
      "Extended open time adhesive for large vitrified & porcelain tiles, marble, stone, tile-on-tile and framing work.",
    classification: "Type3 (C2TE)",
    bagSizesKg: [20],
    coverageKgPerSqft: 0.53,
    referenceThicknessMm: 3,
  },
  gamma: {
    id: "gamma",
    name: "HIR GAMMA",
    summary:
      "High strength adhesive for premium vitrified, porcelain, marble and natural stone including heavy wall applications.",
    classification: "Type3T (C2TE)",
    bagSizesKg: [20],
    coverageKgPerSqft: 0.52,
    referenceThicknessMm: 3,
  },
  delta: {
    id: "delta",
    name: "HIR DELTA",
    summary:
      "Deformable S1 adhesive for large slabs, natural stone, exteriors, heavy traffic and thermal expansion areas.",
    classification: "Type4TS1 (C2TES1)",
    bagSizesKg: [20],
    coverageKgPerSqft: 0.495,
    referenceThicknessMm: 3,
  },
  "delta-plus": {
    id: "delta-plus",
    name: "HIR DELTA+",
    summary:
      "Highly deformable S2 adhesive for ultra large format slabs, composite stone, steel, concrete, plywood and high movement areas.",
    classification: "Type4TS2 (C2TES2)",
    bagSizesKg: [20],
    coverageKgPerSqft: 0.495,
    referenceThicknessMm: 3,
  },
  "flexi-plus": {
    id: "flexi-plus",
    name: "HIR FLEXI+",
    summary:
      "Two-component reactive adhesive for glass, metal, aluminium, wood, quartz, composite surfaces and special repair work.",
    classification: "R2TE",
    bagSizesKg: [4],
    // 4 kg pack covers 50 sq.ft @ 1.5 mm => 0.08 kg / sq.ft
    coverageKgPerSqft: 0.08,
    referenceThicknessMm: 1.5,
  },
};

export const BACK_TILE_PRIMER = {
  name: "HIR Back Tile Primer",
  reason:
    "Recommended as an additional back-coating for granite, Italian / natural marble, full body and slab tiles on wall, floor and framing work. Never a replacement for the adhesive.",
  coverageM2PerLitre: 8,
  packSizesL: [1, 5, 20],
  /** Official HIR performance / exhibition demonstration video. */
  videoUrl: "https://www.youtube.com/@HIRindustries",
  videoLabel: "Watch Performance Video",
};

/** Materials that additionally require HIR Back Tile Primer (wall / floor / framing). */
export const PRIMER_TILE_TYPES: TileTypeId[] = [
  "granite",
  "marble",
  "natural-stone",
  "porcelain",
  "large-format",
  "ultra-large-slab",
  "stone-framing",
];

export interface TrowelConfig {
  id: string;
  label: string;
  /** Notch size in mm. */
  notchMm: number;
  description: string;
  /** Bed multiplier — effective bed = notch * factor. */
  bedFactor: number;
}

export const TROWELS: TrowelConfig[] = [
  { id: "6x6", label: "6 × 6 mm", notchMm: 6, bedFactor: 0.5, description: "Small tiles up to 300 × 300 mm on smooth substrates." },
  { id: "8x8", label: "8 × 8 mm", notchMm: 8, bedFactor: 0.5, description: "Medium tiles 300 × 300 to 600 × 600 mm." },
  { id: "10x10", label: "10 × 10 mm", notchMm: 10, bedFactor: 0.55, description: "Large tiles 600 × 600 to 1000 × 1000 mm, exterior work." },
  { id: "12x12", label: "12 × 12 mm", notchMm: 12, bedFactor: 0.55, description: "Large format tiles & slabs above 1000 mm." },
];

/** Wastage added to every adhesive estimate (fraction). */
export const WASTAGE_FACTOR = 0.02;

/**
 * Centralised recommendation matrix — evaluated top-to-bottom, first match wins.
 * Ordering encodes the official HIR hierarchy: never step below the catalogue
 * requirement, never step above it when Alpha / Beta already qualifies.
 */
export interface AdhesiveRule {
  id: string;
  /** Optional constraints — undefined means "any". */
  tileTypes?: TileTypeId[];
  location?: Location;
  surface?: Surface;
  /** Minimum longest tile edge in mm for the rule to apply. */
  minEdgeMm?: number;
  maxEdgeMm?: number;
  gradeId: keyof typeof ADHESIVE_GRADES;
  reason: string;
}

export const ADHESIVE_RULES: AdhesiveRule[] = [
  // 1. Special / non-absorbent substrates — reactive adhesive only.
  {
    id: "reactive-substrate",
    tileTypes: ["glass", "metal", "wood", "quartz"],
    gradeId: "flexi-plus",
    reason: "Glass, metal, aluminium, wood and quartz substrates require the reactive R2TE adhesive HIR FLEXI+.",
  },

  // 2. Ultra large format & composite stone — maximum flexibility (S2).
  {
    id: "ultra-large-slab",
    tileTypes: ["ultra-large-slab", "composite-stone"],
    gradeId: "delta-plus",
    reason: "Ultra large format slabs and composite / artificial stone need the highly deformable S2 grade.",
  },
  {
    id: "extreme-size-any-type",
    minEdgeMm: 2401,
    gradeId: "delta-plus",
    reason: "Tiles above 2400 mm behave as ultra large slabs — S2 deformability is mandatory (up to 1600 × 3200 mm).",
  },
  {
    id: "outdoor-large-slab",
    location: "outdoor",
    minEdgeMm: 1201,
    gradeId: "delta-plus",
    reason: "Exterior heavy duty slabs above 1200 mm require maximum flexibility (S2).",
  },

  // 3. Large slabs / stone / exterior — deformable S1.
  {
    id: "large-slab",
    tileTypes: ["large-format"],
    gradeId: "delta",
    reason: "Large slabs need a deformable S1 adhesive for thermal movement and heavy traffic.",
  },
  {
    id: "exterior-stone",
    tileTypes: ["marble", "granite", "natural-stone"],
    location: "outdoor",
    gradeId: "delta",
    reason: "Exterior natural stone is exposed to weather and thermal expansion — S1 deformability required.",
  },
  {
    id: "outdoor-heavy",
    location: "outdoor",
    minEdgeMm: 1001,
    gradeId: "delta",
    reason: "Exterior installations above 1000 mm require a Type 4 S1 adhesive.",
  },

  // 4. Premium / heavy wall & framing — C2TE high strength.
  {
    id: "premium-heavy-wall",
    surface: "wall",
    minEdgeMm: 1201,
    gradeId: "gamma",
    reason: "Premium wall applications up to 600 × 2400 mm need the high strength C2TE grade.",
  },
  {
    id: "premium-natural-stone",
    tileTypes: ["marble", "granite", "natural-stone"],
    minEdgeMm: 1001,
    gradeId: "gamma",
    reason: "Premium natural stone above 1000 mm is fixed with HIR GAMMA (up to 1200 × 2400 mm).",
  },
  {
    id: "premium-framing",
    tileTypes: ["stone-framing"],
    minEdgeMm: 1201,
    gradeId: "gamma",
    reason: "Premium stone framing above 1200 mm requires HIR GAMMA (600 × 2400 mm framing).",
  },
  {
    id: "premium-large-floor",
    minEdgeMm: 1201,
    gradeId: "gamma",
    reason: "Premium large format up to 1200 × 2400 mm is fixed with the high strength C2TE grade.",
  },

  // 5. Large vitrified / porcelain / stone / tile-on-tile / framing — C2TE.
  {
    id: "large-vitrified",
    tileTypes: ["large-vitrified", "porcelain"],
    gradeId: "beta",
    reason: "Large vitrified and porcelain tiles need extended open time (C2TE).",
  },
  {
    id: "framing-work",
    tileTypes: ["stone-framing"],
    gradeId: "beta",
    reason: "Framing work up to 600 × 2400 mm is covered by HIR BETA (C2TE).",
  },
  {
    id: "tile-on-tile-large",
    tileTypes: ["tile-on-tile"],
    minEdgeMm: 1001,
    gradeId: "beta",
    reason: "Tile-on-tile above 1000 mm requires extended open time (up to 1200 × 2400 mm).",
  },
  {
    id: "wall-above-600",
    surface: "wall",
    minEdgeMm: 601,
    gradeId: "beta",
    reason: "Wall tiles above 600 × 600 mm need the C2TE grade (600×600 to 1000×1000, 600×1200).",
  },
  {
    id: "floor-above-1000",
    minEdgeMm: 1001,
    gradeId: "beta",
    reason: "Floor tiles above 1000 × 1000 mm need extended open time (up to 1200 × 2400 mm).",
  },

  // 6. Standard installations — C2T is sufficient.
  {
    id: "standard-ceramic-vitrified",
    tileTypes: ["ceramic", "vitrified"],
    gradeId: "alpha",
    reason: "Ceramic / standard vitrified tiles within catalogue size limits are fixed with HIR ALPHA (C2T).",
  },
  {
    id: "standard-stone",
    tileTypes: ["marble", "granite", "natural-stone"],
    gradeId: "alpha",
    reason: "Interior marble and stone within size limits are fixed with HIR ALPHA (C2T).",
  },
  {
    id: "tile-on-tile-standard",
    tileTypes: ["tile-on-tile"],
    gradeId: "alpha",
    reason: "Tile-on-tile up to 1000 × 1000 mm is covered by HIR ALPHA (C2T).",
  },
];

export const DEFAULT_GRADE_ID = "beta";
