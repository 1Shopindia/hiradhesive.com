import { useRef, useState } from "react";
import { EPOXIES } from "../../data/epoxies";
import { getTilePreset } from "../../data/tiles";
import { TILE_SIZES } from "../../data/tileSizes";
import { useRoomAssets } from "../../hooks/useRoomAssets";
import { downloadCanvas, exportPdf } from "../../lib/export";
import { buildQuotePayload, sendQuote } from "../../lib/quote";
import { buildShareUrl, copyLink, shareEmail, shareWhatsApp } from "../../lib/share";
import { useVisualizerStore } from "../../store";
import type { Design } from "../../types";
import { BeforeAfterSlider } from "../BeforeAfterSlider";
import { FloorCalibrator } from "../FloorCalibrator";
import { PreviewCanvas } from "../PreviewCanvas";
import { SavedDesigns } from "../SavedDesigns";
import { WizardShell } from "../WizardShell";

export function Step6Preview() {
  const roomId = useVisualizerStore((s) => s.roomId);
  const customRoomKey = useVisualizerStore((s) => s.customRoomKey);
  const [calibrationVersion, setCalibrationVersion] = useState(0);
  const { assets, loading, calibrated } = useRoomAssets({ roomId, customRoomKey, calibrationVersion });
  const state = useVisualizerStore();
  const addSaved = useVisualizerStore((s) => s.addSavedDesign);
  const containerRef = useRef<HTMLDivElement>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState<null | "Get Quote" | "Contact Dealer" | "Request Sample">(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [calibratorOpen, setCalibratorOpen] = useState(false);

  if (loading || !assets) return null;


  const buildDesign = (): Design => ({
    id: `d-${Date.now().toString(36)}`,
    createdAt: Date.now(),
    roomId: assets.id,
    tilePresetId: state.tilePresetId,
    customTile: state.customTile,
    tileSize: state.tileSize,
    customTileSizeMm: state.tileSize === "custom" ? state.customTileSizeMm : undefined,
    epoxyId: state.epoxyId,
    groutMm: state.groutMm,
    groutFinish: state.groutFinish,
  });

  const getFinalCanvas = () =>
    containerRef.current?.querySelector<HTMLCanvasElement>(
      "[aria-label='Room preview'] canvas",
    ) ?? null;

  const tileName = state.tilePresetId
    ? getTilePreset(state.tilePresetId)?.name
    : state.customTile?.name ?? "Custom tile";
  const sizeLabel = TILE_SIZES.find((s) => s.id === state.tileSize)?.label ?? state.tileSize;
  const epoxyName = EPOXIES.find((e) => e.id === state.epoxyId)?.name ?? state.epoxyId;

  const tileMm =
    state.tileSize === "custom"
      ? state.customTileSizeMm[0]
      : TILE_SIZES.find((s) => s.id === state.tileSize)?.widthMm ?? 600;

  return (
    <WizardShell title="Preview" subtitle="Live rendering. Every change reflects instantly.">
      {!calibrated && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          <span className="font-medium">No floor calibration for this room.</span>
          <span className="text-amber-800">
            Using the default polygon — floor edges may not match this photo exactly.
          </span>
          <button
            onClick={() => setCalibratorOpen(true)}
            className="ml-auto rounded-full bg-amber-900 px-3 py-1 text-xs text-white hover:bg-amber-800"
          >
            Calibrate now
          </button>
        </div>
      )}
      <div ref={containerRef} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {compareMode ? (
            <BeforeAfterSlider assets={assets} state={state} />
          ) : (
            <PreviewCanvas
              assets={assets}
              tilePresetId={state.tilePresetId}
              customTileDataUrl={state.customTile?.dataUrl ?? null}
              tileSize={state.tileSize}
              customTileSizeMm={state.customTileSizeMm}
              epoxyId={state.epoxyId}
              groutMm={state.groutMm}
              groutFinish={state.groutFinish}
              showGridDebug={showGrid}
            />
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCompareMode((v) => !v)}
              className="rounded-full bg-neutral-100 px-4 py-1.5 text-sm text-neutral-700 hover:bg-neutral-200"
            >
              {compareMode ? "Preview only" : "Compare Before / After"}
            </button>
            <button
              onClick={() => setShowGrid((v) => !v)}
              className={`rounded-full px-4 py-1.5 text-sm ${
                showGrid
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
              title="Overlay the projective tile grid to verify vanishing point"
            >
              {showGrid ? "Hide Tile Grid" : "Add Tile Grid Debug"}
            </button>
            <button
              onClick={() => setCalibratorOpen(true)}
              className="rounded-full bg-neutral-100 px-4 py-1.5 text-sm text-neutral-700 hover:bg-neutral-200"
              title="Drag 4 handles onto the real floor corners"
            >
              Create Calibration Markers
            </button>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => {
                  const c = getFinalCanvas();
                  if (!c) return;
                  const d = buildDesign();
                  d.thumbDataUrl = c.toDataURL("image/jpeg", 0.6);
                  addSaved(d);
                  setSavedMsg("Design saved.");
                  setTimeout(() => setSavedMsg(null), 1500);
                }}
                className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm text-white hover:bg-neutral-800"
              >
                Save Design
              </button>
              {savedMsg && <span className="text-xs text-neutral-500">{savedMsg}</span>}
            </div>
          </div>

        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-neutral-200 p-4">
            <h3 className="text-sm font-semibold text-neutral-900">Summary</h3>
            <dl className="mt-2 space-y-1 text-sm">
              <Row k="Room" v={assets.name} />
              <Row k="Tile" v={tileName ?? "—"} />
              <Row k="Size" v={sizeLabel} />
              <Row k="Epoxy" v={epoxyName} />
              <Row k="Grout" v={`${state.groutMm} mm · ${state.groutFinish}`} />
            </dl>
          </section>

          <section className="rounded-xl border border-neutral-200 p-4">
            <h3 className="text-sm font-semibold text-neutral-900">Export</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const c = getFinalCanvas();
                  if (c) downloadCanvas(c, "hir-design.png", "image/png");
                }}
                className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-200"
              >
                PNG
              </button>
              <button
                onClick={() => {
                  const c = getFinalCanvas();
                  if (c) downloadCanvas(c, "hir-design.jpg", "image/jpeg");
                }}
                className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-200"
              >
                JPEG
              </button>
              <button
                onClick={() => {
                  const c = getFinalCanvas();
                  if (c) exportPdf(c, buildQuotePayload(buildDesign()));
                }}
                className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-200"
              >
                PDF
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-neutral-200 p-4">
            <h3 className="text-sm font-semibold text-neutral-900">Share</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => shareWhatsApp("Check out my tile design", buildShareUrl(buildDesign()))}
                className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-200"
              >
                WhatsApp
              </button>
              <button
                onClick={() => shareEmail("My HIR Design", buildShareUrl(buildDesign()))}
                className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-200"
              >
                Email
              </button>
              <button
                onClick={async () => {
                  const ok = await copyLink(buildShareUrl(buildDesign()));
                  setSavedMsg(ok ? "Link copied." : "Copy failed.");
                  setTimeout(() => setSavedMsg(null), 1500);
                }}
                className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-200"
              >
                Copy Link
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-neutral-200 p-4">
            <h3 className="text-sm font-semibold text-neutral-900">Quote</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["Get Quote", "Contact Dealer", "Request Sample"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setQuoteOpen(k)}
                  className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs text-white hover:bg-neutral-800"
                >
                  {k}
                </button>
              ))}
            </div>
          </section>

          <SavedDesigns />
        </aside>
      </div>

      {quoteOpen && (
        <QuoteDialog
          kind={quoteOpen}
          onClose={() => setQuoteOpen(null)}
          onSubmit={(contact) => {
            sendQuote(quoteOpen, buildDesign(), contact);
            setQuoteOpen(null);
          }}
        />
      )}

      {calibratorOpen && (
        <FloorCalibrator
          assets={assets}
          tileMeters={tileMm / 1000}
          onClose={() => setCalibratorOpen(false)}
          onSaved={() => setCalibrationVersion((v) => v + 1)}
        />
      )}
    </WizardShell>
  );
}


function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-neutral-500">{k}</dt>
      <dd className="text-neutral-900">{v}</dd>
    </div>
  );
}

function QuoteDialog({
  kind,
  onClose,
  onSubmit,
}: {
  kind: string;
  onClose: () => void;
  onSubmit: (c: { name: string; email: string; phone: string; notes?: string }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold">{kind}</h4>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="space-y-3">
          {[
            { label: "Full name", v: name, s: setName, type: "text" },
            { label: "Email", v: email, s: setEmail, type: "email" },
            { label: "Phone", v: phone, s: setPhone, type: "tel" },
          ].map((f) => (
            <label key={f.label} className="block text-sm">
              <span className="mb-1 block text-neutral-600">{f.label}</span>
              <input
                type={f.type}
                value={f.v}
                onChange={(e) => f.s(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2"
              />
            </label>
          ))}
          <label className="block text-sm">
            <span className="mb-1 block text-neutral-600">Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-neutral-300 px-3 py-2"
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ name, email, phone, notes })}
            disabled={!name || !email}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
