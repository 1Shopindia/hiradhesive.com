import {
  ADHESIVE_GRADES,
  ADHESIVE_RULES,
  BACK_TILE_PRIMER,
  DEFAULT_GRADE_ID,
  PRIMER_TILE_TYPES,
  TILE_TYPES,
  TROWELS,
  WASTAGE_FACTOR,
  type AdhesiveGrade,
  type Location,
  type Surface,
  type TileTypeId,
  type TrowelConfig,
} from "../config/adhesive";
import { fromSquareMeters, round, toSquareMeters, type AreaUnit } from "./units";


export interface AdhesiveInput {
  tileType: TileTypeId;
  tileLengthMm: number;
  tileWidthMm: number;
  tileThicknessMm: number;
  location: Location;
  surface: Surface;
  area: number;
  areaUnit: AreaUnit;
  /** Optional manual override of the auto bed thickness. */
  bedThicknessOverrideMm?: number | null;
  /** Optional manual override of the recommended grade. */
  gradeOverrideId?: string | null;
  bagSizeKg?: number | null;
}

export interface AdhesiveResult {
  areaM2: number;
  longestEdgeMm: number;
  bedThicknessMm: number;
  autoBedThicknessMm: number;
  grade: AdhesiveGrade;
  gradeReason: string;
  trowel: TrowelConfig;
  /** m² covered per bag of the chosen size. */
  coverageM2PerBag: number;
  /** sq.ft covered per bag of the chosen size. */
  coverageSqftPerBag: number;
  /** kg per m². */
  consumptionKgPerM2: number;
  /** kg per sq.ft at the applied thickness. */
  consumptionKgPerSqft: number;

  baseKg: number;
  wasteKg: number;
  totalKg: number;
  bagSizeKg: number;
  bags: number;
  primerRecommended: boolean;
  primerLitres: number;
}

export function tileTypeConfig(id: TileTypeId) {
  return TILE_TYPES.find(t => t.id === id) ?? TILE_TYPES[0];
}

/** Pick a trowel from the tile's longest edge. */
export function recommendTrowel(longestEdgeMm: number, surface: Surface): TrowelConfig {
  if (surface === "wall" && longestEdgeMm <= 300) return TROWELS[0];
  if (longestEdgeMm <= 300) return TROWELS[0];
  if (longestEdgeMm <= 600) return TROWELS[1];
  if (longestEdgeMm <= 1000) return TROWELS[2];
  return TROWELS[3];
}

/** Evaluate the centralised recommendation matrix; first match wins. */
export function recommendGrade(input: {
  tileType: TileTypeId;
  location: Location;
  surface: Surface;
  longestEdgeMm: number;
}): { grade: AdhesiveGrade; reason: string } {
  for (const rule of ADHESIVE_RULES) {
    if (rule.tileTypes && !rule.tileTypes.includes(input.tileType)) continue;
    if (rule.location && rule.location !== input.location) continue;
    if (rule.surface && rule.surface !== input.surface) continue;
    if (rule.minEdgeMm != null && input.longestEdgeMm < rule.minEdgeMm) continue;
    if (rule.maxEdgeMm != null && input.longestEdgeMm > rule.maxEdgeMm) continue;
    return { grade: ADHESIVE_GRADES[rule.gradeId], reason: rule.reason };
  }
  return { grade: ADHESIVE_GRADES[DEFAULT_GRADE_ID], reason: "Default all-purpose recommendation." };
}

/** Auto application (bed) thickness in mm. */
export function autoBedThickness(input: {
  tileType: TileTypeId;
  longestEdgeMm: number;
  tileThicknessMm: number;
  surface: Surface;
  location: Location;
}): number {
  const cfg = tileTypeConfig(input.tileType);
  // Reactive-substrate applications are always thin-bed at 1.5 mm.
  if (cfg.baseBedMm < 3) return cfg.baseBedMm;
  let bed = cfg.baseBedMm;
  if (input.longestEdgeMm > 600) bed += 1;
  if (input.longestEdgeMm > 1000) bed += 1;
  if (input.tileThicknessMm > 12) bed += 1;
  if (input.location === "outdoor") bed += 1;
  if (input.surface === "wall") bed -= 1;
  return Math.min(12, Math.max(3, round(bed, 1)));
}

export function calculateAdhesive(input: AdhesiveInput): AdhesiveResult {
  const longestEdgeMm = Math.max(input.tileLengthMm || 0, input.tileWidthMm || 0);
  const areaM2 = Math.max(0, toSquareMeters(input.area || 0, input.areaUnit));
  const areaSqft = fromSquareMeters(areaM2, "sqft");

  const auto = autoBedThickness({
    tileType: input.tileType,
    longestEdgeMm,
    tileThicknessMm: input.tileThicknessMm || 0,
    surface: input.surface,
    location: input.location,
  });
  const bedThicknessMm = input.bedThicknessOverrideMm && input.bedThicknessOverrideMm > 0
    ? input.bedThicknessOverrideMm
    : auto;

  const recommended = recommendGrade({
    tileType: input.tileType,
    location: input.location,
    surface: input.surface,
    longestEdgeMm,
  });
  const grade = (input.gradeOverrideId && ADHESIVE_GRADES[input.gradeOverrideId]) || recommended.grade;
  const gradeReason = input.gradeOverrideId && ADHESIVE_GRADES[input.gradeOverrideId]
    ? "Manually selected grade."
    : recommended.reason;

  const trowel = recommendTrowel(longestEdgeMm, input.surface);

  // Catalogue coverage is published per sq.ft at the grade's reference
  // thickness; scale linearly with the actual application thickness.
  const thicknessFactor = grade.referenceThicknessMm > 0 ? bedThicknessMm / grade.referenceThicknessMm : 1;
  const consumptionKgPerSqft = round(grade.coverageKgPerSqft * thicknessFactor, 4);
  const consumptionKgPerM2 = round(consumptionKgPerSqft * 10.7639, 2);
  const baseKg = round(consumptionKgPerSqft * areaSqft, 2);
  const wasteKg = round(baseKg * WASTAGE_FACTOR, 2);
  const totalKg = round(baseKg + wasteKg, 2);

  const bagSizeKg = input.bagSizeKg && grade.bagSizesKg.includes(input.bagSizeKg)
    ? input.bagSizeKg
    : grade.bagSizesKg[grade.bagSizesKg.length - 1];
  const bags = totalKg > 0 ? Math.ceil(totalKg / bagSizeKg) : 0;
  const coverageM2PerBag = consumptionKgPerM2 > 0 ? round(bagSizeKg / consumptionKgPerM2, 2) : 0;
  const coverageSqftPerBag = consumptionKgPerSqft > 0 ? round(bagSizeKg / consumptionKgPerSqft, 1) : 0;

  const primerRecommended = PRIMER_TILE_TYPES.includes(input.tileType);
  const primerLitres = primerRecommended
    ? round(Math.max(0, areaM2) / BACK_TILE_PRIMER.coverageM2PerLitre, 2)
    : 0;

  return {
    areaM2: round(areaM2, 2),
    longestEdgeMm,
    bedThicknessMm,
    autoBedThicknessMm: auto,
    grade,
    gradeReason,
    trowel,
    coverageM2PerBag,
    coverageSqftPerBag,
    consumptionKgPerM2,
    consumptionKgPerSqft,
    baseKg,
    wasteKg,
    totalKg,
    bagSizeKg,
    bags,
    primerRecommended,
    primerLitres,
  };
}

