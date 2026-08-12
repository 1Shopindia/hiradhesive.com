import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSiteSettings, saveSetting, uploadPdf } from "@/lib/settings-store";

export const Route = createFileRoute("/admin/catalogue")({
  component: AdminCatalogue,
});

function AdminCatalogue() {
  const settings = useSiteSettings();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUrl(settings.catalogue_pdf ?? "");
    setTitle(settings.catalogue_title ?? "HIR Master Product Catalogue");
  }, [settings.catalogue_pdf, settings.catalogue_title]);

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      const uploaded = await uploadPdf(file);
      setUrl(uploaded);
      await saveSetting("catalogue_pdf", uploaded);
      toast.success("Catalogue uploaded and published");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      await saveSetting("catalogue_pdf", url.trim() || null);
      await saveSetting("catalogue_title", title.trim() || "HIR Master Product Catalogue");
      toast.success("Saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-semibold mb-1">Company Catalogue</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Upload the main HIR catalogue PDF. It becomes downloadable from the website footer,
        the products page and the homepage. Re-upload any time to replace it.
      </p>

      <div className="bg-white border border-border rounded-2xl p-6 grid gap-4">
        <label className="block">
          <span className="text-xs text-muted-foreground mb-1 block">Catalogue title</span>
          <input value={title} onChange={e => setTitle(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm" />
        </label>

        <label className="block">
          <span className="text-xs text-muted-foreground mb-1 block">Catalogue PDF URL</span>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Upload a PDF or paste a link"
            className="w-full rounded-md border border-border px-3 py-2 text-sm" />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <label className={`cursor-pointer text-sm px-4 py-2 border border-border rounded-md hover:border-brand hover:text-brand ${busy ? "opacity-50 pointer-events-none" : ""}`}>
            {busy ? "Uploading…" : "Upload / Replace PDF"}
            <input type="file" accept="application/pdf" hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.currentTarget.value = ""; }} />
          </label>
          <button onClick={save} disabled={busy} className="bg-brand text-white rounded-md px-4 py-2 text-sm disabled:opacity-50">Save</button>
          {url && (
            <a href={url} target="_blank" rel="noreferrer" className="text-sm text-brand underline">Preview current catalogue</a>
          )}
        </div>

        {!url && <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
          No catalogue uploaded yet — the download buttons stay hidden on the website until you upload one.
        </p>}
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 mt-6">
        <h3 className="text-sm font-semibold text-brand uppercase tracking-wide mb-2">Product technical datasheets</h3>
        <p className="text-sm text-muted-foreground">
          Each product has its own technical specification PDF. Edit a product under
          <b> Products → Edit → Specifications → PDF</b> to upload or replace its datasheet.
          It appears as a “Technical Datasheet (PDF)” download button on that product page.
        </p>
      </div>
    </div>
  );
}
