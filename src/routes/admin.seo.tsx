import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useAllProducts, useAllBlogs } from "@/lib/content-store";

export const Route = createFileRoute("/admin/seo")({
  component: SeoAudit,
});

type Issue = { entity: "Product" | "Blog"; slug: string; name: string; problems: string[] };

function SeoAudit() {
  const products = useAllProducts();
  const blogs = useAllBlogs();

  const { issues, stats } = useMemo(() => {
    const issues: Issue[] = [];
    let productsWithSeoTitle = 0, productsWithSeoDesc = 0, productsWithImage = 0;
    const titleMap = new Map<string, string[]>();
    const slugMap = new Map<string, string[]>();

    for (const p of products) {
      const problems: string[] = [];
      if (!p.image) problems.push("Missing main image (ALT + OG cannot render)");
      else productsWithImage++;
      if (!p.seo_title) problems.push("Missing SEO title");
      else productsWithSeoTitle++;
      if (!p.seo_description) problems.push("Missing SEO description");
      else productsWithSeoDesc++;
      if (p.seo_title && p.seo_title.length > 65) problems.push(`SEO title too long (${p.seo_title.length}/60)`);
      if (p.seo_description && p.seo_description.length > 170) problems.push(`SEO description too long (${p.seo_description.length}/160)`);
      if (!p.short && !p.description) problems.push("Missing description copy");
      if (!p.category) problems.push("No category");
      if (!p.published) problems.push("Not published — excluded from sitemap.xml and Google");

      const t = (p.seo_title || p.name).toLowerCase();
      titleMap.set(t, [...(titleMap.get(t) ?? []), p.slug]);
      slugMap.set(p.slug, [...(slugMap.get(p.slug) ?? []), p.slug]);
      if (problems.length) issues.push({ entity: "Product", slug: p.slug, name: p.name, problems });
    }

    let blogsWithSeoTitle = 0, blogsWithSeoDesc = 0, blogsWithImage = 0;
    for (const b of blogs) {
      const problems: string[] = [];
      if (!b.image) problems.push("Missing cover image");
      else blogsWithImage++;
      if (!b.excerpt) problems.push("Missing excerpt (used as meta description fallback)");
      if (!b.seo_title) problems.push("Missing SEO title");
      else blogsWithSeoTitle++;
      if (!b.seo_description) problems.push("Missing SEO description");
      else blogsWithSeoDesc++;
      if (b.seo_title && b.seo_title.length > 65) problems.push(`SEO title too long (${b.seo_title.length}/60)`);
      if (b.seo_description && b.seo_description.length > 170) problems.push(`SEO description too long (${b.seo_description.length}/160)`);
      if (!b.sections?.length) problems.push("No body sections");
      if (!b.category) problems.push("No category");
      if (!b.published) problems.push("Not published — excluded from sitemap.xml and Google");
      if (!b.published_at) problems.push("No publish date (Article schema omits datePublished)");

      const t = (b.seo_title || b.title).toLowerCase();
      titleMap.set(t, [...(titleMap.get(t) ?? []), b.slug]);
      if (problems.length) issues.push({ entity: "Blog", slug: b.slug, name: b.title, problems });
    }

    const duplicates: string[] = [];
    for (const [t, slugs] of titleMap) {
      if (slugs.length > 1) duplicates.push(`Duplicate title "${t}" on: ${slugs.join(", ")}`);
    }

    const stats = {
      products: products.length,
      blogs: blogs.length,
      productsWithSeoTitle,
      productsWithSeoDesc,
      productsWithImage,
      blogsWithSeoTitle,
      blogsWithSeoDesc,
      blogsWithImage,
      duplicates,
    };
    return { issues, stats };
  }, [products, blogs]);

  const totalIssues = issues.reduce((s, i) => s + i.problems.length, 0);
  const seoScore = Math.max(0, Math.round(100 - (totalIssues / Math.max(1, products.length + blogs.length)) * 12));

  const pct = (n: number, d: number) => (d === 0 ? "0%" : `${Math.round((n / d) * 100)}%`);

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Metric label="SEO Score" value={`${seoScore}/100`} tone={seoScore >= 80 ? "good" : seoScore >= 60 ? "warn" : "bad"} />
        <Metric label="Total Issues" value={String(totalIssues)} tone={totalIssues === 0 ? "good" : totalIssues < 20 ? "warn" : "bad"} />
        <Metric label="Products" value={String(stats.products)} />
        <Metric label="Blogs" value={String(stats.blogs)} />
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8 text-sm">
        <Card title="Product SEO coverage">
          <Row label="Custom SEO title" value={pct(stats.productsWithSeoTitle, stats.products)} />
          <Row label="Custom SEO description" value={pct(stats.productsWithSeoDesc, stats.products)} />
          <Row label="Main image (ALT + OG)" value={pct(stats.productsWithImage, stats.products)} />
        </Card>
        <Card title="Blog SEO coverage">
          <Row label="Custom SEO title" value={pct(stats.blogsWithSeoTitle, stats.blogs)} />
          <Row label="Custom SEO description" value={pct(stats.blogsWithSeoDesc, stats.blogs)} />
          <Row label="Cover image" value={pct(stats.blogsWithImage, stats.blogs)} />
        </Card>
        <Card title="Duplicate titles">
          {stats.duplicates.length === 0
            ? <p className="text-muted-foreground text-xs">None detected 🎉</p>
            : <ul className="text-xs space-y-1 text-red-600">{stats.duplicates.map(d => <li key={d}>{d}</li>)}</ul>}
        </Card>
      </div>

      <h3 className="text-lg font-semibold mb-3">Issues by page ({issues.length})</h3>
      {issues.length === 0
        ? <p className="text-muted-foreground text-sm bg-green-50 border border-green-200 rounded-lg p-4">No issues detected. All pages have complete SEO metadata.</p>
        : (
          <div className="space-y-2">
            {issues.map(i => (
              <details key={`${i.entity}-${i.slug}`} className="bg-white border border-border rounded-xl p-4">
                <summary className="cursor-pointer flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${i.entity === "Product" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>{i.entity}</span>
                    <span className="font-medium">{i.name}</span>
                    <span className="text-xs text-muted-foreground">/{i.slug}</span>
                  </span>
                  <span className="text-xs font-semibold text-red-600">{i.problems.length} issue{i.problems.length !== 1 ? "s" : ""}</span>
                </summary>
                <ul className="mt-3 pl-4 space-y-1 text-sm text-red-700 list-disc">
                  {i.problems.map(p => <li key={p}>{p}</li>)}
                </ul>
              </details>
            ))}
          </div>
        )}

      <div className="mt-8 bg-secondary/40 border border-border rounded-xl p-5 text-sm">
        <h3 className="font-semibold mb-2">Global SEO status</h3>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>✓ Canonical domain: <code className="bg-white px-1 rounded">hiradhesive.com</code> (all canonicals + og:url absolute)</li>
          <li>✓ Sitemaps: <code>/sitemap.xml</code>, <code>/sitemap-products.xml</code>, <code>/sitemap-blogs.xml</code>, <code>/sitemap-images.xml</code>, <code>/sitemap-pages.xml</code></li>
          <li>✓ robots.txt with AI crawler allowances (GPTBot, PerplexityBot, ClaudeBot, Google-Extended)</li>
          <li>✓ Schema.org: Organization, LocalBusiness, WebSite+SearchAction, Product, Article, FAQ, Breadcrumb, VideoObject</li>
          <li>✓ Open Graph + Twitter Card meta on every route</li>
          <li>✓ hreflang: en + x-default (multilingual-ready)</li>
          <li>✓ /llms.txt for AI search engines</li>
          <li>✓ Admin routes noindex + Disallow via robots</li>
        </ul>
      </div>
    </div>
  );
}

function Metric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "good" | "warn" | "bad" | "neutral" }) {
  const toneCls = tone === "good" ? "text-green-600" : tone === "warn" ? "text-yellow-600" : tone === "bad" ? "text-red-600" : "text-foreground";
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${toneCls}`}>{value}</p>
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <p className="text-xs text-brand font-semibold uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between py-1 text-xs"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}
