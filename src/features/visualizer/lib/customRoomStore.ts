import type { RoomPolygon } from "../types";

// Persist uploaded rooms in localStorage. IndexedDB would be nicer but adds
// dependencies; a compressed data URL fits comfortably for a handful of
// rooms and keeps this MVP self-contained.
// EXTENSION: switch to IndexedDB for unlimited storage and blob support.

export type CustomRoom = {
  key: string;
  name: string;
  imageDataUrl: string;
  polygon: RoomPolygon;
  createdAt: number;
};

const KEY = "hir.customRooms";

export function loadCustomRooms(): CustomRoom[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomRoom[];
  } catch {
    return [];
  }
}

export function saveCustomRoom(r: CustomRoom): void {
  const list = loadCustomRooms();
  const next = [r, ...list.filter((x) => x.key !== r.key)].slice(0, 20);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore quota
  }
}

export function getCustomRoom(key: string): CustomRoom | undefined {
  return loadCustomRooms().find((r) => r.key === key);
}

export function deleteCustomRoom(key: string): void {
  const next = loadCustomRooms().filter((r) => r.key !== key);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}
