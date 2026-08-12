import { useMemo, useState } from "react";
import { BUILT_IN_ROOMS, ROOM_CATEGORIES } from "../../data/rooms";
import { loadCustomRooms } from "../../lib/customRoomStore";
import { useVisualizerStore } from "../../store";
import { WizardShell } from "../WizardShell";
import { CustomerRoomUploader } from "../CustomerRoomUploader";

export function Step1Room() {
  const [category, setCategory] = useState<string>("All");
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const setRoom = useVisualizerStore((s) => s.setRoom);
  const setCustomRoom = useVisualizerStore((s) => s.setCustomRoom);
  const roomId = useVisualizerStore((s) => s.roomId);
  const customRoomKey = useVisualizerStore((s) => s.customRoomKey);
  const next = useVisualizerStore((s) => s.next);

  const rooms = useMemo(
    () => BUILT_IN_ROOMS.filter((r) => category === "All" || r.category === category),
    [category],
  );
  const custom = useMemo(() => loadCustomRooms(), [uploaderOpen]);

  return (
    <WizardShell
      title="Choose Your Room"
      subtitle="Start with a room photo. Every step from here previews live."
      canProceed={!!(roomId || customRoomKey)}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {["All", ...ROOM_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={[
              "rounded-full px-4 py-1.5 text-sm transition",
              category === c
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
            ].join(" ")}
          >
            {c}
          </button>
        ))}
        <button
          onClick={() => setUploaderOpen(true)}
          className="ml-auto rounded-full border border-dashed border-neutral-400 px-4 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
        >
          + Upload Your Room
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {rooms.map((r) => {
          const selected = roomId === r.id;
          return (
            <button
              key={r.id}
              onClick={() => {
                setRoom(r.id);
                setTimeout(next, 200);
              }}
              className={[
                "group overflow-hidden rounded-xl border text-left transition",
                selected
                  ? "border-neutral-900 ring-2 ring-neutral-900"
                  : "border-neutral-200 hover:border-neutral-400",
              ].join(" ")}
            >
              <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                <img
                  src={r.thumb}
                  alt={r.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <div className="text-sm font-medium text-neutral-900">{r.name}</div>
                <div className="text-xs text-neutral-500">{r.category}</div>
              </div>
            </button>
          );
        })}

        {custom.map((r) => {
          const selected = customRoomKey === r.key;
          return (
            <button
              key={r.key}
              onClick={() => {
                setCustomRoom(r.key);
                setTimeout(next, 200);
              }}
              className={[
                "group overflow-hidden rounded-xl border text-left transition",
                selected
                  ? "border-neutral-900 ring-2 ring-neutral-900"
                  : "border-neutral-200 hover:border-neutral-400",
              ].join(" ")}
            >
              <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                <img src={r.imageDataUrl} alt={r.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <div className="text-sm font-medium text-neutral-900">{r.name}</div>
                <div className="text-xs text-neutral-500">Your Room</div>
              </div>
            </button>
          );
        })}
      </div>

      {uploaderOpen && (
        <CustomerRoomUploader
          onClose={() => setUploaderOpen(false)}
          onSaved={(key) => {
            setCustomRoom(key);
            setUploaderOpen(false);
            setTimeout(next, 200);
          }}
        />
      )}
    </WizardShell>
  );
}
