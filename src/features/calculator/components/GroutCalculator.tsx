import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Field, SegmentedControl, ValidationList, inputClass } from "./Field";
import { ResultCard } from "./ResultCard";
import {
  DEFAULT_SPECIFIC_GRAVITY,
  GROUT_PACKS,
  GROUT_SHADES,
  GROUT_WASTAGE_FACTOR,
} from "../config/grout";
import { calculateGrout } from "../lib/groutCalc";
import { AREA_UNITS, calculationId, unitShort, type AreaUnit, safeNumber } from "../lib/units";

export function GroutCalculator() {
  const [tileLengthMm, setTileLengthMm] = useState(600);
  const [tileWidthMm, setTileWidthMm] = useState(600);
  const [tileThicknessMm, setTileThicknessMm] = useState(10);
  const [jointWidthMm, setJointWidthMm] = useState(3);
  const [area, setArea] = useState(1000);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqft");
  const [specificGravity, setSpecificGravity] = useState(DEFAULT_SPECIFIC_GRAVITY);
  const [packKg, setPackKg] = useState(5);
  const [shadeId, setShadeId] = useState<string>("white");
  const [calcId, setCalcId] = useState("HIR-EPX-PENDING");
  useEffect(() => { setCalcId(calculationId("EPX")); }, []);

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!(tileLengthMm > 0) || !(tileWidthMm > 0)) e.push("Tile length and width must be greater than 0 mm.");
    if (!(tileThicknessMm > 0)) e.push("Tile thickness must be greater than 0 mm.");
    if (!(jointWidthMm > 0)) e.push("Joint width must be greater than 0 mm.");
    if (!(area > 0)) e.push("Total area must be greater than 0.");
    if (!(specificGravity > 0)) e.push("Specific gravity must be greater than 0.");
    return e;
  }, [tileLengthMm, tileWidthMm, tileThicknessMm, jointWidthMm, area, specificGravity]);

  const result = useMemo(
    () =>
      calculateGrout({
        tileLengthMm,
        tileWidthMm,
        tileThicknessMm,
        jointWidthMm,
        area,
        areaUnit,
        specificGravity,
        packKg,
        tileShadeId: shadeId,
      }),
    [tileLengthMm, tileWidthMm, tileThicknessMm, jointWidthMm, area, areaUnit, specificGravity, packKg, shadeId],
  );

  const unit = unitShort(areaUnit);
  const shade = GROUT_SHADES.find(s => s.id === shadeId);

  const inputRows = [
    { label: "Tile Size", value: `${tileLengthMm} × ${tileWidthMm} mm` },
    { label: "Tile Thickness", value: `${tileThicknessMm} mm` },
    { label: "Joint Width", value: `${jointWidthMm} mm` },
    { label: "Total Area", value: `${area} ${unit} (${result.areaM2} sq.m)` },
    { label: "Specific Gravity", value: String(specificGravity) },
    { label: "Pack Size", value: `${result.packKg} KG` },
    ...(shade ? [{ label: "Tile Colour Family", value: shade.label }] : []),
  ];

  const resultRows = [
    { label: "Consumption", value: `${result.consumptionKgPerM2} kg / sq.m` },
    { label: "Base Quantity", value: `${result.baseKg} KG` },
    { label: `Wastage (+${Math.round(GROUT_WASTAGE_FACTOR * 100)}%)`, value: `${result.wasteKg} KG` },
    { label: "Total Required", value: `${result.totalKg} KG` },
    { label: "Packs Required", value: `${result.packs} × ${result.packKg} KG` },
    { label: "Recommended Product", value: result.product.name },
    ...(result.shadeRecommendation ? [{ label: "Recommended Shade", value: result.shadeRecommendation }] : []),
  ];

  const recommendations = [
    `${result.product.name}: ${result.product.summary}`,
    ...(result.shadeRecommendation ? [`Suggested colour: ${result.shadeRecommendation}`] : []),
  ];

  return (
    <div className="grid lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-8 items-start">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-white border border-border rounded-2xl p-5 sm:p-7 shadow-soft"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-brand-blue">Epoxy Grout Consumption Calculator</h2>
        <p className="text-sm text-muted-foreground mt-2">Calculate grout quantity according to tile size.</p>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <Field label="Tile Length (mm)" htmlFor="gr-len">
            <input id="gr-len" type="number" min={1} inputMode="numeric" className={inputClass}
              value={tileLengthMm} onChange={e => setTileLengthMm(safeNumber(e.target.value))} />
          </Field>
          <Field label="Tile Width (mm)" htmlFor="gr-wid">
            <input id="gr-wid" type="number" min={1} inputMode="numeric" className={inputClass}
              value={tileWidthMm} onChange={e => setTileWidthMm(safeNumber(e.target.value))} />
          </Field>
          <Field label="Tile Thickness (mm)" htmlFor="gr-thk">
            <input id="gr-thk" type="number" min={1} step={0.5} inputMode="decimal" className={inputClass}
              value={tileThicknessMm} onChange={e => setTileThicknessMm(safeNumber(e.target.value))} />
          </Field>
          <Field label="Joint Width (mm)" htmlFor="gr-joint">
            <input id="gr-joint" type="number" min={0.5} step={0.5} inputMode="decimal" className={inputClass}
              value={jointWidthMm} onChange={e => setJointWidthMm(safeNumber(e.target.value))} />
          </Field>
          <Field label="Total Area" htmlFor="gr-area">
            <input id="gr-area" type="number" min={0} step={0.01} inputMode="decimal" className={inputClass}
              value={area} onChange={e => setArea(safeNumber(e.target.value))} />
          </Field>
          <Field label="Unit">
            <SegmentedControl
              ariaLabel="Grout area unit"
              value={areaUnit}
              onChange={setAreaUnit}
              options={AREA_UNITS.map(u => ({ id: u.id, label: u.label }))}
            />
          </Field>
          <Field label="Specific Gravity" htmlFor="gr-sg" hint={`Default ${DEFAULT_SPECIFIC_GRAVITY} — editable per product datasheet.`}>
            <input id="gr-sg" type="number" min={0.1} step={0.01} inputMode="decimal" className={inputClass}
              value={specificGravity} onChange={e => setSpecificGravity(safeNumber(e.target.value))} />
          </Field>
          <Field label="Pack Size" htmlFor="gr-pack">
            <select id="gr-pack" className={inputClass} value={packKg} onChange={e => setPackKg(safeNumber(e.target.value))}>
              {GROUT_PACKS.map(p => (
                <option key={p.id} value={p.kg}>{p.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue/70 mb-2">Tile Colour Family</p>
          <div className="flex flex-wrap gap-2">
            {GROUT_SHADES.map(s => (
              <button
                key={s.id}
                type="button"
                aria-pressed={s.id === shadeId}
                onClick={() => setShadeId(s.id)}
                className={`flex items-center gap-2 px-3 min-h-10 rounded-xl border text-xs font-medium transition ${
                  s.id === shadeId ? "border-brand bg-brand/10 text-brand-blue" : "border-border hover:border-brand/40"
                }`}
              >
                <span className="h-4 w-4 rounded-full border border-black/10" style={{ background: s.hex }} aria-hidden="true" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-secondary/50 border border-brand-blue/10 p-4">
          <p className="text-[0.68rem] uppercase tracking-wider font-semibold text-brand-blue/70">Formula Used</p>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-mono">
            ((L + W) × T × J) ÷ ((L + J) × (W + J)) × Specific Gravity
          </p>
        </div>

        <div className="mt-5">
          <ValidationList errors={errors} />
        </div>
      </motion.div>

      <ResultCard
        heading="Epoxy Grout Requirement"
        calcId={calcId}
        disabled={errors.length > 0}
        stats={[
          { label: "Area", value: `${area} ${unit}`, sub: `${result.areaM2} sq.m` },
          { label: "Consumption", value: `${result.consumptionKgPerM2}`, sub: "kg per sq.m" },
          { label: "Wastage", value: `${result.wasteKg} KG`, sub: `+${Math.round(GROUT_WASTAGE_FACTOR * 100)}%` },
          { label: "Total Quantity", value: `${result.totalKg} KG`, emphasis: true },
          { label: "Packs Required", value: `${result.packs} Packs`, sub: `${result.packKg} KG each`, emphasis: true },
          { label: "Product", value: result.product.name, sub: result.shadeRecommendation ?? undefined },
        ]}
        recommendations={recommendations}
        pdf={{
          title: "Epoxy Grout Consumption Estimate",
          calcId,
          inputs: inputRows,
          results: resultRows,
          recommendations,
          note: "Consumption is calculated using the standard grout formula and includes 2% wastage. Joint depth is assumed equal to tile thickness.",
        }}
        quoteMessage={`Quote request — Epoxy Grout (Ref ${calcId})\n${inputRows.map(r => `${r.label}: ${r.value}`).join("\n")}\n${resultRows.map(r => `${r.label}: ${r.value}`).join("\n")}`}
      />
    </div>
  );
}
