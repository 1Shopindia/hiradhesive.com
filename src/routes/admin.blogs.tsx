import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAllBlogs, saveBlog, deleteBlog, fileToDataUrl, type CMSBlog } from "@/lib/content-store";

export const Route = createFileRoute("/admin/blogs")({
  component: AdminBlogs,
});

type Draft = {
  slug: string; title: string; image: string; excerpt: string; sections: string;
  author: string; category: string; published: boolean; published_at: string;
  seo_title: string; seo_description: string; sort_order: number;
  originalSlug?: string;
};

const EMPTY: Draft = {
  slug: "", title: "", image: "", excerpt: "",
  sections: '[\n  {"heading": "Introduction", "body": "..."}\n]',
  author: "HIR Industries", category: "",
  published: true, published_at: new Date().toISOString().slice(0, 10),
  seo_title: "", seo_description: "", sort_order: 0,
};

/**
 * Normalize published_at to YYYY-MM-DD format.
 * Handles:
 * - null/undefined → current date
 * - JavaScript Date object → extract date part
 * - ISO string from MySQL → extract date part
 * - Already formatted YYYY-MM-DD string → use as-is
 */
function normalizePublishedDate(value: string | Date | null | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  
  // If it's already a Date object, convert to ISO and extract date
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  
  // If it's a string, handle various formats
  if (typeof value === "string") {
    // Already in YYYY-MM-DD format (10 characters)
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    
    // ISO timestamp or other parseable format - convert via Date
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
      }
    } catch (e) {
      console.warn("[admin.blogs] Could not parse date:", value, e);
    }
  }
  
  // Fallback to current date
  return new Date().toISOString().slice(0, 10);
}

function toDraft(b: CMSBlog): Draft {
  return {
    slug: b.slug, title: b.title, image: b.image ?? "", excerpt: b.excerpt ?? "",
    sections: JSON.stringify(b.sections, null, 2),
    author: b.author ?? "", category: b.category ?? "",
    published: b.published,
    published_at: normalizePublishedDate(b.published_at),
    seo_title: b.seo_title ?? "", seo_description: b.seo_description ?? "",
    sort_order: b.sort_order,
    originalSlug: b.slug,
  };
}

