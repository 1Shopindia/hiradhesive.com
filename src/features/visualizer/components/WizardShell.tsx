import { motion } from "framer-motion";
import { useVisualizerStore } from "../store";

const STEPS = [
  { n: 1, label: "Room" },
  { n: 2, label: "Size" },
  { n: 3, label: "Tile" },
  { n: 4, label: "Epoxy" },
  { n: 5, label: "AI Consultant" },
  { n: 6, label: "Preview" },
] as const;

type Props = {
  title: string;
  subtitle?: string;
  canProceed?: boolean;
  children: React.ReactNode;
};

export function WizardShell({ title, subtitle, canProceed = true, children }: Props) {
  const step = useVisualizerStore((s) => s.step);
  const next = useVisualizerStore((s) => s.next);
  const back = useVisualizerStore((s) => s.back);
  const setStep = useVisualizerStore((s) => s.setStep);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      {/* Progress */}
      <ol className="mb-6 flex flex-wrap items-center gap-2 md:gap-3">
        {STEPS.map((s) => {
          const active = s.n === step;
          const done = s.n < step;
          return (
            <li key={s.n} className="flex items-center gap-2">
              <button
                onClick={() => (done ? setStep(s.n as 1 | 2 | 3 | 4 | 5 | 6) : undefined)}
                disabled={!done}
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition",
                  active
                    ? "bg-neutral-900 text-white ring-4 ring-neutral-900/10"
                    : done
                    ? "bg-neutral-800 text-white hover:bg-neutral-700"
                    : "bg-neutral-200 text-neutral-500",
                ].join(" ")}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${s.n}: ${s.label}`}
              >
                {s.n}
              </button>
              <span
                className={[
                  "hidden text-sm md:inline",
                  active ? "font-semibold text-neutral-900" : "text-neutral-500",
                ].join(" ")}
              >
                {s.label}
              </span>
              {s.n < STEPS.length && (
                <span className="mx-1 hidden h-px w-6 bg-neutral-300 md:inline-block" />
              )}
            </li>
          );
        })}
      </ol>

      <motion.header
        key={title}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500 md:text-base">{subtitle}</p>}
      </motion.header>

      <motion.section
        key={step}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {children}
      </motion.section>

      {/* Nav */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          onClick={back}
          disabled={step === 1}
          className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-40"
        >
          Back
        </button>
        {step < 6 && (
          <button
            onClick={next}
            disabled={!canProceed}
            className="rounded-full bg-neutral-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-40"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
