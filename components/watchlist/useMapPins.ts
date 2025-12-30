import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

import { db, type InventoryRecord, type TaskRecord } from "@/lib/db/index";

export interface Pin {
  id: string;
  type: "task" | "item";
  label: string;
  x: number;
  y: number;
  objectiveId?: string;
  taskId?: string;
  itemName?: string;
  // Additional data for tooltips
  taskName?: string;
  objectiveType?: string;
  objectiveDescription?: string;
  itemIconLink?: string;
}

interface UseMapPinsProps {
  mapId: string | null;
  mapName: string | null;
  isAnnotationMode: boolean;
  watchlistOnly?: boolean;
}

export function useMapPins({
  mapId,
  mapName,
  isAnnotationMode,
  watchlistOnly = false,
}: UseMapPinsProps) {
  const taskRecords = useLiveQuery(
    async () => {
      if (watchlistOnly) {
        return (await db.tasks.toArray()).filter((task) => task.isWatchlisted);
      }
      return await db.tasks.toArray();
    },
    [isAnnotationMode, watchlistOnly],
    [] as TaskRecord[]
  );
  const inventoryRecords = useLiveQuery(
    () => db.inventory.toArray(),
    [],
    [] as InventoryRecord[]
  );

  // Get all pins for the current map
  const pins = useMemo((): Pin[] => {
    if (!mapId || !taskRecords || !inventoryRecords) return [];

    const allPins: Pin[] = [];

    // Add task pins
    for (const task of taskRecords) {
      if (task.mapPositions?.[mapId]) {
        const positions = task.mapPositions[mapId];
        for (const position of positions) {
          // Find objective if objectiveId is provided
          const objective =
            position.objectiveId !== undefined && position.objectiveId !== null
              ? task.objectives.find((o) => o.id === position.objectiveId)
              : null;

          allPins.push({
            id: `task-${task.id}-${position.objectiveId ?? "main"}`,
            type: "task",
            label: objective
              ? `${task.name} - ${objective.type} - ${objective.description}`
              : task.name,
            x: position.x,
            y: position.y,
            objectiveId: position.objectiveId,
            taskId: task.id,
            taskName: task.name,
            objectiveType: objective?.type,
            objectiveDescription: objective?.description,
          });
        }
      }
    }

    // Add item pins
    for (const inventoryRecord of inventoryRecords) {
      if (inventoryRecord.mapPositions?.[mapId]) {
        const position = inventoryRecord.mapPositions[mapId];
        allPins.push({
          id: `item-${inventoryRecord.name}`,
          type: "item",
          label: inventoryRecord.name,
          x: position.x,
          y: position.y,
          itemName: inventoryRecord.name,
          itemIconLink: inventoryRecord.iconLink,
        });
      }
    }

    return allPins;
  }, [mapId, mapName, taskRecords, inventoryRecords]);

  return pins;
}
