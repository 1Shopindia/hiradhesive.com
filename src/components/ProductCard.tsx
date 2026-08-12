import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export type CardProduct = {
  slug: string;
  name: string;
  image?: string | null;
  category: string;
  short?: string | null;
  
  pdf?: string | null;
};

/** Premium product card: large image, gradient border on hover, quick actions. */
export function ProductCard({ product, index = 0 }: { product: CardProduct; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-full"
    >
      <div className="card-modern card-modern-hover card-gradient-border h-full overflow-hidden flex flex-col">
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="block relative media-zoom bg-gradient-to-br from-secondary via-white to-secondary/60"
          aria-label={`View details for ${product.name}`}
        >
          <div className="aspect-[4/3] flex items-center justify-center p-8">
            {product.image
              ? <img src={product.image} alt={`${product.name} — ${product.category}`} loading="lazy" decoding="async" className="max-h-full w-auto object-contain drop-shadow-[0_18px_28px_rgba(13,15,43,0.18)]" />
              : <span className="text-sm text-muted-foreground">No image</span>}
          </div>
          <span className="absolute left-4 top-4 rounded-full glass px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brand-blue">
            {product.category}
          </span>
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </Link>

        <div className="flex flex-1 flex-col p-6 pt-4">
          <h3 className="font-display text-lg font-bold leading-snug transition-colors group-hover:text-brand">
            <Link to="/products/$slug" params={{ slug: product.slug }}>{product.name}</Link>
          </h3>
          {product.short && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{product.short}</p>
          )}
          

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
            <Link
              to="/products/$slug"
              params={{ slug: product.slug }}
              className="btn-luxe btn-luxe-primary min-h-10 px-5 py-2 text-sm"
            >
              View Details
            </Link>
            {product.pdf && (
              <a
                href={product.pdf}
                target="_blank"
                rel="noreferrer"
                className="btn-luxe btn-luxe-ghost min-h-10 px-5 py-2 text-sm"
              >
                Brochure
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card-modern h-full overflow-hidden">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="space-y-3 p-6">
        <div className="skeleton h-4 w-3/4 rounded-full" />
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-3 w-2/3 rounded-full" />
        <div className="skeleton h-10 w-32 rounded-full" />
      </div>
    </div>
  );
}
