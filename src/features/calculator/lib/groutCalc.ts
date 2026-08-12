import {
  GROUT_PACKS,
  GROUT_PRODUCTS,
  GROUT_SHADES,
  GROUT_WASTAGE_FACTOR,
  type GroutProduct,
} from "../config/grout";
import { round, toSquareMeters, type AreaUnit } from "./units";

export interface GroutInput {
  tileLengthMm: number;
  tileWidthMm: number;
  tileThicknessMm: number;
  jointWidthMm: number;
  area: number;
  areaUnit: AreaUnit;
  specificGravity: number;
  packKg: number;
  tileShadeId?: string | null;
}

export interface GroutResult {
  areaM2: number;
  consumptionKgPerM2: number;
  baseKg: number;
  wasteKg: number;
  totalKg: number;
  packKg: number;
  packs: number;
  product: GroutProduct;
  shadeRecommendation: string | null;
}

/**
 * Standard industry grout consumption formula (kg per m²):
 *
 *   ((L + W) x T x J) / ((L + J) x (W + J)) x specific gravity
 *
 * with all tile dimensions in mm.
 */
export function groutConsumptionKgPerM2(o: {
  tileLengthMm: number;
  tileWidthMm: number;
  tileThicknessMm: number;
  jointWidthMm: number;
  specificGravity: number;
}): number {
  const { tileLengthMm: L, tileWidthMm: W, tileThicknessMm: T, jointWidthMm: J, specificGravity: SG } = o;
  if (!L || !W || !T || !J) return 0;
  const denominator = (L + J) * (W + J);
  if (denominator <= 0) return 0;
  return round((((L + W) * T * J) / denominator) * SG, 3);
}

export function recommendGroutProduct(jointWidthMm: number): GroutProduct {
  return (
    GROUT_PRODUCTS.find(p => jointWidthMm >= p.minJointMm && jointWidthMm <= p.maxJointMm) ??
    GROUT_PRODUCTS[0]
  );
}

export function calculateGrout(input: GroutInput): GroutResult {
  const areaM2 = Math.max(0, toSquareMeters(input.area || 0, input.areaUnit));
  const consumptionKgPerM2 = groutConsumptionKgPerM2(input);
  const baseKg = round(consumptionKgPerM2 * areaM2, 2);
  const wasteKg = round(baseKg * GROUT_WASTAGE_FACTOR, 2);
  const totalKg = round(baseKg + wasteKg, 2);
  const packKg = GROUT_PACKS.some(p => p.kg === input.packKg) ? input.packKg : 5;
  const packs = totalKg > 0 ? Math.ceil(totalKg / packKg) : 0;
  const shade = GROUT_SHADES.find(s => s.id === input.tileShadeId) ?? null;

  return {
    areaM2: round(areaM2, 2),
    consumptionKgPerM2,
    baseKg,
    wasteKg,
    totalKg,
    packKg,
    packs,
    product: recommendGroutProduct(input.jointWidthMm || 0),
    shadeRecommendation: shade ? shade.recommend : null,
  };
}
