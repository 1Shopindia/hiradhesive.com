import { create } from "zustand";
import type {
  CustomTile,
  Design,
  GroutFinish,
  TileSizeId,
} from "./types";

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

type State = {
  step: WizardStep;
  roomId: string | null;
  customRoomKey: string | null; // key in IndexedDB / localStorage
  tileSize: TileSizeId;
  customTileSizeMm: [number, number];
  tilePresetId: string | null;
  customTile: CustomTile | null;
  epoxyId: string;
  groutMm: number;
  groutFinish: GroutFinish;
  savedDesigns: Design[];
};

type Actions = {
  setStep: (s: WizardStep) => void;
  next: () => void;
  back: () => void;
  setRoom: (id: string) => void;
  setCustomRoom: (key: string) => void;
  setTileSize: (id: TileSizeId) => void;
  setCustomTileSizeMm: (mm: [number, number]) => void;
  setTilePreset: (id: string) => void;
  setCustomTile: (t: CustomTile) => void;
  setEpoxy: (id: string) => void;
  setGroutMm: (mm: number) => void;
  setGroutFinish: (f: GroutFinish) => void;
  applyRecommendation: (r: Partial<State>) => void;
  addSavedDesign: (d: Design) => void;
  removeSavedDesign: (id: string) => void;
  hydrateSaved: (list: Design[]) => void;
};

export const useVisualizerStore = create<State & Actions>((set) => ({
  step: 1,
  roomId: null,
  customRoomKey: null,
  tileSize: "600x600",
  customTileSizeMm: [600, 600],
  tilePresetId: null,
  customTile: null,
  epoxyId: "white",
  groutMm: 2,
  groutFinish: "Matte",
  savedDesigns: [],

  setStep: (s) => set({ step: s }),
  next: () =>
    set((st) => ({ step: Math.min(6, st.step + 1) as WizardStep })),
  back: () =>
    set((st) => ({ step: Math.max(1, st.step - 1) as WizardStep })),

  setRoom: (id) => set({ roomId: id, customRoomKey: null }),
  setCustomRoom: (key) => set({ customRoomKey: key, roomId: null }),
  setTileSize: (id) => set({ tileSize: id }),
  setCustomTileSizeMm: (mm) => set({ customTileSizeMm: mm }),
  setTilePreset: (id) => set({ tilePresetId: id, customTile: null }),
  setCustomTile: (t) => set({ customTile: t, tilePresetId: null }),
  setEpoxy: (id) => set({ epoxyId: id }),
  setGroutMm: (mm) => set({ groutMm: mm }),
  setGroutFinish: (f) => set({ groutFinish: f }),
  applyRecommendation: (r) => set((st) => ({ ...st, ...r })),

  addSavedDesign: (d) =>
    set((st) => {
      const list = [d, ...st.savedDesigns].slice(0, 50);
      try {
        localStorage.setItem("hir.designs", JSON.stringify(list));
      } catch {
        // ignore quota errors
      }
      return { savedDesigns: list };
    }),
  removeSavedDesign: (id) =>
    set((st) => {
      const list = st.savedDesigns.filter((d) => d.id !== id);
      try {
        localStorage.setItem("hir.designs", JSON.stringify(list));
      } catch {
        // ignore
      }
      return { savedDesigns: list };
    }),
  hydrateSaved: (list) => set({ savedDesigns: list }),
}));

export function loadSavedDesigns(): Design[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("hir.designs");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Design[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
