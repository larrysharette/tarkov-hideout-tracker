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
  onPinSelectForReplacement?: (pin: Pin) => void;
  pinToReplace?: {
    type: "task" | "item";
    taskId?: string;
    objectiveId?: string;
    itemName?: string;
  } | null;
}

export function MapPins({
  mapId,
  mapName,
  isAnnotationMode,
  visiblePinIds,
  watchlistOnly = false,
  onPinSelectForReplacement,
  pinToReplace,
}: MapPinsProps) {
  const pins = useMapPins({ mapId, mapName, isAnnotationMode, watchlistOnly });

  const handleRemovePin = useCallback(
    async (pin: Pin) => {
      if (!mapId || !isAnnotationMode) return; // Only allow removal in annotation mode
      if (pin.type === "task" && pin.id) {
        await removeTaskMapPosition(pin.id, mapId);
      } else if (pin.type === "item" && pin.id) {
        await removeItemMapPosition(pin.id, mapId);
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
            left: `${pin.position.x}%`,
            top: `${pin.position.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <MapPin
            pin={pin}
            onRemove={isAnnotationMode ? handleRemovePin : undefined}
            onSelectForReplacement={
              isAnnotationMode ? onPinSelectForReplacement : undefined
            }
            isSelectedForReplacement={
              pinToReplace?.type === pin.type &&
              (pin.type === "task"
                ? pinToReplace.taskId === pin.id &&
                  pinToReplace.objectiveId === pin.objectiveId
                : pinToReplace.itemName === pin.id)
            }
          />
        </div>
      ))}
    </div>
  );
}
