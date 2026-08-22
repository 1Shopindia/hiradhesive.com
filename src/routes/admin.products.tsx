import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useAllProducts, saveProduct, deleteProduct, fileToDataUrl,
  type CMSProduct,
} from "@/lib/content-store";
import { uploadPdf } from "@/lib/settings-store";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

const CATS = ["Tiles & Stone Solutions", "Wall Solutions", "Grouts & Sealants", "Waterproofing", "Tools & Accessories"];

type Draft = {
  slug: string; name: string; image: string; category: string;
  short: string; description: string; category_label: string; application_area: string;
  pack: string; coverage: string; surface: string; color: string;
  features: string; applications: string; gallery: string;
  video_url: string; published: boolean;
  seo_title: string; seo_description: string;
  pdf: string; shades_image: string; application_list: string; sort_order: number;
  originalSlug?: string;
};

const EMPTY: Draft = {
  slug: "", name: "", image: "", category: CATS[0],
  short: "", description: "", category_label: "", application_area: "",
  pack: "", coverage: "", surface: "", color: "",
  features: "", applications: "", gallery: "",
  video_url: "", published: true,
  seo_title: "", seo_description: "",
  pdf: "", shades_image: "", application_list: "", sort_order: 0,
};

function toDraft(p: CMSProduct): Draft {
  return {
    slug: p.slug, name: p.name, image: p.image ?? "", category: p.category,
    short: p.short ?? "", description: p.description ?? "",
    category_label: p.category_label ?? "", application_area: p.application_area ?? "", pack: p.pack ?? "", coverage: p.coverage ?? "",
    surface: p.surface ?? "", color: p.color ?? "",
    features: (p.features ?? []).join("\n"),
    applications: p.applications ? JSON.stringify(p.applications, null, 2) : "",
    gallery: (p.gallery ?? []).join("\n"),
    video_url: p.video_url ?? "",
    published: p.published,
    seo_title: p.seo_title ?? "", seo_description: p.seo_description ?? "",
    pdf: p.pdf ?? "", shades_image: p.shades_image ?? "",
    application_list: (p.application_list ?? []).join("\n"),
    sort_order: p.sort_order,
    originalSlug: p.slug,
  };
}

