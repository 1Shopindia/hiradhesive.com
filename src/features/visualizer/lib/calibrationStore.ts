import type { Point } from "../types";

/**
 * Per-room floor calibration overrides. Users can adjust the 4 floor
 * corners for any built-in room and save them locally. If a room has
 * saved calibration it takes precedence over the polygon.json baked into
 * public/rooms/<id>/.
 *
 * Stored under a single localStorage key so it survives reloads and can
 * be inspected/exported from devtools.
 */
const KEY = "hir-visualizer:floor-calibration:v1";

export type FloorCalibration = {
  points: [Point, Point, Point, Point]; // [bl, br, tr, tl] in image px
  widthMeters?: number;
  depthMeters?: number;
  updatedAt: number;
};

type Store = Record<string, FloorCalibration>;

function read(): Store {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* quota — ignore, calibration is best-effort */
  }
}

export function getCalibration(roomId: string): FloorCalibration | null {
  return read()[roomId] ?? null;
}

export function saveCalibration(roomId: string, cal: FloorCalibration) {
  const s = read();
  s[roomId] = cal;
  write(s);
}

export function clearCalibration(roomId: string) {
  const s = read();
  delete s[roomId];
  write(s);
}

export function listCalibratedRooms(): string[] {
  return Object.keys(read());
}
