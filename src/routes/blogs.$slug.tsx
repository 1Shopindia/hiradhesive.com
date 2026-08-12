import { createFileRoute, Link } from "@tanstack/react-router";
import { CTASection } from "@/components/CTASection";
import { usePublicBlogs } from "@/lib/content-store";
import { blogs as seedBlogs } from "@/lib/site-data";
import {
  buildMeta, canonicalLinks, jsonLdScript, breadcrumbSchema, articleSchema,
} from "@/lib/seo";

export const Route = createFileRoute("/blogs/$slug")({
  head: ({ params }) => {
    const b = seedBlogs.find(x => x.slug === params.slug);
    if (!b) {
      return {
        meta: [
          { title: "Blog post not found — HIR Industries" },
          { name: "robots", content: "noindex, follow" },
        ],
        links: canonicalLinks(`/blogs/${params.slug}`),
      };
    }
    const title = `${b.title} | HIR Industries`;
    const description = b.excerpt || b.title;
    const path = `/blogs/${params.slug}`;
    const publishedAt = (b as unknown as { published_at?: string }).published_at ?? null;
    return {
      meta: buildMeta({
        title, description, path,
        image: b.image, type: "article",
        author: "HIR Industries",
        ...(publishedAt ? { publishedTime: publishedAt, modifiedTime: publishedAt } : {}),
        keywords: [b.title, "tile adhesive", "epoxy grout", "waterproofing", "HIR Industries"],
      }),
      links: canonicalLinks(path),
      scripts: [
        jsonLdScript(articleSchema({
          slug: b.slug, title: b.title, excerpt: b.excerpt ?? null,
          image: b.image ?? null, author: "HIR Industries", published_at: publishedAt,
        })),

        jsonLdScript(breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blogs" },
          { name: b.title, path },
        ])),
      ],
    };
  },
  component: BlogDetail,
});

function BlogDetail() {
  const { slug } = Route.useParams();
  const blogs = usePublicBlogs();
  const blog = blogs.find(b => b.slug === slug);

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">Blog not found</h1>
        <Link to="/blogs" className="text-brand mt-4 inline-block">Back to blogs</Link>
      </div>
    );
  }

  const sections = blog.sections ?? [];
  const dateStr = blog.published_at ? new Date(blog.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : null;
  const related = blogs.filter(b => b.slug !== blog.slug).slice(0, 3);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="bg-secondary/50 py-4">
        <ol className="max-w-3xl mx-auto px-4 flex flex-wrap gap-1 text-xs text-muted-foreground">
          <li><Link to="/" className="hover:text-brand">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to="/blogs" className="hover:text-brand">Blog</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground font-medium line-clamp-1">{blog.title}</li>
        </ol>
      </nav>

      <article className="max-w-3xl mx-auto px-4 py-14">
        {blog.category && <p className="text-brand text-xs font-semibold uppercase tracking-widest">{blog.category}</p>}
        <h1 className="text-3xl md:text-4xl font-bold mt-2">{blog.title}</h1>
        {(blog.author || dateStr) && (
          <p className="text-sm text-muted-foreground mt-3">
            <span rel="author">{blog.author}</span>{blog.author && dateStr ? " · " : ""}
            {blog.published_at && <time dateTime={blog.published_at}>{dateStr}</time>}
          </p>
        )}
        {blog.image && (
          <img src={blog.image} alt={blog.title} loading="eager" decoding="async"
            className="w-full rounded-xl mt-6 mb-8" />
        )}
        {sections.map((s, i) => (
          <section key={i} className="mb-8">
            <h2 className="text-2xl font-bold mb-3">{s.heading}</h2>
            {s.body && <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{s.body}</p>}
            {s.list && (
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                {s.list.map(item => <li key={item}>{item}</li>)}
              </ul>
            )}
          </section>
        ))}
      </article>

      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-6">Related Reading</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map(r => (
              <Link key={r.slug} to="/blogs/$slug" params={{ slug: r.slug }}
                className="block bg-white border border-border rounded-xl overflow-hidden hover:shadow-elegant hover:border-brand/40 transition-all">
                {r.image && <img src={r.image} alt={r.title} loading="lazy" decoding="async" className="w-full h-40 object-cover" />}
                <div className="p-5">
                  <h3 className="font-bold group-hover:text-brand">{r.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{r.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <CTASection />
    </div>
  );
}
