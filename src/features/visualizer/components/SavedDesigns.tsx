import { useEffect } from "react";
import { loadSavedDesigns, useVisualizerStore } from "../store";

export function SavedDesigns() {
  const list = useVisualizerStore((s) => s.savedDesigns);
  const hydrate = useVisualizerStore((s) => s.hydrateSaved);
  const remove = useVisualizerStore((s) => s.removeSavedDesign);

  useEffect(() => {
    hydrate(loadSavedDesigns());
  }, [hydrate]);

  if (list.length === 0) return null;
  return (
    <section className="rounded-xl border border-neutral-200 p-4">
      <h3 className="text-sm font-semibold text-neutral-900">Saved Designs</h3>
      <ul className="mt-2 space-y-2">
        {list.slice(0, 6).map((d) => (
          <li key={d.id} className="flex items-center gap-3">
            {d.thumbDataUrl && (
              <img src={d.thumbDataUrl} alt="" className="h-10 w-14 rounded object-cover" />
            )}
            <div className="min-w-0 flex-1 text-xs">
              <div className="truncate font-medium">{d.roomId}</div>
              <div className="truncate text-neutral-500">
                {new Date(d.createdAt).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => remove(d.id)}
              className="text-xs text-neutral-500 hover:text-red-600"
              aria-label="Remove design"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
