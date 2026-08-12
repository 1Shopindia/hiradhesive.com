import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Field, SegmentedControl, ValidationList, inputClass } from "./Field";
import { ResultCard } from "./ResultCard";
import {
  ADHESIVE_GRADES,
  BACK_TILE_PRIMER,
  TILE_TYPES,
  TROWELS,
  WASTAGE_FACTOR,
  type Location,
  type Surface,
  type TileTypeId,
} from "../config/adhesive";
import { calculateAdhesive } from "../lib/adhesiveCalc";
import { AREA_UNITS, calculationId, unitShort, type AreaUnit, safeNumber } from "../lib/units";

export function AdhesiveCalculator() {
  const [tileType, setTileType] = useState<TileTypeId>("vitrified");
  const [tileLengthMm, setTileLengthMm] = useState(600);
  const [tileWidthMm, setTileWidthMm] = useState(600);
  const [tileThicknessMm, setTileThicknessMm] = useState(10);
  const [location, setLocation] = useState<Location>("indoor");
  const [surface, setSurface] = useState<Surface>("floor");
  const [area, setArea] = useState(1000);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqft");
  const [gradeOverrideId, setGradeOverrideId] = useState<string>("");
  const [bagSizeKg, setBagSizeKg] = useState<number | null>(null);
  const [calcId, setCalcId] = useState("HIR-ADH-PENDING");
  useEffect(() => { setCalcId(calculationId("ADH")); }, []);

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!(tileLengthMm > 0) || !(tileWidthMm > 0)) e.push("Tile length and width must be greater than 0 mm.");
    if (!(tileThicknessMm > 0)) e.push("Tile thickness must be greater than 0 mm.");
    if (!(area > 0)) e.push("Total area must be greater than 0.");
    if (tileLengthMm > 4000 || tileWidthMm > 4000) e.push("Tile dimensions above 4000 mm are not supported.");
    return e;
  }, [tileLengthMm, tileWidthMm, tileThicknessMm, area]);

  const valid = errors.length === 0;

  const result = useMemo(
    () =>
      calculateAdhesive({
        tileType,
        tileLengthMm,
        tileWidthMm,
        tileThicknessMm,
        location,
        surface,
        area,
        areaUnit,
        gradeOverrideId: gradeOverrideId || null,
        bagSizeKg,
      }),
    [tileType, tileLengthMm, tileWidthMm, tileThicknessMm, location, surface, area, areaUnit, gradeOverrideId, bagSizeKg],
  );

  const unit = unitShort(areaUnit);
  const tileCfg = TILE_TYPES.find(t => t.id === tileType)!;

  const inputRows = [
    { label: "Tile Type", value: tileCfg.label },
    { label: "Tile Size", value: `${tileLengthMm} × ${tileWidthMm} mm` },
    { label: "Tile Thickness", value: `${tileThicknessMm} mm` },
    { label: "Installation Area", value: location === "indoor" ? "Indoor" : "Outdoor" },
    { label: "Surface", value: surface === "floor" ? "Floor" : "Wall" },
    { label: "Total Area", value: `${area} ${unit} (${result.areaM2} sq.m)` },
    { label: "Application Thickness", value: `${result.bedThicknessMm} mm` },
  ];

  const resultRows = [
    { label: "Recommended Adhesive", value: `${result.grade.name} — ${result.grade.classification}` },
    { label: "Trowel Size", value: result.trowel.label },
    { label: "Coverage", value: `${result.coverageM2PerBag} sq.m per ${result.bagSizeKg} kg bag` },
    { label: "Consumption", value: `${result.consumptionKgPerM2} kg / sq.m` },
    { label: "Base Quantity", value: `${result.baseKg} KG` },
    { label: `Wastage (+${Math.round(WASTAGE_FACTOR * 100)}%)`, value: `${result.wasteKg} KG` },
    { label: "Total Required", value: `${result.totalKg} KG` },
    { label: "Bags Required", value: `${result.bags} × ${result.bagSizeKg} KG` },
  ];

  const recommendations = [
    `${result.grade.name}: ${result.grade.summary}`,
    `Trowel ${result.trowel.label} — ${result.trowel.description}`,
    ...(result.primerRecommended
      ? [`${BACK_TILE_PRIMER.name}: ${BACK_TILE_PRIMER.reason} Approx. ${result.primerLitres} L required.`]
      : []),
  ];

  return (
    <div className="grid lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-8 items-start">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-white border border-border rounded-2xl p-5 sm:p-7 shadow-soft"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-brand-blue">Tile Adhesive Consumption Calculator</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Calculate the approximate quantity of HIR Tile Adhesive required for your project.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="sm:col-span-2">
            <Field label="Tile Type" htmlFor="adh-tile-type" hint={tileCfg.note}>
              <select
                id="adh-tile-type"
                className={inputClass}
                value={tileType}
                onChange={e => setTileType(e.target.value as TileTypeId)}
              >
                {TILE_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Tile Length (mm)" htmlFor="adh-len">
            <input id="adh-len" type="number" min={1} inputMode="numeric" className={inputClass}
              value={tileLengthMm} onChange={e => setTileLengthMm(safeNumber(e.target.value))} />
          </Field>
          <Field label="Tile Width (mm)" htmlFor="adh-wid">
            <input id="adh-wid" type="number" min={1} inputMode="numeric" className={inputClass}
              value={tileWidthMm} onChange={e => setTileWidthMm(safeNumber(e.target.value))} />
          </Field>
          <Field label="Tile Thickness (mm)" htmlFor="adh-thk">
            <input id="adh-thk" type="number" min={1} step={0.5} inputMode="decimal" className={inputClass}
              value={tileThicknessMm} onChange={e => setTileThicknessMm(safeNumber(e.target.value))} />
          </Field>
          <Field label="Bag Size" htmlFor="adh-bag">
            <select id="adh-bag" className={inputClass} value={bagSizeKg ?? ""}
              onChange={e => setBagSizeKg(e.target.value ? safeNumber(e.target.value) : null)}>
              <option value="">Auto ({result.bagSizeKg} KG)</option>
              {result.grade.bagSizesKg.map(b => (
                <option key={b} value={b}>{b} KG</option>
              ))}
            </select>
          </Field>

          <Field label="Installation Area">
            <SegmentedControl
              ariaLabel="Installation area"
              value={location}
              onChange={setLocation}
              options={[{ id: "indoor", label: "Indoor" }, { id: "outdoor", label: "Outdoor" }]}
            />
          </Field>
          <Field label="Floor or Wall">
            <SegmentedControl
              ariaLabel="Surface"
              value={surface}
              onChange={setSurface}
              options={[{ id: "floor", label: "Floor" }, { id: "wall", label: "Wall" }]}
            />
          </Field>

          <Field label="Total Area" htmlFor="adh-area">
            <input id="adh-area" type="number" min={0} step={0.01} inputMode="decimal" className={inputClass}
              value={area} onChange={e => setArea(safeNumber(e.target.value))} />
          </Field>
          <Field label="Unit">
            <SegmentedControl
              ariaLabel="Area unit"
              value={areaUnit}
              onChange={setAreaUnit}
              options={AREA_UNITS.map(u => ({ id: u.id, label: u.label }))}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field
              label="Adhesive Grade"
              htmlFor="adh-grade"
              hint={result.gradeReason}
            >
              <select id="adh-grade" className={inputClass} value={gradeOverrideId}
                onChange={e => setGradeOverrideId(e.target.value)}>
                <option value="">Auto — {result.grade.name} (recommended)</option>
                {Object.values(ADHESIVE_GRADES).map(g => (
                  <option key={g.id} value={g.id}>{g.name} — {g.classification}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-6">
          <div className="rounded-xl border border-brand/25 bg-brand/5 p-4">
            <p className="text-[0.68rem] uppercase tracking-wider font-semibold text-brand">Application Thickness</p>
            <p className="text-2xl font-bold text-brand-blue mt-1">{result.bedThicknessMm} mm</p>
            <p className="text-[0.7rem] text-muted-foreground mt-1">Auto-calculated from tile type, size & exposure.</p>
          </div>
          <div className="rounded-xl border border-brand-blue/15 bg-secondary/50 p-4">
            <p className="text-[0.68rem] uppercase tracking-wider font-semibold text-brand-blue/70">Recommended Trowel</p>
            <p className="text-2xl font-bold text-brand-blue mt-1">{result.trowel.label}</p>
            <p className="text-[0.7rem] text-muted-foreground mt-1">{result.trowel.description}</p>
          </div>
        </div>

        <details className="mt-4 group">
          <summary className="cursor-pointer text-xs font-semibold text-brand-blue/70 hover:text-brand">
            Trowel size reference
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {TROWELS.map(t => (
              <li key={t.id}><span className="font-semibold text-brand-blue">{t.label}</span> — {t.description}</li>
            ))}
          </ul>
        </details>

        {result.primerRecommended && (
          <div className="mt-4 rounded-xl border border-brand/25 bg-brand/5 p-4">
            <p className="text-[0.68rem] uppercase tracking-wider font-semibold text-brand">Recommended Primer</p>
            <p className="text-base font-bold text-brand-blue mt-1">{BACK_TILE_PRIMER.name}</p>
            <p className="text-[0.72rem] text-muted-foreground mt-1">{BACK_TILE_PRIMER.reason}</p>
            <a
              href={BACK_TILE_PRIMER.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 rounded-xl bg-brand-blue text-white text-xs font-semibold px-4 py-2 hover:opacity-90 transition"
            >
              ▶ {BACK_TILE_PRIMER.videoLabel}
            </a>
          </div>
        )}

        <div className="mt-5">
          <ValidationList errors={errors} />
        </div>
      </motion.div>

      <ResultCard
        heading="Tile Adhesive Requirement"
        calcId={calcId}
        disabled={!valid}
        stats={[
          { label: "Area", value: `${area} ${unit}`, sub: `${result.areaM2} sq.m` },
          { label: "Adhesive Grade", value: result.grade.name, sub: result.grade.classification },
          { label: "Trowel Size", value: result.trowel.label },
          { label: "Coverage", value: `${result.coverageM2PerBag} sq.m`, sub: `per ${result.bagSizeKg} kg bag` },
          { label: "Total Quantity", value: `${result.totalKg} KG`, sub: `incl. ${Math.round(WASTAGE_FACTOR * 100)}% wastage`, emphasis: true },
          { label: "Bags Required", value: `${result.bags} Bags`, sub: `${result.bagSizeKg} KG each`, emphasis: true },
        ]}
        recommendations={recommendations}
        pdf={{
          title: "Tile Adhesive Consumption Estimate",
          calcId,
          inputs: inputRows,
          results: resultRows,
          recommendations,
          note: `Wastage of ${Math.round(WASTAGE_FACTOR * 100)}% is included in the total quantity. Actual consumption varies with substrate flatness, trowel technique and back-buttering.`,
        }}
        quoteMessage={`Quote request — Tile Adhesive (Ref ${calcId})\n${inputRows.map(r => `${r.label}: ${r.value}`).join("\n")}\n${resultRows.map(r => `${r.label}: ${r.value}`).join("\n")}`}
      />
    </div>
  );
}
