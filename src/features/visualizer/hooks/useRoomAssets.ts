import { useEffect, useState } from "react";
import { getCalibration } from "../lib/calibrationStore";
import { getCustomRoom } from "../lib/customRoomStore";
import { loadImage } from "../lib/seamlessTexture";
import type { RoomAssets, RoomCategory, RoomMetadata, RoomPolygon } from "../types";

type Args = { roomId?: string | null; customRoomKey?: string | null; calibrationVersion?: number };

/**
 * `calibrationVersion` is a client-side counter (bumped by the calibrator on
 * save) so this hook re-reads localStorage when the user saves new floor
 * corners without needing a full router refresh.
 */
export function useRoomAssets({ roomId, customRoomKey, calibrationVersion = 0 }: Args) {
  const [assets, setAssets] = useState<RoomAssets | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [calibrated, setCalibrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setAssets(null);
      setError(null);
      setCalibrated(false);
      if (!roomId && !customRoomKey) return;
      setLoading(true);
      try {
        if (customRoomKey) {
          const custom = getCustomRoom(customRoomKey);
          if (!custom) throw new Error("Custom room not found");
          const image = await loadImage(custom.imageDataUrl);
          if (cancelled) return;
          let polygon = custom.polygon;
          const cal = getCalibration(custom.key);
          if (cal) {
            polygon = {
              ...polygon,
              points: cal.points,
              widthMeters: cal.widthMeters ?? polygon.widthMeters,
              depthMeters: cal.depthMeters ?? polygon.depthMeters,
            };
            setCalibrated(true);
          }
          const meta: RoomMetadata = {
            id: custom.key,
            name: custom.name,
            category: "Living Room",
            defaultTileSize: "600x600",
            lightingHint: "user-supplied",
          };
          setAssets({
            id: custom.key,
            name: custom.name,
            category: "Living Room",
            image,
            polygon,
            metadata: meta,
          });
        } else if (roomId) {
          const base = `/rooms/${roomId}`;
          const [image, polygon, metadata] = await Promise.all([
            loadImage(`${base}/room.jpg`),
            fetch(`${base}/polygon.json`).then((r) => r.json() as Promise<RoomPolygon>),
            fetch(`${base}/metadata.json`).then((r) => r.json() as Promise<RoomMetadata>),
          ]);
          if (cancelled) return;
          let finalPoly = polygon;
          const cal = getCalibration(roomId);
          if (cal) {
            finalPoly = {
              ...polygon,
              points: cal.points,
              widthMeters: cal.widthMeters ?? polygon.widthMeters,
              depthMeters: cal.depthMeters ?? polygon.depthMeters,
            };
            setCalibrated(true);
          }
          setAssets({
            id: roomId,
            name: metadata.name,
            category: metadata.category as RoomCategory,
            image,
            polygon: finalPoly,
            metadata,
          });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [roomId, customRoomKey, calibrationVersion]);

  return { assets, error, loading, calibrated };
}