function AdminBlogs() {
  const blogs = useAllBlogs();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs
      .filter(b => !q || b.title.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q))
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [blogs, search]);

  const persist = async (d: Draft, published: boolean) => {
    if (!d.slug.trim() || !d.title.trim()) { toast.error("Slug and title are required"); return; }
    let sections: CMSBlog["sections"];
    try { sections = JSON.parse(d.sections); }
    catch { toast.error("Sections is not valid JSON"); return; }
    const slug = d.slug.trim().toLowerCase();
    const record: CMSBlog = {
      slug,
      title: d.title.trim(),
      image: d.image || null,
      excerpt: d.excerpt || null,
      sections,
      author: d.author || null,
      category: d.category || null,
      published,
      published_at: d.published_at ? new Date(d.published_at).toISOString() : null,
      seo_title: d.seo_title || null,
      seo_description: d.seo_description || null,
      sort_order: Number(d.sort_order) || 0,
    };
    try {
      await saveBlog(record, d.originalSlug && d.originalSlug !== slug ? d.originalSlug : undefined);
      toast.success("Saved");
      setDraft(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };


  const uploadImage = async (file: File) => {
    try {
      const url = await fileToDataUrl(file);
      setDraft(d => (d ? { ...d, image: url } : d));
      toast.success("Uploaded");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
  };

  const duplicate = (b: CMSBlog) => {
    setDraft({ ...toDraft(b), slug: `${b.slug}-copy`, title: `${b.title} (Copy)`, published: false, originalSlug: undefined });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">Blogs ({filtered.length}/{blogs.length})</h2>
        <button type="button" onClick={() => setDraft({ ...EMPTY })} className="bg-brand text-white rounded-full px-4 py-2 text-sm">+ New Blog</button>
      </div>

      <input placeholder="Search title or slug…" value={search} onChange={e => setSearch(e.target.value)}
        className="w-full rounded-md border border-border px-3 py-2 text-sm mb-6" />

      <div className="grid gap-3">
        {filtered.map(b => (
          <div key={b.slug} className="flex items-center gap-4 bg-white border border-border rounded-xl p-3">
            <div className="w-20 h-16 bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
              {b.image ? <img src={b.image} alt="" className="w-full h-full object-cover" /> : <span className="text-xs text-muted-foreground">no img</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate flex items-center gap-2">
                {b.title}
                {!b.published && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded uppercase font-semibold">Draft</span>}
              </p>
              <p className="text-xs text-muted-foreground truncate">/{b.slug}</p>
            </div>
            <button type="button" onClick={() => setDraft(toDraft(b))} className="text-sm px-3 py-1.5 rounded-md border border-border hover:border-brand hover:text-brand">Edit</button>
            <button type="button" onClick={() => duplicate(b)} className="text-sm px-3 py-1.5 rounded-md border border-border hover:border-brand hover:text-brand">Duplicate</button>
            <button type="button" onClick={async () => { if (confirm(`Delete "${b.title}"?`)) { try { await deleteBlog(b.slug); toast.success("Deleted"); } catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed"); } } }}
              className="text-sm px-3 py-1.5 rounded-md border border-border hover:border-red-500 hover:text-red-500">Delete</button>

          </div>
        ))}
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl p-6 my-8 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{draft.originalSlug ? "Edit Blog" : "New Blog"}</h3>
              <button type="button" onClick={() => setDraft(null)} className="text-neutral-500 hover:text-neutral-900">✕</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <Field label="Slug *"><input value={draft.slug} onChange={e => setDraft({ ...draft, slug: e.target.value })} className={input} /></Field>
              <Field label="Sort order"><input type="number" value={draft.sort_order} onChange={e => setDraft({ ...draft, sort_order: Number(e.target.value) })} className={input} /></Field>
              <Field label="Title *" className="sm:col-span-2"><input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} className={input} /></Field>
              <Field label="Author"><input value={draft.author} onChange={e => setDraft({ ...draft, author: e.target.value })} className={input} /></Field>
              <Field label="Category"><input value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} className={input} placeholder="Tile Adhesive, Epoxy Grout…" /></Field>
              <Field label="Publish date"><input type="date" value={draft.published_at} onChange={e => setDraft({ ...draft, published_at: e.target.value })} className={input} /></Field>
              <Field label="Excerpt" className="sm:col-span-2">
                <textarea rows={2} value={draft.excerpt} onChange={e => setDraft({ ...draft, excerpt: e.target.value })} className={input} />
              </Field>
              <Field label="Cover image URL / Upload" className="sm:col-span-2">
                <div className="flex gap-2">
                  <input value={draft.image} onChange={e => setDraft({ ...draft, image: e.target.value })} className={input} />
                  <label className="cursor-pointer text-xs px-3 py-2 border border-border rounded-md hover:border-brand hover:text-brand whitespace-nowrap">
                    Upload
                    <input type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.currentTarget.value = ""; }} />
                  </label>
                </div>
                {draft.image && <img src={draft.image} alt="" className="mt-2 max-h-32 rounded object-cover" />}
              </Field>
              <Field label='Sections (JSON: [{"heading":"...","body":"..."} or {"heading":"...","list":["..."]}])' className="sm:col-span-2">
                <textarea rows={10} value={draft.sections} onChange={e => setDraft({ ...draft, sections: e.target.value })} className={`${input} font-mono text-xs`} />
              </Field>
              <Field label="SEO title" className="sm:col-span-2"><input value={draft.seo_title} onChange={e => setDraft({ ...draft, seo_title: e.target.value })} className={input} /></Field>
              <Field label="SEO description" className="sm:col-span-2"><textarea rows={2} value={draft.seo_description} onChange={e => setDraft({ ...draft, seo_description: e.target.value })} className={input} /></Field>
            </div>
            <div className="flex flex-wrap justify-end gap-2 mt-6">
              <button type="button" onClick={() => setDraft(null)} className="px-4 py-2 text-sm rounded-md hover:bg-neutral-100">Cancel</button>
              <button type="button" onClick={() => persist(draft, false)} className="px-4 py-2 text-sm rounded-md border border-border hover:border-brand hover:text-brand">Save as Draft</button>
              <button type="button" onClick={() => persist(draft, true)} className="bg-brand text-white rounded-md px-4 py-2 text-sm">Save & Publish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const input = "w-full rounded-md border border-border px-3 py-2 text-sm";
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="text-xs text-muted-foreground mb-1 block">{label}</span>{children}</label>;
}
