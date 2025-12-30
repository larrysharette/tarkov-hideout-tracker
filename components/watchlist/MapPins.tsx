import { useCallback } from "react";

import { removeItemMapPosition, removeTaskMapPosition } from "@/lib/db/updates";
import { cn } from "@/lib/utils";

import { MapPin } from "./MapPin";
import { type Pin, useMapPins } from "./useMapPins";

interface MapPinsProps {
  mapId: string | null;
  mapName: string | null;
  isAnnotationMode: boolean;
  visiblePinIds?: Set<string>;
  watchlistOnly?: boolean;
}

export function MapPins({
  mapId,
  mapName,
  isAnnotationMode,
  visiblePinIds,
  watchlistOnly = false,
}: MapPinsProps) {
  const pins = useMapPins({ mapId, mapName, isAnnotationMode, watchlistOnly });

  const handleRemovePin = useCallback(
    async (pin: Pin) => {
      if (!mapId || !isAnnotationMode) return; // Only allow removal in annotation mode
      if (pin.type === "task" && pin.taskId) {
        await removeTaskMapPosition(pin.taskId, mapId);
      } else if (pin.type === "item" && pin.itemName) {
        await removeItemMapPosition(pin.itemName, mapId);
      }
    },
    [mapId, isAnnotationMode]
  );

  if (!mapId) return null;

  // Filter pins based on visibility
  const visiblePins = visiblePinIds
    ? pins.filter((pin) => visiblePinIds.has(pin.id))
    : pins;

  return (
    <div className={cn("absolute inset-0", "pointer-events-none")}>
      {visiblePins.map((pin) => (
        <div
          key={pin.id}
          data-pin-element
          className="absolute z-10 pointer-events-auto"
          style={{
            left: `${pin.x}%`,
            top: `${pin.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <MapPin
            pin={pin}
            onRemove={isAnnotationMode ? handleRemovePin : undefined}
          />
        </div>
      ))}
    </div>
  );
}
