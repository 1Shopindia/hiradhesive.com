import { EPOXIES } from "../data/epoxies";
import { TILE_PRESETS, getTilePreset } from "../data/tiles";
import { TILE_SIZES } from "../data/tileSizes";
import type {
  ConsultantScores,
  EpoxyColor,
  RoomCategory,
  TilePreset,
  TileSizeId,
} from "../types";

// Deterministic, rule-based interior consultant. No LLM — every score is
// explainable and reproducible. EXTENSION: swap this module for an LLM call
// when a paid tier is desired.

export type ConsultantInput = {
  roomCategory: RoomCategory;
  tile: TilePreset;
  tileSize: TileSizeId;
  epoxy: EpoxyColor;
  groutMm: number;
};

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function contrast(a: number, b: number): number {
  return Math.abs(a - b);
}

function hexToLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function score(input: ConsultantInput): ConsultantScores {
  const { tile, epoxy, roomCategory, tileSize, groutMm } = input;
  const epoxyL = hexToLuminance(epoxy.hex);
  const tileL = tile.traits.lightness;

  // Luxury: high gloss, veined/marble patterns, subtle grout contrast.
  const luxury = clamp01(
    tile.traits.gloss * 0.5 +
      (tile.traits.pattern === "veined" ? 0.35 : 0.1) +
      (1 - contrast(tileL, epoxyL)) * 0.15,
  );

  // Modern: large tiles, grey/black tones, low grout.
  const largeTile =
    tileSize === "800x800" || tileSize === "1000x1000" || tileSize === "600x1200"
      ? 1
      : 0.5;
  const modern = clamp01(
    largeTile * 0.35 +
      (tileL < 0.5 ? 0.35 : 0.15) +
      (groutMm <= 2 ? 0.3 : 0.1),
  );

  // Hotel: warm neutrals, marble, medium contrast grout.
  const hotel = clamp01(
    (tile.traits.pattern === "veined" ? 0.4 : 0.15) +
      (tile.traits.warmth > 0 ? 0.25 : 0.1) +
      (contrast(tileL, epoxyL) > 0.15 && contrast(tileL, epoxyL) < 0.5 ? 0.3 : 0.1),
  );

  // Maintenance: matte, high-maintenance trait, dark grout (hides dirt).
  const maintenance = clamp01(
    tile.traits.maintenance * 0.5 +
      (tile.traits.gloss < 0.4 ? 0.25 : 0.05) +
      (epoxyL < 0.5 ? 0.25 : 0.05),
  );

  // Family: matte, forgiving colors, grout contrast for slip readability.
  const family = clamp01(
    (tile.traits.gloss < 0.35 ? 0.35 : 0.1) +
      (tile.traits.pattern === "grained" || tile.traits.pattern === "stone" ? 0.3 : 0.15) +
      (contrast(tileL, epoxyL) > 0.2 ? 0.25 : 0.1),
  );

  // Design Score: weighted average by room category.
  const weights = weightsFor(roomCategory);
  const designScore = clamp01(
    luxury * weights.luxury +
      modern * weights.modern +
      hotel * weights.hotel +
      maintenance * weights.maintenance +
      family * weights.family,
  );

  const reasons: Record<string, string> = {
    designScore: `Balanced across ${roomCategory.toLowerCase()} priorities.`,
    luxury:
      tile.traits.pattern === "veined"
        ? `Marble veining lifts perceived luxury.`
        : `${tile.name} reads as premium without competing with the space.`,
    modern:
      largeTile === 1
        ? `Large-format tile keeps sight lines clean.`
        : `Smaller format — modern but busier.`,
    hotel:
      tile.traits.warmth > 0
        ? `Warm undertone matches hotel-style hospitality.`
        : `Cool palette — more editorial than resort.`,
    maintenance:
      epoxyL < 0.5
        ? `Darker grout hides everyday soiling.`
        : `Light grout demands regular cleaning.`,
    family:
      tile.traits.gloss < 0.35
        ? `Matte finish is slip-friendlier.`
        : `Glossy finish can be slick when wet.`,
  };

  return {
    designScore: Math.round(designScore * 100),
    luxury: Math.round(luxury * 100),
    modern: Math.round(modern * 100),
    hotel: Math.round(hotel * 100),
    maintenance: Math.round(maintenance * 100),
    family: Math.round(family * 100),
    reasons,
  };
}

function weightsFor(cat: RoomCategory) {
  switch (cat) {
    case "Living Room":
      return { luxury: 0.3, modern: 0.3, hotel: 0.2, maintenance: 0.1, family: 0.1 };
    case "Bedroom":
      return { luxury: 0.35, modern: 0.2, hotel: 0.25, maintenance: 0.1, family: 0.1 };
    case "Kitchen":
      return { luxury: 0.1, modern: 0.25, hotel: 0.1, maintenance: 0.35, family: 0.2 };
    case "Bathroom":
      return { luxury: 0.2, modern: 0.2, hotel: 0.15, maintenance: 0.3, family: 0.15 };
    case "Balcony":
      return { luxury: 0.15, modern: 0.25, hotel: 0.15, maintenance: 0.3, family: 0.15 };
  }
}

export type Recommendation = {
  tilePresetId: string;
  tileSize: TileSizeId;
  epoxyId: string;
  groutMm: number;
  reason: string;
  score: number;
};

export function bestRecommendation(
  roomCategory: RoomCategory,
): Recommendation {
  let best: Recommendation | null = null;
  for (const tile of TILE_PRESETS) {
    for (const size of TILE_SIZES.filter((s) => s.id !== "custom")) {
      for (const epoxy of EPOXIES) {
        for (const gm of [1, 2, 3]) {
          const s = score({
            roomCategory,
            tile,
            tileSize: size.id,
            epoxy,
            groutMm: gm,
          });
          if (!best || s.designScore > best.score) {
            best = {
              tilePresetId: tile.id,
              tileSize: size.id,
              epoxyId: epoxy.id,
              groutMm: gm,
              score: s.designScore,
              reason: `${tile.name} + ${epoxy.name} grout at ${size.label ?? size.id}. ${s.reasons.designScore}`,
            };
          }
        }
      }
    }
  }
  return best!;
}

export function scoreCurrent(
  roomCategory: RoomCategory,
  tilePresetId: string | null,
  tileSize: TileSizeId,
  epoxyId: string,
  groutMm: number,
): ConsultantScores | null {
  const tile = tilePresetId ? getTilePreset(tilePresetId) : null;
  const epoxy = EPOXIES.find((e) => e.id === epoxyId);
  if (!tile || !epoxy) return null;
  return score({ roomCategory, tile, tileSize, epoxy, groutMm });
}
