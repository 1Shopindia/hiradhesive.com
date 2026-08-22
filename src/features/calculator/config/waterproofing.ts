/** Configuration for the waterproofing calculator. */

export type WaterproofingSystemId = "before-tiles" | "over-surface";

export interface WaterproofingProduct {
  id: string;
  name: string;
  summary: string;
  /** Coverage in sq.ft per kg per coat. */
  coverageSqftPerKg: number;
  /** Human readable coverage claim, e.g. "1 KG = 300 sq.ft". */
  coverageLabel: string;
  /** Required coats. */
  coats: number;
  packSizesKg: number[];
}

export interface WaterproofingArea {
  id: string;
  label: string;
  note: string;
}

export interface WaterproofingSystem {
  id: WaterproofingSystemId;
  label: string;
  /** Dropdown title shown to the user. */
  fieldLabel: string;
  areas: WaterproofingArea[];
  products: WaterproofingProduct[];
}

export const WATERPROOFING_SYSTEMS: WaterproofingSystem[] = [
  {
    id: "before-tiles",
    label: "Before Laying Tiles",
    fieldLabel: "Application Area",
    areas: [
      { id: "bathroom", label: "Bathroom", note: "Under-tile sandwich waterproofing" },
      { id: "balcony", label: "Balcony", note: "Open, rain exposed wet area" },
      { id: "water-tank", label: "Water Tank", note: "Potable water contact" },
      { id: "terrace", label: "Terrace", note: "UV exposed horizontal surface" },
    ],
    products: [
      {
        id: "hir-base-coat",
        name: "HIR Base Coat",
        summary: "Polymer based high-bonding primer applied before the waterproof top coat.",
        coverageSqftPerKg: 30,
        coverageLabel: "1 KG = 30 sq.ft",
        coats: 2,
        packSizesKg: [1, 5],
      },
      {
        id: "hir-super-coat",
        name: "HIR Super Coat",
        summary: "Two-component elastomeric cementitious waterproof membrane.",
        coverageSqftPerKg: 10,
        coverageLabel: "3 KG = 30 sq.ft",
        coats: 2,
        packSizesKg: [5, 15, 20],
      },
      {
        id: "hir-nero-coat",
        name: "HIR Nero Coat",
        summary: "SBR copolymer based protective top coat applied over Super Coat.",
        coverageSqftPerKg: 30,
        coverageLabel: "1 KG = 30 sq.ft",
        coats: 2,
        packSizesKg: [1, 5],
      },
    ],
  },
  {
    id: "over-surface",
    label: "Over Existing Surface",
    fieldLabel: "Waterproofing Over",
    areas: [
      { id: "rcc-terrace", label: "RCC Terrace", note: "Exposed concrete roof slab" },
      { id: "mosaic-tiles", label: "Mosaic Tiles", note: "Existing tiled terrace surface" },
      { id: "steel-shed", label: "Steel Shed", note: "Metal roofing sheets and joints" },
      { id: "cement-shed", label: "Cement Shed", note: "Fibre / cement sheet roofing" },
    ],
    products: [
      {
        id: "hir-base-coat-os",
        name: "HIR Base Coat",
        summary: "Universal bonding primer for concrete, tiles and steel substrates.",
        coverageSqftPerKg: 30,
        coverageLabel: "1 KG = 30 sq.ft",
        coats: 2,
        packSizesKg: [1, 5],
      },
      {
        id: "hir-heat-x",
        name: "HIR Heat X",
        summary: "Heat reflective elastomeric waterproof coating for exposed roofs.",
        coverageSqftPerKg: 30,
        coverageLabel: "1 KG = 30 sq.ft",
        coats: 2,
        packSizesKg: [1, 5, 20],
      },
      {
        id: "hir-pu-heat-x",
        name: "HIR PU Heat X",
        summary: "Polyurethane heat reflective coating with superior UV and crack bridging.",
        coverageSqftPerKg: 30,
        coverageLabel: "1 KG = 30 sq.ft",
        coats: 2,
        packSizesKg: [1, 5, 20],
      },
    ],
  },
];

export const WATERPROOFING_WASTAGE_FACTOR = 0.05;
export const DEFAULT_COATS = 2;
