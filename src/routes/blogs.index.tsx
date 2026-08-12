import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CTASection } from "@/components/CTASection";
import { Reveal, StaggerGroup, staggerItem } from "@/components/Reveal";
import { usePublicBlogs } from "@/lib/content-store";
import { buildMeta, canonicalLinks, jsonLdScript, breadcrumbSchema, SITE_URL, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/blogs/")({
  head: () => ({
    meta: buildMeta({
      title: "Construction Chemicals Blog | HIR Industries",
      description: "In-depth guides on tile adhesives, epoxy grouts, waterproofing and construction best practices — from HIR Industries' technical team.",
      path: "/blogs",
      keywords: ["tile adhesive guide", "epoxy grout guide", "waterproofing", "construction chemicals blog"],
    }),
    links: canonicalLinks("/blogs"),
    scripts: [
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "Blog",
        name: `${SITE_NAME} Blog`,
        url: `${SITE_URL}/blogs`,
        description: "Construction chemistry guides and best practices from HIR Industries.",
        publisher: { "@id": `${SITE_URL}/#organization` },
      }),
      jsonLdScript(breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blogs" },
      ])),
    ],
  }),
  component: BlogsPage,
});

function BlogsPage() {
  const blogs = usePublicBlogs();
  const [featured, ...rest] = blogs;

  return (
    <div className="overflow-hidden">
      <section className="relative overflow-hidden gradient-ink text-white py-28 md:py-36">
        <div aria-hidden="true" className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand/25 blur-[120px]" />
        <Reveal className="relative max-w-7xl mx-auto px-0 text-center">
          <span className="eyebrow text-brand">Knowledge Hub</span>
          <h1 className="mt-5 text-4xl md:text-[4rem] font-bold text-white leading-[1.03]">
            The HIR <span className="text-gradient-brand">Journal</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-white/70 leading-relaxed">
            In-depth guides on construction chemicals, application methods and site best practices.
          </p>
        </Reveal>
      </section>

      {featured && (
        <section className="max-w-7xl mx-auto px-0 py-16 md:py-24">
          <Reveal direction="scale">
            <Link
              to="/blogs/$slug"
              params={{ slug: featured.slug }}
              className="group grid gap-0 overflow-hidden rounded-[2rem] card-modern card-modern-hover lg:grid-cols-2"
            >
              <div className="media-zoom min-h-[18rem]">
                {featured.image && (
                  <img src={featured.image} alt={featured.title} loading="eager" decoding="async" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex flex-col justify-center p-8 md:p-14">
                <span className="eyebrow">Featured Article</span>
                <h2 className="mt-5 font-display text-2xl md:text-4xl font-bold leading-tight transition-colors group-hover:text-brand">
                  {featured.title}
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed line-clamp-4">{featured.excerpt}</p>
                <span className="mt-8 inline-flex items-center gap-2 font-semibold text-brand transition-transform duration-500 group-hover:translate-x-1.5">
                  Read Article <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {rest.length > 0 && (
        <StaggerGroup className="max-w-7xl mx-auto px-0 pb-24 grid gap-6 md:grid-cols-3">
          {rest.map(b => (
            <motion.article key={b.slug} variants={staggerItem} className="card-modern card-modern-hover card-gradient-border overflow-hidden group">
              <Link to="/blogs/$slug" params={{ slug: b.slug }} className="block">
                <div className="media-zoom">
                  {b.image && <img src={b.image} alt={b.title} loading="lazy" decoding="async" className="h-56 w-full object-cover" />}
                </div>
                <div className="p-7">
                  <h2 className="font-display text-lg font-bold leading-snug transition-colors group-hover:text-brand">{b.title}</h2>
                  <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{b.excerpt}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand transition-transform duration-500 group-hover:translate-x-1.5">
                    Read More <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </StaggerGroup>
      )}

      <CTASection />
    </div>
  );
}
