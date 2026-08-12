import { EPOXIES } from "../data/epoxies";
import { getTilePreset } from "../data/tiles";
import { TILE_SIZES } from "../data/tileSizes";
import type { Design } from "../types";

export type QuotePayload = {
  designId: string;
  roomId: string;
  tile: string;
  tileSize: string;
  epoxy: string;
  groutMm: number;
  groutFinish: string;
  createdAt: string;
};

export function buildQuotePayload(design: Design): QuotePayload {
  const tile = design.tilePresetId
    ? getTilePreset(design.tilePresetId)?.name ?? design.tilePresetId
    : design.customTile?.name ?? "Custom tile";
  const size =
    TILE_SIZES.find((s) => s.id === design.tileSize)?.label ?? design.tileSize;
  const epoxy = EPOXIES.find((e) => e.id === design.epoxyId)?.name ?? design.epoxyId;
  return {
    designId: design.id,
    roomId: design.roomId,
    tile,
    tileSize: size,
    epoxy,
    groutMm: design.groutMm,
    groutFinish: design.groutFinish,
    createdAt: new Date(design.createdAt).toISOString(),
  };
}

// EXTENSION: POST to a backend quote endpoint once a backend is available.
// For now, we open the user's mail client with a prefilled body.
export function sendQuote(
  kind: "Get Quote" | "Contact Dealer" | "Request Sample",
  design: Design,
  contact: { name: string; email: string; phone: string; notes?: string },
): void {
  const p = buildQuotePayload(design);
  const subject = `${kind} — HIR Design ${p.designId}`;
  const body = [
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    `Phone: ${contact.phone}`,
    "",
    `Room: ${p.roomId}`,
    `Tile: ${p.tile}`,
    `Tile size: ${p.tileSize}`,
    `Epoxy: ${p.epoxy}`,
    `Grout: ${p.groutMm} mm, ${p.groutFinish}`,
    `Design ID: ${p.designId}`,
    "",
    contact.notes ? `Notes: ${contact.notes}` : "",
  ].join("\n");
  const s = encodeURIComponent(subject);
  const b = encodeURIComponent(body);
  window.location.href = `mailto:sales@hir.example?subject=${s}&body=${b}`;
}
