export type RoomCategory =
  | "Living Room"
  | "Bedroom"
  | "Kitchen"
  | "Bathroom"
  | "Balcony";

export type Point = [number, number];

export type RoomPolygon = {
  size: [number, number];
  points: Point[];
  pixelsPerMeter: number;
  /** Real floor width in meters (front edge). Overrides pixelsPerMeter-based estimate. */
  widthMeters?: number;
  /** Real floor depth in meters (front-to-back). Required for correct tile counts;
   *  image side length is foreshortened and cannot be used directly. */
  depthMeters?: number;
};


export type RoomMetadata = {
  id: string;
  name: string;
  category: RoomCategory;
  defaultTileSize: TileSizeId;
  lightingHint: string;
};

export type RoomAssets = {
  id: string;
  name: string;
  category: RoomCategory;
  image: HTMLImageElement;
  polygon: RoomPolygon;
  metadata: RoomMetadata;
};

export type TileSizeId =
  | "300x300"
  | "600x600"
  | "600x1200"
  | "800x800"
  | "1000x1000"
  | "custom";

export type TileSize = {
  id: TileSizeId;
  label: string;
  widthMm: number;
  heightMm: number;
};

export type TilePreset = {
  id: string;
  name: string;
  swatch: string;
  textureUrl: string;
  traits: {
    lightness: number; // 0..1
    warmth: number; // -1..1
    pattern: "solid" | "veined" | "grained" | "stone" | "wood";
    gloss: number; // 0..1
    maintenance: number; // 0..1 (higher = easier)
  };
};

export type EpoxyColor = {
  id: string;
  name: string;
  hex: string;
};

export type GroutFinish = "Matte" | "Semi Gloss" | "Gloss";

export type CustomTile = {
  dataUrl: string; // seamless tileable data URL
  name: string;
};

export type Design = {
  id: string;
  createdAt: number;
  roomId: string;
  tilePresetId: string | null;
  customTile: CustomTile | null;
  tileSize: TileSizeId;
  customTileSizeMm?: [number, number];
  epoxyId: string;
  groutMm: number;
  groutFinish: GroutFinish;
  thumbDataUrl?: string;
};

export type ConsultantScores = {
  designScore: number;
  luxury: number;
  modern: number;
  hotel: number;
  maintenance: number;
  family: number;
  reasons: Record<string, string>;
};
