import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wider text-brand-blue/70">
        {label}
      </label>
      {children}
      {hint ? <p className="text-[0.7rem] text-muted-foreground leading-snug">{hint}</p> : null}
    </div>
  );
}

export const inputClass =
  "w-full min-h-11 border border-border bg-white px-3.5 py-2.5 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition";

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex gap-1 p-1 bg-secondary/60 rounded-xl">
      {options.map(o => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={`relative flex-1 min-h-10 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
              active ? "text-white" : "text-brand-blue/70 hover:text-brand-blue"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${ariaLabel}`}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="absolute inset-0 gradient-ink rounded-lg"
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ValidationList({ errors }: { errors: string[] }) {
  if (!errors.length) return null;
  return (
    <ul className="text-xs text-red-600 space-y-1 bg-red-50 border border-red-200 rounded-xl p-3">
      {errors.map(e => (
        <li key={e}>• {e}</li>
      ))}
    </ul>
  );
}
