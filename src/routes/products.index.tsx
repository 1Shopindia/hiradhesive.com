import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CTASection } from "@/components/CTASection";
import { Reveal } from "@/components/Reveal";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { CatalogueDownload } from "@/components/CatalogueDownload";
import { usePublicProducts } from "@/lib/content-store";
import { categoryList, type CategoryInfo } from "@/lib/categories";
import { products as seedProducts } from "@/lib/site-data";
import { buildMeta, canonicalLinks, jsonLdScript, breadcrumbSchema, itemListSchema, SITE_URL, SITE_NAME } from "@/lib/seo";


export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: buildMeta({
      title: "Construction Chemicals & Tile Adhesives | HIR Industries",
      description: "Explore HIR Industries' full catalogue: C1–C2TES2 tile adhesives, epoxy grouts, waterproofing membranes, wall putty and professional tools. Trusted globally across 18+ countries.",
      path: "/products",
      keywords: [
        "tile adhesive", "epoxy grout", "waterproofing chemicals", "construction chemicals",
        "tile adhesive manufacturer", "C2 tile adhesive", "wall putty", "industrial flooring",
        "HIR Industries products",
      ],
    }),
    links: canonicalLinks("/products"),
    scripts: [
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${SITE_NAME} — Product Catalogue`,
        url: `${SITE_URL}/products`,
        description: "Full product catalogue of tile adhesives, epoxy grouts, waterproofing and construction chemicals.",
      }),
      jsonLdScript(itemListSchema(
        seedProducts.map(p => ({ name: p.name, path: `/products/${p.slug}`, image: p.image ?? null })),
        "HIR Industries product catalogue",
      )),
      jsonLdScript(breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
      ])),
    ],

  }),
  component: ProductsPage,
});

type SortKey = "featured" | "az" | "za";

function ProductsPage() {
  const products = usePublicProducts();
  const [selected, setSelected] = useState<CategoryInfo | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");

  const loading = products.length === 0;

  const list = useMemo(() => {
    let out = selected ? products.filter(p => p.category === selected.key) : products;
    const q = query.trim().toLowerCase();
    if (q) out = out.filter(p => `${p.name} ${p.category} ${p.short ?? ""}`.toLowerCase().includes(q));
    
    // Sort based on selected option
    if (sort === "featured") {
      // Featured = sort by sort_order (lower numbers first)
      out = [...out].sort((a, b) => a.sort_order - b.sort_order);
    } else if (sort === "az") {
      out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "za") {
      out = [...out].sort((a, b) => b.name.localeCompare(a.name));
    }
    
    return out;
  }, [products, selected, query, sort]);

  const showGrid = Boolean(selected) || query.trim().length > 0;

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-ink text-white py-28 md:py-36">
        <div aria-hidden="true" className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-brand/25 blur-[120px]" />
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
        <Reveal className="relative max-w-7xl mx-auto px-0 text-center">
          <span className="eyebrow text-brand">Catalogue</span>
          <h1 className="mt-5 text-4xl md:text-[4rem] font-bold leading-[1.03] text-white">
            Tile adhesives, epoxy grouts &<br className="hidden md:block" />
            <span className="text-gradient-brand"> construction chemicals</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-white/70 leading-relaxed">
            Browse by category or search the full 500+ product range.
          </p>
          <div className="mt-8 flex justify-center">
            <CatalogueDownload variant="dark" />
          </div>
        </Reveal>
      </section>

      {/* Filter bar */}
      <div className="sticky top-[4.75rem] z-30 border-b border-border glass">
        <div className="max-w-7xl mx-auto px-0 py-4 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <label htmlFor="product-search" className="sr-only">Search products</label>
            <input
              id="product-search"
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, categories…"
              className="w-full min-h-12 rounded-full border border-border bg-white px-5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
            />
          </div>
          <div className="flex gap-3">
            <label htmlFor="product-sort" className="sr-only">Sort products</label>
            <select
              id="product-sort"
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="min-h-12 rounded-full border border-border bg-white px-5 text-sm focus:outline-none focus:border-brand transition"
            >
              <option value="featured">Featured</option>
              <option value="az">Name A–Z</option>
              <option value="za">Name Z–A</option>
            </select>
            {(selected || query) && (
              <button
                onClick={() => { setSelected(null); setQuery(""); }}
                className="btn-luxe btn-luxe-ghost min-h-12 px-5 py-2 text-sm"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-0 py-16 md:py-24">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!showGrid ? (
              <motion.div
                key="cats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[16rem]"
              >
                {categoryList.map((c, i) => {
                  const count = products.filter(p => p.category === c.key).length;
                  const span = i === 0 ? "lg:col-span-2 lg:row-span-2" : i === 3 ? "lg:col-span-2" : "";
                  return (
                    <motion.button
                      key={c.key}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => setSelected(c)}
                      aria-label={`Open ${c.title} category — ${count} products`}
                      className={`group relative min-h-[16rem] overflow-hidden rounded-3xl text-left media-zoom shadow-soft hover:shadow-luxe transition-shadow duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${span}`}
                    >
                      <img src={c.photo} alt={c.title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                      <span className="absolute inset-0 bg-gradient-to-t from-[#0d0f2b]/92 via-[#0d0f2b]/35 to-transparent" />
                      <span className="absolute right-5 top-5 rounded-full glass-dark px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/85">{count} items</span>
                      <span className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                        <span className={`block font-display font-bold text-white ${i === 0 ? "text-2xl md:text-4xl" : "text-xl md:text-2xl"}`}>{c.title}</span>
                        <span className="mt-2 block max-w-md text-sm text-white/65 line-clamp-2">{c.tagline}</span>
                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand transition-transform duration-500 group-hover:translate-x-1.5">
                          Explore Category <span aria-hidden="true">→</span>
                        </span>
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
                {selected && (
                  <div className="card-modern card-gradient-border mb-12 grid items-center gap-10 p-7 md:grid-cols-[0.9fr_1.4fr] md:p-12 shadow-soft">
                    <div className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-secondary via-white to-secondary/40 p-10">
                      <img src={selected.image} alt={selected.title} className="max-h-full object-contain drop-shadow-[0_22px_36px_rgba(13,15,43,0.2)]" />
                    </div>
                    <div>
                      <span className="eyebrow">Category</span>
                      <h2 className="mt-4 text-3xl md:text-5xl font-bold">{selected.title}</h2>
                      <p className="mt-4 text-lg font-medium text-brand">{selected.tagline}</p>
                      <p className="mt-4 leading-relaxed text-muted-foreground">{selected.description}</p>
                    </div>
                  </div>
                )}

                <div className="mb-8 flex items-center justify-between">
                  <h2 className="font-display text-2xl font-bold">{selected ? "Products in this category" : "Search results"}</h2>
                  <span className="text-sm text-muted-foreground">{list.length} items</span>
                </div>

                {list.length === 0 ? (
                  <p className="py-16 text-center text-muted-foreground">No products match your search.</p>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </section>

      <CTASection />
    </div>
  );
}
