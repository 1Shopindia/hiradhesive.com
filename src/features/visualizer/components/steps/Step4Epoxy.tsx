import { EPOXIES } from "../../data/epoxies";
import type { GroutFinish } from "../../types";
import { useVisualizerStore } from "../../store";
import { WizardShell } from "../WizardShell";

const FINISHES: GroutFinish[] = ["Matte", "Semi Gloss", "Gloss"];

export function Step4Epoxy() {
  const epoxyId = useVisualizerStore((s) => s.epoxyId);
  const setEpoxy = useVisualizerStore((s) => s.setEpoxy);
  const groutMm = useVisualizerStore((s) => s.groutMm);
  const setGroutMm = useVisualizerStore((s) => s.setGroutMm);
  const groutFinish = useVisualizerStore((s) => s.groutFinish);
  const setGroutFinish = useVisualizerStore((s) => s.setGroutFinish);

  return (
    <WizardShell
      title="Choose Epoxy Grout"
      subtitle="Grout separates tiles — colour, thickness and finish all shape the final look."
    >
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {EPOXIES.map((e) => {
          const selected = epoxyId === e.id;
          return (
            <button
              key={e.id}
              onClick={() => setEpoxy(e.id)}
              className={[
                "flex flex-col items-center gap-2 rounded-xl border p-3 transition",
                selected
                  ? "border-neutral-900 ring-2 ring-neutral-900"
                  : "border-neutral-200 hover:border-neutral-400",
              ].join(" ")}
              aria-label={e.name}
            >
              <span
                className="block h-12 w-12 rounded-full border border-black/10 shadow-inner"
                style={{ background: e.hex }}
              />
              <span className="text-xs font-medium text-neutral-800">{e.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 rounded-xl border border-neutral-200 p-5 md:grid-cols-2">
        <div>
          <label className="mb-2 flex items-center justify-between text-sm font-medium text-neutral-800">
            <span>Grout thickness</span>
            <span className="text-neutral-500">{groutMm} mm</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={groutMm}
            onChange={(e) => setGroutMm(Number(e.target.value))}
            className="w-full"
            aria-label="Grout thickness"
          />
          <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
            <span>1 mm</span>
            <span>5 mm</span>
            <span>10 mm</span>
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium text-neutral-800">Finish</div>
          <div className="flex gap-2">
            {FINISHES.map((f) => (
              <button
                key={f}
                onClick={() => setGroutFinish(f)}
                className={[
                  "rounded-full px-4 py-1.5 text-sm transition",
                  groutFinish === f
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                ].join(" ")}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
    </WizardShell>
  );
}
