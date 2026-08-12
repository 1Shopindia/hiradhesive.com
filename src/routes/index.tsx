import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { faqs, testimonials } from "@/lib/site-data";
import { usePublicProducts, usePublicBlogs } from "@/lib/content-store";
import { categoryList, type CategoryInfo } from "@/lib/categories";
import { CTASection } from "@/components/CTASection";
import { CinematicHero } from "@/components/CinematicHero";
import { ProductCard } from "@/components/ProductCard";
import {
  Reveal, StaggerGroup, staggerItem, SectionHeading, Counter, ImageReveal, Magnetic,
} from "@/components/Reveal";
import { buildMeta, canonicalLinks, jsonLdScript, faqSchema } from "@/lib/seo";
import { Building2 } from "lucide-react";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: buildMeta({
      title: "HIR Industries — Tile Adhesive & Grout Manufacturer",
      description: "Leading manufacturer of tile adhesives, epoxy grouts and waterproofing systems since 1972. German-American-Japanese technology. Serving 18+ countries. 500+ products.",
      path: "/",
      keywords: [
        "tile adhesive manufacturer", "epoxy grout manufacturer", "waterproofing chemicals",
        "construction chemicals India", "C2 tile adhesive", "wall putty", "block jointer",
        "industrial flooring", "HIR Industries", "Your Building Master",
      ],
    }),
    links: [
      ...canonicalLinks("/"),
      { rel: "preload", as: "image", href: "/images/hir-logo.png" },
    ],
    scripts: [
      jsonLdScript(faqSchema(faqs.map(f => ({ q: f.q, a: f.a })))),
    ],
  }),
  component: HomePage,
});

const WHY = [
  { img: "/images/07e233ae-d275-4f73-b5fc-3b286f52dc12.jpg", title: "Quality Materials", desc: "Tile adhesives, epoxy grout, waterproofing and paints crafted with cutting-edge German–American–Japanese technology." },
  { img: "/images/f15fd9eb-6adc-4c63-a2ea-d56826774ee1.jpg", title: "Expert Team", desc: "Product selection, application process or technical queries — our specialists are always one call away." },
  { img: "/images/037a9458-e3e9-4c08-b8ed-8892c46bbb7a.jpg", title: "Timely Delivery", desc: "A state-of-the-art manufacturing unit engineered for consistent quality and on-time despatch." },
  { img: "/images/1ec67c6b-a27b-491f-84b9-8d3b61e1e376.jpg", title: "24/7 Support", desc: "Nationwide service through our distributor network, with round-the-clock technical support." },
];

const APPLICATIONS = [
  { title: "Residential", desc: "Homes, apartments and villas — floors, walls, bathrooms and terraces." },
  { title: "Commercial", desc: "Malls, offices and hospitality projects with large-format tiling." },
  { title: "Industrial", desc: "Warehouses and plants demanding chemical and abrasion resistance." },
  { title: "Infrastructure", desc: "Water tanks, basements and structures needing total waterproofing." },
];

const CERTS = ["ISO Certified", "ISI Certified", "Food Grade Certified", "US-FDA Tested", "Green Building Compliant", "UV Resistant Range"];

