import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Share2, MessageSquareQuote, Check } from "lucide-react";
import type { PdfPayload } from "../lib/pdf";
import { downloadCalculationPdf } from "../lib/pdf";
import { toast } from "sonner";

export interface ResultStat {
  label: string;
  value: string;
  sub?: string;
  emphasis?: boolean;
}

export function ResultCard({
  heading,
  calcId,
  stats,
  recommendations,
  pdf,
  quoteMessage,
  disabled,
}: {
  heading: string;
  calcId: string;
  stats: ResultStat[];
  recommendations: string[];
  pdf: PdfPayload;
  quoteMessage: string;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [shared, setShared] = useState(false);

  const onPdf = async () => {
    setBusy(true);
    try {
      await downloadCalculationPdf(pdf);
    } catch (error) {
      console.error("[calculator] PDF export failed", error);
      toast.error("Couldn't generate the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const onShare = async () => {
    const text = `${heading} — HIR Material Calculator\n${stats.map(s => `${s.label}: ${s.value}`).join("\n")}\nRef: ${calcId}`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: heading, text, url });
        return;
      }
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        toast.error("Sharing isn't supported in this browser.");
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShared(true);
      setTimeout(() => setShared(false), 2200);
    } catch (error) {
      // AbortError = the user dismissed the native share sheet; not a failure.
      if ((error as { name?: string })?.name !== "AbortError") {
        console.error("[calculator] share failed", error);
        toast.error("Couldn't share these results.");
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl gradient-ink text-white p-6 sm:p-8 shadow-elegant"
    >
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-brand/25 blur-3xl"
      />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-brand font-semibold">Estimate Summary</p>
            <h3 className="text-xl sm:text-2xl font-bold mt-1">{heading}</h3>
          </div>
          <span className="text-[0.68rem] font-mono bg-white/10 border border-white/15 rounded-lg px-2.5 py-1.5">
            {calcId}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
          {stats.map(s => (
            <motion.div
              key={s.label}
              layout
              className={`rounded-xl p-4 border ${
                s.emphasis
                  ? "bg-brand/15 border-brand/40"
                  : "bg-white/[0.06] border-white/10"
              }`}
            >
              <p className="text-[0.68rem] uppercase tracking-wider text-white/55 font-semibold">{s.label}</p>
              <p className={`mt-1.5 font-bold leading-tight ${s.emphasis ? "text-2xl sm:text-3xl text-brand" : "text-lg sm:text-xl"}`}>
                {s.value}
              </p>
              {s.sub ? <p className="text-[0.7rem] text-white/50 mt-1">{s.sub}</p> : null}
            </motion.div>
          ))}
        </div>

        {recommendations.length > 0 && (
          <ul className="mt-5 space-y-1.5 text-sm text-white/75">
            {recommendations.map(r => (
              <li key={r} className="flex gap-2">
                <Check className="h-4 w-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-7">
          <button
            type="button"
            onClick={onPdf}
            disabled={disabled || busy}
            className="btn-luxe btn-luxe-primary text-sm px-6 py-3 min-h-12 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {busy ? "Preparing…" : "Download PDF"}
          </button>
          <button
            type="button"
            onClick={onShare}
            disabled={disabled}
            className="min-h-12 px-6 py-3 rounded-xl text-sm font-semibold bg-white/10 border border-white/20 hover:bg-white/15 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            {shared ? "Copied!" : "Share"}
          </button>
          <Link
            to="/contact"
            search={{ enquiry: quoteMessage }}
            className="min-h-12 px-6 py-3 rounded-xl text-sm font-semibold bg-white text-brand-blue hover:bg-white/90 transition flex items-center justify-center gap-2"
          >
            <MessageSquareQuote className="h-4 w-4" aria-hidden="true" />
            Get Instant Quote
          </Link>
        </div>

        <p className="text-[0.68rem] text-white/45 mt-4 leading-relaxed">
          Estimates are indicative and depend on substrate condition, workmanship and site wastage.
          Please confirm with an HIR technical representative before ordering.
        </p>
      </div>
    </motion.div>
  );
}
