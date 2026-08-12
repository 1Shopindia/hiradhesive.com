import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Magnetic } from "@/components/Reveal";

export function CTASection() {
  return (
    <section className="relative overflow-hidden gradient-ink text-white">
      <div aria-hidden="true" className="absolute inset-0 opacity-25">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-brand/60 blur-3xl" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />

      <div className="relative max-w-7xl mx-auto px-0 py-24 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow text-brand">
            <span className="h-px w-8 bg-brand inline-block" aria-hidden="true" />
            Let's build
          </span>
          <h2 className="mt-5 text-3xl sm:text-4xl md:text-[3.5rem] font-bold leading-[1.03] text-white">
            Find your home solution <span className="text-gradient-brand">with HIR.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-white/70 mb-9 text-base md:text-lg leading-relaxed max-w-xl">
            Backed by 50+ years of industry experience, HIR Industries manufactures and supplies 9 categories of
            construction chemicals across a 500+ product range — engineered for professionals who don't compromise.
          </p>
          <div className="flex flex-wrap gap-4">
            <Magnetic>
              <Link to="/contact" className="btn-luxe btn-luxe-primary">Contact Us</Link>
            </Magnetic>
            <Link
              to="/products"
              className="btn-luxe border border-white/25 bg-white/5 text-white hover:border-brand hover:text-brand"
            >
              Browse Products
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