function HomePage() {
  const [selected, setSelected] = useState<CategoryInfo | null>(null);
  const products = usePublicProducts();
  const blogs = usePublicBlogs();
  const list = selected ? products.filter(p => p.category === selected.key) : [];
  const featured = products.slice(0, 6);

  return (
    <div className="overflow-hidden">
      <CinematicHero />

      {/* ============ Categories — bento grid ============ */}
      <section className="max-w-7xl mx-auto px-0 py-24 md:py-32">
        <SectionHeading
          eyebrow="Our Range"
          title={<>Solutions for every <span className="text-gradient-brand">surface</span></>}
          subtitle="Nine categories, 500+ formulations. Choose a category to explore the full range inside it."
        />

        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div
              key="bento"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 lg:auto-rows-[16rem]"
            >
              {categoryList.map((c, i) => {
                const count = products.filter(p => p.category === c.key).length;
                const span = i === 0 ? "lg:col-span-2 lg:row-span-2" : i === 3 ? "lg:col-span-2" : "";
                return (
                  <motion.button
                    key={c.key}
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ delay: i * 0.07, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => setSelected(c)}
                    aria-label={`Open ${c.title} category — ${count} products`}
                    className={`group relative overflow-hidden rounded-3xl text-left min-h-[16rem] media-zoom shadow-soft hover:shadow-luxe transition-shadow duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${span}`}
                  >
                    <img src={c.photo} alt={c.title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                    <span className="absolute inset-0 bg-gradient-to-t from-[#0d0f2b]/92 via-[#0d0f2b]/35 to-transparent transition-opacity duration-500 group-hover:from-[#0d0f2b]/95" />
                    <span className="absolute right-5 top-5 rounded-full glass-dark px-3 py-1 text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-white/85">
                      {count} items
                    </span>
                    <span className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                      <span className={`block font-display font-bold text-white ${i === 0 ? "text-2xl md:text-4xl" : "text-xl md:text-2xl"}`}>
                        {c.title}
                      </span>
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
            <motion.div
              key={selected.key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-14"
            >
              <button onClick={() => setSelected(null)} className="btn-luxe btn-luxe-ghost mb-8 min-h-11 px-5 py-2 text-sm">
                ← All Categories
              </button>

              <div className="card-modern card-gradient-border grid md:grid-cols-[0.9fr_1.4fr] gap-10 items-center p-7 md:p-12 mb-12 shadow-soft">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-secondary via-white to-secondary/40 flex items-center justify-center p-10">
                  <img src={selected.image} alt={selected.title} className="max-h-full object-contain drop-shadow-[0_22px_36px_rgba(13,15,43,0.2)]" />
                </div>
                <div>
                  <span className="eyebrow">Category</span>
                  <h3 className="mt-4 text-3xl md:text-5xl font-bold">{selected.title}</h3>
                  <p className="mt-4 text-lg font-medium text-brand">{selected.tagline}</p>
                  <p className="mt-4 text-muted-foreground leading-relaxed">{selected.description}</p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((p, i) => (
                  <ProductCard key={p.slug} product={p} index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ============ Why HIR ============ */}
      <section className="relative bg-secondary/50 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-0">
          <SectionHeading
            eyebrow="Why Choose HIR"
            title={<>Built on precision, <span className="text-gradient-brand">proven in the field</span></>}
            subtitle="Every formulation is developed in-house, tested against Indian and European standards, and backed by people who know construction."
          />
          <StaggerGroup className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(c => (
              <motion.article
                key={c.title}
                variants={staggerItem}
                className="card-modern card-modern-hover card-gradient-border overflow-hidden bg-white"
              >
                <div className="media-zoom">
                  <img src={c.img} alt={c.title} loading="lazy" decoding="async" className="h-52 w-full object-cover" />
                </div>
                <div className="p-7">
                  <h3 className="font-display text-lg font-bold">{c.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                </div>
              </motion.article>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ============ Applications ============ */}
      <section className="max-w-7xl mx-auto px-0 py-24 md:py-32">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] items-center">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Applications"
              title={<>From a single bathroom to <span className="text-gradient-brand">an entire skyline</span></>}
              subtitle="HIR systems are specified across every scale of construction — engineered for the substrate, the climate and the finish."
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {APPLICATIONS.map((a, i) => (
                <Reveal key={a.title} delay={i * 0.07} className="card-modern card-modern-hover p-6">
                  <p className="font-display text-base font-bold">{a.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal direction="scale" className="relative overflow-hidden rounded-3xl shadow-luxe">
            <img
              src="/images/applications-tiler.jpg"
              alt="HIR tile adhesive and grout being applied on site by a professional tiler"
              loading="lazy"
              decoding="async"
              className="h-[380px] w-full object-cover md:h-[520px] lg:h-[600px]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4 rounded-2xl bg-white/90 p-5 backdrop-blur md:left-8 md:right-8">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
                <Building2 className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-sm font-bold">Residential to high-rise</p>
                <p className="text-xs text-muted-foreground">Certified systems for every substrate &amp; climate.</p>
              </div>
            </div>
          </Reveal>


        </div>
      </section>

      {/* ============ Visualizer CTA ============ */}
      <section className="max-w-7xl mx-auto px-0 pb-24 md:pb-32">
        <Reveal direction="scale" className="relative overflow-hidden rounded-[2rem] gradient-ink text-white p-10 md:p-16">
          <div aria-hidden="true" className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-brand/30 blur-[110px]" />
          <div className="relative grid gap-8 md:grid-cols-[1.3fr_1fr] items-center">
            <div>
              <span className="eyebrow text-brand">Tile & Epoxy Visualizer</span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold text-white">See it before you lay it.</h2>
              <p className="mt-4 max-w-xl text-white/70 leading-relaxed">
                Preview tiles and epoxy grout shades on real rooms, adjust the joint thickness and share the result with
                your client — all in your browser.
              </p>
            </div>
            <div className="flex md:justify-end">
              <Magnetic>
                <Link to="/visualizer" className="btn-luxe btn-luxe-primary">Open Visualizer</Link>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ Featured products ============ */}
      {featured.length > 0 && (
        <section className="bg-secondary/50 py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-0">
            <SectionHeading
              eyebrow="Featured"
              title={<>Signature <span className="text-gradient-brand">products</span></>}
              subtitle="A selection of the formulations our dealers and applicators reach for most."
            />
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
            </div>
            <div className="mt-12 text-center">
              <Link to="/products" className="btn-luxe btn-luxe-ink">View Full Catalogue</Link>
            </div>
          </div>
        </section>
      )}

      {/* ============ Statistics ============ */}
      <section className="max-w-7xl mx-auto px-0 py-24 md:py-28">
        <StaggerGroup className="grid gap-6 grid-cols-2 lg:grid-cols-4">
          {[
            { to: 50, suffix: "+", label: "Years of experience" },
            { to: 500, suffix: "+", label: "Products in range" },
            { to: 18, suffix: "+", label: "Countries served" },
            { to: 200, suffix: "+", label: "Projects delivered" },
          ].map(s => (
            <motion.div key={s.label} variants={staggerItem} className="card-modern card-modern-hover p-8 text-center">
              <p className="font-display text-4xl md:text-5xl font-bold text-gradient-brand">
                <Counter to={s.to} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </StaggerGroup>
      </section>

      {/* ============ Manufacturing / technology ============ */}
      <section className="relative overflow-hidden bg-secondary/50 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-0">
          <SectionHeading
            eyebrow="Manufacturing"
            title={<>World-class <span className="text-gradient-brand">technology</span></>}
            subtitle="Our plant blends Indian, American, German and Japanese process technology to hold every batch to the same specification."
          />
          <StaggerGroup className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { img: "/images/india.png", country: "India", tech: "Indian Technology" },
              { img: "/images/america.png", country: "America", tech: "American Technology" },
              { img: "/images/germany.png", country: "Germany", tech: "German Technology" },
              { img: "/images/japan.png", country: "Japan", tech: "Japanese Technology" },
            ].map(t => (
              <motion.div
                key={t.country}
                variants={staggerItem}
                className="card-modern card-modern-hover card-gradient-border bg-white p-12 text-center"
              >
                <img src={t.img} alt={`${t.country} technology`} loading="lazy" className="mx-auto mb-6 h-20 object-contain" />
                <h3 className="font-display text-2xl font-bold">{t.country}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.tech}</p>
              </motion.div>
            ))}
          </StaggerGroup>

          <Reveal className="mt-14 flex flex-wrap justify-center gap-3">
            {CERTS.map(c => (
              <span key={c} className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium text-muted-foreground shadow-soft">
                {c}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ============ Testimonials ============ */}
      <section className="max-w-7xl mx-auto px-0 py-24 md:py-32">
        <SectionHeading
          eyebrow="Testimonials"
          title={<>What our <span className="text-gradient-brand">clients say</span></>}
          subtitle="Dealers, builders and applicators on working with HIR products every day."
        />
        <StaggerGroup className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map(t => (
            <motion.div key={t.videoId} variants={staggerItem} className="card-modern card-modern-hover overflow-hidden">
              <div className="aspect-video bg-ink">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${t.videoId}`}
                  title={t.title}
                  allowFullScreen
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              <div className="p-6"><p className="text-sm font-medium leading-relaxed">{t.title}</p></div>
            </motion.div>
          ))}
        </StaggerGroup>
      </section>

      {/* ============ Blogs ============ */}
      {blogs.length > 0 && (
        <section className="bg-secondary/50 py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-0">
            <SectionHeading
              eyebrow="Knowledge"
              title={<>Insights from the <span className="text-gradient-brand">technical desk</span></>}
              subtitle="Application guides, product chemistry and best practices from the people who formulate them."
            />
            <StaggerGroup className="mt-16 grid gap-6 md:grid-cols-3">
              {blogs.slice(0, 3).map(b => (
                <motion.article key={b.slug} variants={staggerItem} className="card-modern card-modern-hover card-gradient-border overflow-hidden group">
                  <Link to="/blogs/$slug" params={{ slug: b.slug }} className="block">
                    <div className="media-zoom">
                      {b.image && <img src={b.image} alt={b.title} loading="lazy" decoding="async" className="h-56 w-full object-cover" />}
                    </div>
                    <div className="p-7">
                      <h3 className="font-display text-lg font-bold leading-snug transition-colors group-hover:text-brand">{b.title}</h3>
                      <p className="mt-2.5 line-clamp-2 text-sm text-muted-foreground leading-relaxed">{b.excerpt ?? ""}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand transition-transform duration-500 group-hover:translate-x-1.5">
                        Read Article <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </StaggerGroup>
            <div className="mt-12 text-center">
              <Link to="/blogs" className="btn-luxe btn-luxe-ghost">All Articles</Link>
            </div>
          </div>
        </section>
      )}

      {/* ============ Dealer network ============ */}
      <section className="max-w-7xl mx-auto px-0 py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Dealer Network"
              title={<>Partner with <span className="text-gradient-brand">HIR</span></>}
              subtitle="Join a distributor network spanning 18+ countries, with technical training, marketing support and round-the-clock service."
            />
            <div className="mt-10 flex flex-wrap gap-4">
              <Magnetic>
                <Link to="/contact" className="btn-luxe btn-luxe-primary">Become a Dealer</Link>
              </Magnetic>
              <Link to="/about" className="btn-luxe btn-luxe-ghost">About HIR</Link>
            </div>
          </div>
          <StaggerGroup className="grid grid-cols-2 gap-5">
            {[
              { n: "Pan-India", d: "Distributor coverage" },
              { n: "18+", d: "Export markets" },
              { n: "On-site", d: "Application training" },
              { n: "24/7", d: "Technical helpline" },
            ].map(x => (
              <motion.div key={x.d} variants={staggerItem} className="card-modern card-modern-hover p-7">
                <p className="font-display text-2xl font-bold text-gradient-ink">{x.n}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{x.d}</p>
              </motion.div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ============ FAQs ============ */}
      <section className="bg-secondary/50 py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4">
          <SectionHeading
            eyebrow="Support"
            title={<>Frequently asked <span className="text-gradient-brand">questions</span></>}
            subtitle="Answers on tile adhesives, epoxy grouts and waterproofing systems."
          />
          <StaggerGroup className="mt-14 space-y-3" stagger={0.05}>
            {faqs.map((f, i) => (
              <motion.details
                key={i}
                variants={staggerItem}
                className="card-modern bg-white p-6 group hover:border-brand/40 hover:shadow-soft transition-all"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-semibold">
                  <span>{f.q}</span>
                  <span aria-hidden="true" className="shrink-0 text-2xl text-brand transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </motion.details>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
