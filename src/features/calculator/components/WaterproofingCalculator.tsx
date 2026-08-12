import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Field, SegmentedControl, ValidationList, inputClass } from "./Field";
import { ResultCard } from "./ResultCard";
import {
  WATERPROOFING_SYSTEMS,
  WATERPROOFING_WASTAGE_FACTOR,
  type WaterproofingSystemId,
} from "../config/waterproofing";
import { calculateWaterproofing, getWaterproofingSystem } from "../lib/waterproofingCalc";
import { AREA_UNITS, calculationId, unitShort, type AreaUnit, safeNumber } from "../lib/units";

export function WaterproofingCalculator() {
  const [systemId, setSystemId] = useState<WaterproofingSystemId>("before-tiles");
  const [areaId, setAreaId] = useState<string>(WATERPROOFING_SYSTEMS[0].areas[0].id);
  const [area, setArea] = useState(1000);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqft");
  const [calcId, setCalcId] = useState("HIR-WPF-PENDING");
  useEffect(() => { setCalcId(calculationId("WPF")); }, []);

  const system = getWaterproofingSystem(systemId);

  const onSystemChange = (id: WaterproofingSystemId) => {
    setSystemId(id);
    setAreaId(getWaterproofingSystem(id).areas[0].id);
  };

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!(area > 0)) e.push("Total area must be greater than 0.");
    return e;
  }, [area]);

  const result = useMemo(
    () => calculateWaterproofing({ systemId, areaId, area, areaUnit }),
    [systemId, areaId, area, areaUnit],
  );

  const unit = unitShort(areaUnit);
  const primary = result.primary;

  const inputRows = [
    { label: "Waterproofing Type", value: system.label },
    { label: system.fieldLabel, value: result.areaLabel },
    { label: "Total Area", value: `${area} ${unit} (${result.areaSqft} sq.ft / ${result.areaM2} sq.m)` },
    { label: "Number of Coats", value: "2 (fixed)" },
  ];

  const resultRows = result.products.flatMap(p => [
    {
      label: p.product.name,
      value: `${p.product.coverageLabel} · ${p.coats} coats · ${p.totalKg} KG · ${p.packs} × ${p.packKg} KG`,
    },
  ]);

  const recommendations = result.products.map(
    p => `${p.product.name}: ${p.product.coverageLabel} — ${p.totalKg} KG (${p.packs} × ${p.packKg} KG pack)`,
  );

  return (
    <div className="grid lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-8 items-start">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-white border border-border rounded-2xl p-5 sm:p-7 shadow-soft"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-brand-blue">Waterproofing Consumption Calculator</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Estimate coating quantities for waterproofing before laying tiles or over an existing surface.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="sm:col-span-2">
            <Field label="Waterproofing Type">
              <SegmentedControl
                ariaLabel="Waterproofing system"
                value={systemId}
                onChange={onSystemChange}
                options={WATERPROOFING_SYSTEMS.map(s => ({ id: s.id, label: s.label }))}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label={system.fieldLabel} htmlFor="wp-area-type" hint={result.areaNote}>
              <select id="wp-area-type" className={inputClass} value={areaId}
                onChange={e => setAreaId(e.target.value)}>
                {system.areas.map(a => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Total Area" htmlFor="wp-area">
            <input id="wp-area" type="number" min={0} step={0.01} inputMode="decimal" className={inputClass}
              value={area} onChange={e => setArea(safeNumber(e.target.value))} />
          </Field>
          <Field label="Unit">
            <SegmentedControl
              ariaLabel="Waterproofing area unit"
              value={areaUnit}
              onChange={setAreaUnit}
              options={AREA_UNITS.map(u => ({ id: u.id, label: u.label }))}
            />
          </Field>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue/70">Recommended Products</h3>
          <div className="grid sm:grid-cols-3 gap-3 mt-3">
            {result.products.map(p => (
              <div key={p.product.id} className="rounded-xl border border-border bg-secondary/40 p-4">
                <p className="font-bold text-brand-blue leading-tight">{p.product.name}</p>
                <p className="text-[0.7rem] text-muted-foreground mt-1 leading-snug">{p.product.summary}</p>
                <dl className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Coverage</dt>
                    <dd className="font-semibold text-right">{p.product.coverageLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Coats</dt>
                    <dd className="font-semibold">{p.coats}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Required Qty</dt>
                    <dd className="font-semibold">{p.totalKg} KG</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Estimated Packs</dt>
                    <dd className="font-semibold">{p.packs} × {p.packKg} KG</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <ValidationList errors={errors} />
        </div>
      </motion.div>

      <ResultCard
        heading="Waterproofing Requirement"
        calcId={calcId}
        disabled={errors.length > 0}
        stats={[
          { label: "Area", value: `${area} ${unit}`, sub: `${result.areaSqft} sq.ft` },
          { label: system.fieldLabel, value: result.areaLabel },
          { label: "Coats", value: "2" },
          { label: primary.product.name, value: `${primary.totalKg} KG`, sub: `incl. ${Math.round(WATERPROOFING_WASTAGE_FACTOR * 100)}% wastage`, emphasis: true },
          { label: "Packs", value: `${primary.packs} Nos.`, sub: `${primary.packKg} KG each`, emphasis: true },
          { label: "Coverage", value: primary.product.coverageLabel },
        ]}
        recommendations={recommendations}
        pdf={{
          title: "Waterproofing Consumption Estimate",
          calcId,
          inputs: inputRows,
          results: resultRows,
          recommendations,
          note: "Coverage depends on surface porosity and texture. Rough or porous substrates may consume up to 20% more material. Quantities include 5% wastage and are rounded up to the nearest pack.",
        }}
        quoteMessage={`Quote request — Waterproofing (Ref ${calcId})\n${inputRows.map(r => `${r.label}: ${r.value}`).join("\n")}\n${resultRows.map(r => `${r.label}: ${r.value}`).join("\n")}`}
      />
    </div>
  );
}
