import { createFileRoute, Link } from "@tanstack/react-router";
import { CTASection } from "@/components/CTASection";
import { usePublicProducts } from "@/lib/content-store";
import { products as seedProducts } from "@/lib/site-data";
import {
  buildMeta, canonicalLinks, jsonLdScript, breadcrumbSchema, productSchema,
  faqSchema, productFaqs, SITE_URL,
} from "@/lib/seo";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => {
    const p = seedProducts.find(x => x.slug === params.slug);
    if (!p) {
      return {
        meta: [
          { title: "Product not found — HIR Industries" },
          { name: "robots", content: "noindex, follow" },
        ],
        links: canonicalLinks(`/products/${params.slug}`),
      };
    }
    const primaryUse = p.categoryLabel || p.applicationArea || p.category;
    const title = `${p.name} — ${primaryUse} | HIR Industries`;
    // Unique, benefit-led description per product; falls back to spec-derived copy
    // instead of a boilerplate sentence repeated across the catalogue.
    const specBits = [
      p.categoryLabel ? `${p.categoryLabel} grade` : null,
      p.applicationArea ? `for ${p.applicationArea.toLowerCase()} use` : null,
      p.surface ? `on ${p.surface.toLowerCase()}` : null,
      p.pack ? `${p.pack} pack` : null,
      p.coverage ? `coverage ${p.coverage}` : null,
    ].filter(Boolean).join(", ");
    const description = (p.short && p.short.length > 40)
      ? p.short
      : specBits
        ? `${p.name} — ${specBits}. Manufactured by HIR Industries. Enquire for technical data and dealer pricing.`
        : `${p.name} from HIR Industries — ${p.category.toLowerCase()} engineered for lasting bond strength. Request the datasheet or a dealer enquiry.`;

    const path = `/products/${params.slug}`;
    const keywords = [
      p.name, p.category, "HIR Industries",
      p.categoryLabel || "", p.applicationArea || "",
      "tile adhesive manufacturer", "construction chemicals India",
    ].filter(Boolean);
    const video = extractYouTubeId((p as unknown as { video_url?: string }).video_url ?? "");
    const faqs = productFaqs(p.name, p.category, p.coverage ?? null, p.pack ?? null);

    return {
      meta: buildMeta({
        title,
        description,
        path,
        image: p.image,
        type: "product",
        keywords,
      }),
      links: canonicalLinks(path),
      scripts: [
        jsonLdScript(productSchema({
          slug: p.slug, name: p.name, image: p.image ?? null, category: p.category,
          short: p.short ?? null, description: null,
          features: p.features ?? null,
        }, video ? { name: p.name, youtubeId: video } : null)),
        jsonLdScript(breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          { name: p.category, path: "/products" },
          { name: p.name, path },
        ])),
        jsonLdScript(faqSchema(faqs)),
      ],
    };
  },
  component: ProductDetail,
});

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function ProductDetail() {
  const { slug } = Route.useParams();
  const all = usePublicProducts();
  const product = all.find(p => p.slug === slug);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">Product not found</h1>
        <Link to="/products" className="text-brand mt-4 inline-block">Back to products</Link>
      </div>
    );
  }

  const similar = all.filter(p => p.category === product.category && p.slug !== product.slug).slice(0, 4);
  const gallery = Array.isArray(product.gallery) ? product.gallery.filter(Boolean) : [];
  const videoId = extractYouTubeId(product.video_url ?? "");
  const applications = Array.isArray(product.applications) ? product.applications : [];
  const applicationList = Array.isArray(product.application_list) ? product.application_list : [];
  const featuresList = Array.isArray(product.features) ? product.features : [];
  const faqs = productFaqs(product.name, product.category, product.coverage, product.pack);

  const highlights = [
    { img: "/images/adhesive/Easy_To_Make.png", label: "Easy To Make" },
    { img: "/images/adhesive/INDIA’S_1st_Silica.png", label: "INDIA'S 1st 100% Silica" },
    { img: "/images/adhesive/No_Extra_Cement.png", label: "No Extra Cement" },
    { img: "/images/adhesive/Polymer_Modified_Gel.png", label: "Polymer Modified Gel" },
    { img: "/images/adhesive/Reduce_Labour.png", label: "Reduce Labour" },
    { img: "/images/adhesive/Self_Curing.png", label: "Self Curing" },
    { img: "/images/adhesive/Stronger_Bonding.png", label: "Stronger Bonding" },
  ];

  return (
    <div>
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="bg-secondary/50 py-4">
        <ol className="max-w-7xl mx-auto px-0 flex flex-wrap gap-1 text-xs text-muted-foreground">
          <li><Link to="/" className="hover:text-brand">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to="/products" className="hover:text-brand">Products</Link></li>
          <li aria-hidden="true">/</li>
          <li><span className="hover:text-brand">{product.category}</span></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground font-medium">{product.name}</li>
        </ol>
      </nav>

      <section className="max-w-7xl mx-auto px-0 py-14 grid md:grid-cols-2 gap-12">
        <div>
          <div className="bg-secondary rounded-xl flex items-center justify-center p-10 min-h-[400px]">
            {product.image && (
              <img src={product.image} alt={`${product.name} — ${product.category} by HIR Industries`}
                title={product.name} loading="eager" decoding="async"
                className="max-w-full max-h-[400px] object-contain" />
            )}
          </div>
          {gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {gallery.map((g, i) => (
                <a key={i} href={g} target="_blank" rel="noreferrer" className="bg-secondary rounded-lg p-2 aspect-square flex items-center justify-center hover:ring-2 hover:ring-brand">
                  <img src={g} alt={`${product.name} — image ${i + 1}`} loading="lazy" decoding="async" className="max-w-full max-h-full object-contain" />
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-brand text-sm font-medium">{product.category}</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">{product.name}</h1>
          {product.short && <p className="mt-4 text-muted-foreground leading-relaxed">{product.short}</p>}
          <div className="grid grid-cols-2 gap-6 mt-6 text-sm">
            {product.category_label && <div><p className="text-muted-foreground">Category</p><p className="font-medium">{product.category_label}</p></div>}
            {product.application_area && <div><p className="text-muted-foreground">Application Area</p><p className="font-medium">{product.application_area}</p></div>}
          </div>
          <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
            {product.pack && <li><b>Pack:</b> {product.pack}</li>}
            {product.coverage && <li><b>Coverage:</b> {product.coverage}</li>}
            {product.surface && <li><b>Surface:</b> {product.surface}</li>}
            {product.color && <li><b>Color:</b> {product.color}</li>}
          </ul>
          <div className="mt-6 flex gap-3">
            <Link to="/contact" className="bg-brand text-white rounded-md px-6 py-3 font-medium">Enquire Now</Link>
            {product.pdf && (
              <a href={product.pdf} download target="_blank" rel="noreferrer" className="border border-border rounded-md px-6 py-3 font-medium hover:border-brand">
                ⬇ Technical Datasheet (PDF)
              </a>
            )}
          </div>
        </div>
      </section>

      {product.description && (
        <section className="max-w-7xl mx-auto px-0 py-8">
          <h2 className="text-2xl font-bold mb-4">Product Description</h2>
          <div className="prose max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">
            {product.description}
          </div>
        </section>
      )}

      {videoId && (
        <section className="max-w-7xl mx-auto px-0 py-8">
          <h2 className="text-2xl font-bold mb-4">How to Use</h2>
          <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16 / 9" }}>
            <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${videoId}`}
              title={`${product.name} — application video`} loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        </section>
      )}

      {product.shades_image && (
        <section className="max-w-7xl mx-auto px-0 py-8">
          <h2 className="text-2xl font-bold mb-4">Available Shades</h2>
          <div className="bg-secondary/40 rounded-xl p-6 flex justify-center">
            <img src={product.shades_image} alt={`${product.name} — available shades chart`}
              loading="lazy" decoding="async" className="max-w-full h-auto object-contain" />
          </div>
          <p className="text-xs text-muted-foreground mt-3">Shades shown are for reference; actual colour may vary after application.</p>
        </section>
      )}

      {applicationList.length > 0 && (
        <section className="max-w-7xl mx-auto px-0 py-8">
          <h2 className="text-2xl font-bold mb-4">Application Areas</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
            {applicationList.map(a => <li key={a} className="flex gap-2"><span className="text-brand">•</span>{a}</li>)}
          </ul>
        </section>
      )}

      {applications.length > 0 && (
        <section className="max-w-7xl mx-auto px-0 py-8">
          <h2 className="text-2xl font-bold mb-4">Recommended Applications</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-border text-sm">
              <thead className="bg-secondary"><tr><th className="p-3 text-left">No.</th><th className="p-3 text-left">Application</th><th className="p-3 text-left">Recommended Size</th></tr></thead>
              <tbody>
                {applications.map(a => (
                  <tr key={a.no} className="border-t border-border">
                    <td className="p-3">{a.no}</td><td className="p-3">{a.application}</td><td className="p-3">{a.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {featuresList.length > 0 && (
        <section className="max-w-7xl mx-auto px-0 py-8">
          <h2 className="text-2xl font-bold mb-4">Features & Benefits</h2>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
            {featuresList.map(f => <li key={f} className="flex gap-2"><span className="text-brand">✓</span>{f}</li>)}
          </ul>
        </section>
      )}

      {/* FAQ Section — visible + schema-boosted */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="bg-white border border-border rounded-xl p-5 group hover:border-brand/40 transition-all">
              <summary className="font-semibold cursor-pointer flex justify-between items-center list-none">
                <span>{f.q}</span>
                <span aria-hidden="true" className="text-brand text-2xl group-open:rotate-45 transition-transform duration-300 shrink-0 ml-4">+</span>
              </summary>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {product.short && (
        <section className="bg-secondary/50 py-14">
          <div className="max-w-7xl mx-auto px-0">
            <h2 className="text-2xl font-bold text-center mb-8">Product Highlights</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6">
              {highlights.map(f => (
                <div key={f.label} className="text-center">
                  <img src={f.img} alt={f.label} loading="lazy" decoding="async" className="h-16 mx-auto mb-2 object-contain" />
                  <p className="text-xs text-muted-foreground">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {similar.length > 0 && (
        <section className="max-w-7xl mx-auto px-0 py-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Related Products</h2>
          <p className="text-muted-foreground mb-8">Explore related {product.category.toLowerCase()} from HIR Industries.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map(s => (
              <Link key={s.slug} to="/products/$slug" params={{ slug: s.slug }}
                className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md">
                <div className="aspect-square bg-secondary p-4 flex items-center justify-center">
                  {s.image && <img src={s.image} alt={`${s.name} — ${s.category}`} loading="lazy" decoding="async" className="max-h-full object-contain" />}
                </div>
                <div className="p-3 text-center text-sm font-medium border-t border-border">{s.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <CTASection />
    </div>
  );
}

void SITE_URL;
