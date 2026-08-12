export type AreaUnit = "sqft" | "sqm";

export const AREA_UNITS: { id: AreaUnit; label: string; short: string }[] = [
  { id: "sqft", label: "Square Feet", short: "sq.ft" },
  { id: "sqm", label: "Square Meter", short: "sq.m" },
];

export const SQFT_PER_SQM = 10.7639;

export function toSquareMeters(value: number, unit: AreaUnit): number {
  return unit === "sqm" ? value : value / SQFT_PER_SQM;
}

export function fromSquareMeters(valueM2: number, unit: AreaUnit): number {
  return unit === "sqm" ? valueM2 : valueM2 * SQFT_PER_SQM;
}

export function round(value: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * f) / f;
}

export function unitShort(unit: AreaUnit): string {
  return unit === "sqm" ? "sq.m" : "sq.ft";
}

/** Deterministic-ish unique calculation reference. */
export function calculationId(prefix: string): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `HIR-${prefix}-${stamp}-${rand}`;
}

/**
 * Parses a form field into a finite number. Empty strings, "-", "1e999" and
 * other junk become the fallback so downstream maths never yields NaN/Infinity.
 */
export function safeNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(n) ? n : fallback;
}