function AdminProducts() {
  const products = useAllProducts();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter(p => {
        if (filterCat !== "All" && p.category !== filterCat) return false;
        if (q && !p.name.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [products, search, filterCat]);

  const persistDraft = async (d: Draft, published: boolean) => {
    if (!d.slug.trim() || !d.name.trim()) { toast.error("Slug and name are required"); return; }
    let apps: CMSProduct["applications"] = null;
    if (d.applications.trim()) {
      try { apps = JSON.parse(d.applications); }
      catch { toast.error("Applications is not valid JSON"); return; }
    }
    const slug = d.slug.trim().toLowerCase();
    const record: CMSProduct = {
      slug,
      name: d.name.trim(),
      image: d.image || null,
      category: d.category,
      short: d.short || null,
      description: d.description || null,
      category_label: d.category_label || null,
      application_area: d.application_area || null,
      pack: d.pack || null,
      coverage: d.coverage || null,
      surface: d.surface || null,
      color: d.color || null,
      features: d.features ? d.features.split("\n").map(s => s.trim()).filter(Boolean) : null,
      applications: apps,
      gallery: d.gallery ? d.gallery.split("\n").map(s => s.trim()).filter(Boolean) : [],
      video_url: d.video_url || null,
      published,
      seo_title: d.seo_title || null,
      seo_description: d.seo_description || null,
      pdf: d.pdf || null,
      shades_image: d.shades_image || null,
      application_list: d.application_list ? d.application_list.split("\n").map(s => s.trim()).filter(Boolean) : null,
      sort_order: Number(d.sort_order) || 0,
    };
    try {
      // Always pass originalSlug when editing (even if slug unchanged)
      // Only pass undefined when creating new product (originalSlug not set)
      await saveProduct(record, d.originalSlug);
      toast.success("Saved");
      setDraft(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };


  const upload = async (file: File, target: "image" | "shades_image" | "pdf" | "gallery") => {
    try {
      // PDFs go to file storage (small link), images stay inline as data URLs.
      const url = target === "pdf" ? await uploadPdf(file) : await fileToDataUrl(file);
      setDraft(d => {
        if (!d) return d;
        if (target === "gallery") return { ...d, gallery: d.gallery ? `${d.gallery}\n${url}` : url };
        return { ...d, [target]: url };
      });
      toast.success("Uploaded");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
  };

  const duplicate = (p: CMSProduct) => {
    setDraft({ ...toDraft(p), slug: `${p.slug}-copy`, name: `${p.name} (Copy)`, published: false, originalSlug: undefined });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">Products ({filtered.length}/{products.length})</h2>
        <button type="button" onClick={() => setDraft({ ...EMPTY })} className="bg-brand text-white rounded-full px-4 py-2 text-sm">+ New Product</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <input placeholder="Search name or slug…" value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-md border border-border px-3 py-2 text-sm" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="rounded-md border border-border px-3 py-2 text-sm">
          <option>All</option>
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid gap-3">
        {filtered.map(p => (
          <div key={p.slug} className="flex items-center gap-4 bg-white border border-border rounded-xl p-3">
            <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
              {p.image ? <img src={p.image} alt="" className="max-w-full max-h-full object-contain" /> : <span className="text-xs text-muted-foreground">no img</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate flex items-center gap-2">
                {p.name}
                {!p.published && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded uppercase font-semibold">Draft</span>}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {p.category} · /{p.slug}
                <span className="ml-2 text-brand font-medium">Order: {p.sort_order}</span>
              </p>
            </div>
            <button type="button" onClick={() => setDraft(toDraft(p))} className="text-sm px-3 py-1.5 rounded-md border border-border hover:border-brand hover:text-brand">Edit</button>
            <button type="button" onClick={() => duplicate(p)} className="text-sm px-3 py-1.5 rounded-md border border-border hover:border-brand hover:text-brand">Duplicate</button>
            <button type="button" onClick={async () => { if (confirm(`Delete "${p.name}"?`)) { try { await deleteProduct(p.slug); toast.success("Deleted"); } catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed"); } } }}
              className="text-sm px-3 py-1.5 rounded-md border border-border hover:border-red-500 hover:text-red-500">Delete</button>

          </div>
        ))}
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl p-6 my-8 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{draft.originalSlug ? "Edit Product" : "New Product"}</h3>
              <button type="button" onClick={() => setDraft(null)} className="text-neutral-500 hover:text-neutral-900">✕</button>
            </div>

            <Section title="Basic Information">
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <Field label="Slug *"><input value={draft.slug} onChange={e => setDraft({ ...draft, slug: e.target.value })} className={input} /></Field>
                <Field label="Name *"><input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className={input} /></Field>
                <Field label="Category *">
                  <select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} className={input}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Sort order (lower = first in category)">
                  <input 
                    type="number" 
                    value={draft.sort_order} 
                    onChange={e => setDraft({ ...draft, sort_order: Number(e.target.value) })} 
                    className={input}
                    placeholder="0 = first, 100 = last"
                  />
                </Field>
                <Field label="Category label"><input value={draft.category_label} onChange={e => setDraft({ ...draft, category_label: e.target.value })} className={input} /></Field>
                <Field label="Application area"><input value={draft.application_area} onChange={e => setDraft({ ...draft, application_area: e.target.value })} className={input} /></Field>
              </div>
            </Section>

            <Section title="Images">
              <div className="grid gap-3 text-sm">
                <Field label="Main image URL / Upload">
                  <div className="flex gap-2">
                    <input value={draft.image} onChange={e => setDraft({ ...draft, image: e.target.value })} placeholder="/images/... or full URL" className={input} />
                    <UploadBtn accept="image/*" onFile={f => upload(f, "image")} />
                  </div>
                  {draft.image && <img src={draft.image} alt="" className="mt-2 max-h-24 object-contain" />}
                </Field>
                <Field label="Gallery images (one URL per line)">
                  <div className="flex gap-2 items-start">
                    <textarea rows={3} value={draft.gallery} onChange={e => setDraft({ ...draft, gallery: e.target.value })} className={input} />
                    <UploadBtn label="Add" accept="image/*" onFile={f => upload(f, "gallery")} />
                  </div>
                </Field>
                <Field label="Shades image URL / Upload">
                  <div className="flex gap-2">
                    <input value={draft.shades_image} onChange={e => setDraft({ ...draft, shades_image: e.target.value })} className={input} />
                    <UploadBtn accept="image/*" onFile={f => upload(f, "shades_image")} />
                  </div>
                </Field>
              </div>
            </Section>

            <Section title="Description">
              <div className="grid gap-3 text-sm">
                <Field label="Short description"><textarea rows={2} value={draft.short} onChange={e => setDraft({ ...draft, short: e.target.value })} className={input} /></Field>
                <Field label="Full description"><textarea rows={6} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} className={input} /></Field>
              </div>
            </Section>

            <Section title="Specifications">
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <Field label="Pack size / KG"><input value={draft.pack} onChange={e => setDraft({ ...draft, pack: e.target.value })} className={input} /></Field>
                <Field label="Coverage"><input value={draft.coverage} onChange={e => setDraft({ ...draft, coverage: e.target.value })} className={input} /></Field>
                <Field label="Surface"><input value={draft.surface} onChange={e => setDraft({ ...draft, surface: e.target.value })} className={input} /></Field>
                <Field label="Colour"><input value={draft.color} onChange={e => setDraft({ ...draft, color: e.target.value })} className={input} /></Field>
                <Field label="PDF (technical / lab report)">
                  <div className="flex gap-2">
                    <input value={draft.pdf} onChange={e => setDraft({ ...draft, pdf: e.target.value })} className={input} />
                    <UploadBtn accept="application/pdf" onFile={f => upload(f, "pdf")} />
                  </div>
                </Field>
              </div>
            </Section>

            <Section title="Application Area Table">
              <p className="text-xs text-muted-foreground mb-2">
                JSON array. Example: <code className="bg-neutral-100 px-1 rounded">{`[{"no":1,"application":"Tile on Tile","size":"800×800 mm"}]`}</code>
              </p>
              <textarea rows={6} value={draft.applications} onChange={e => setDraft({ ...draft, applications: e.target.value })} className={`${input} font-mono text-xs`} />
              <Field label="Application list (one per line)" className="mt-3">
                <textarea rows={3} value={draft.application_list} onChange={e => setDraft({ ...draft, application_list: e.target.value })} className={input} />
              </Field>
            </Section>

            <Section title="Features">
              <p className="text-xs text-muted-foreground mb-2">One feature per line.</p>
              <textarea rows={5} value={draft.features} onChange={e => setDraft({ ...draft, features: e.target.value })} className={input} />
            </Section>

            <Section title="How to Use Video (YouTube)">
              <Field label="YouTube URL">
                <input value={draft.video_url} onChange={e => setDraft({ ...draft, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=… or https://youtu.be/…" className={input} />
              </Field>
            </Section>

            <Section title="SEO">
              <div className="grid gap-3 text-sm">
                <Field label="SEO title"><input value={draft.seo_title} onChange={e => setDraft({ ...draft, seo_title: e.target.value })} className={input} /></Field>
                <Field label="SEO description"><textarea rows={2} value={draft.seo_description} onChange={e => setDraft({ ...draft, seo_description: e.target.value })} className={input} /></Field>
              </div>
            </Section>

            <div className="flex flex-wrap justify-end gap-2 mt-6 sticky bottom-0 bg-white pt-4 border-t border-border">
              <button type="button" onClick={() => setDraft(null)} className="px-4 py-2 text-sm rounded-md hover:bg-neutral-100">Cancel</button>
              <button type="button" onClick={() => persistDraft(draft, false)} className="px-4 py-2 text-sm rounded-md border border-border hover:border-brand hover:text-brand">Save as Draft</button>
              <button type="button" onClick={() => persistDraft(draft, true)} className="bg-brand text-white rounded-md px-4 py-2 text-sm">Save & Publish</button>
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
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
      <h4 className="text-sm font-semibold text-brand mb-3 uppercase tracking-wide">{title}</h4>
      {children}
    </div>
  );
}
function UploadBtn({ accept, onFile, label = "Upload" }: { accept: string; onFile: (f: File) => void; label?: string }) {
  return (
    <label className="cursor-pointer text-xs px-3 py-2 border border-border rounded-md hover:border-brand hover:text-brand whitespace-nowrap">
      {label}
      <input type="file" accept={accept} hidden onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.currentTarget.value = ""; }} />
    </label>
  );
}
