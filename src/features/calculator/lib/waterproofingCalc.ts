import {
  WATERPROOFING_SYSTEMS,
  WATERPROOFING_WASTAGE_FACTOR,
  type WaterproofingProduct,
  type WaterproofingSystem,
  type WaterproofingSystemId,
} from "../config/waterproofing";
import { fromSquareMeters, round, toSquareMeters, type AreaUnit } from "./units";

export interface WaterproofingInput {
  systemId: WaterproofingSystemId;
  areaId: string;
  area: number;
  areaUnit: AreaUnit;
}

export interface WaterproofingProductResult {
  product: WaterproofingProduct;
  coats: number;
  coverageSqftPerKg: number;
  baseKg: number;
  wasteKg: number;
  totalKg: number;
  packKg: number;
  packs: number;
  /** Total surface the ordered packs will cover (sq.ft, at the required coats). */
  coveredSqft: number;
}

export interface WaterproofingResult {
  system: WaterproofingSystem;
  areaLabel: string;
  areaNote: string;
  areaSqft: number;
  areaM2: number;
  products: WaterproofingProductResult[];
  primary: WaterproofingProductResult;
}

export function getWaterproofingSystem(systemId: WaterproofingSystemId): WaterproofingSystem {
  return WATERPROOFING_SYSTEMS.find(s => s.id === systemId) ?? WATERPROOFING_SYSTEMS[0];
}

export function calculateWaterproofing(input: WaterproofingInput): WaterproofingResult {
  const system = getWaterproofingSystem(input.systemId);
  const area = Math.max(0, input.area || 0);
  const areaM2 = toSquareMeters(area, input.areaUnit);
  const areaSqft = fromSquareMeters(areaM2, "sqft");
  const areaCfg = system.areas.find(a => a.id === input.areaId) ?? system.areas[0];

  const products = system.products.map<WaterproofingProductResult>(product => {
    const baseKg = round((areaSqft * product.coats) / product.coverageSqftPerKg, 2);
    const wasteKg = round(baseKg * WATERPROOFING_WASTAGE_FACTOR, 2);
    const totalKg = round(baseKg + wasteKg, 2);
    const packKg = product.packSizesKg[product.packSizesKg.length - 1];
    const packs = totalKg > 0 ? Math.ceil(totalKg / packKg) : 0;
    return {
      product,
      coats: product.coats,
      coverageSqftPerKg: product.coverageSqftPerKg,
      baseKg,
      wasteKg,
      totalKg,
      packKg,
      packs,
      coveredSqft: round((packs * packKg * product.coverageSqftPerKg) / product.coats, 0),
    };
  });

  return {
    system,
    areaLabel: areaCfg?.label ?? "",
    areaNote: areaCfg?.note ?? "",
    areaSqft: round(areaSqft, 2),
    areaM2: round(areaM2, 2),
    products,
    primary: products[0],
  };
}
