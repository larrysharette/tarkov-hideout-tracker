import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

import { db } from "@/lib/db/index";
import { type InventoryRecord, type TaskRecord } from "@/lib/db/types";

export type TaskPin = {
  id: string;
  type: "task";
  name: string;
  objectiveId?: string;
  objectiveType?: string;
  objectiveDescription?: string;
  position: {
    icon?: string;
    x: number;
    y: number;
  };
  task: TaskRecord;
};

export type ItemPin = {
  id: string;
  type: "item";
  name: string;
  position: {
    icon?: string;
    x: number;
    y: number;
  };
  inventory: InventoryRecord;
};

export type Pin = TaskPin | ItemPin;

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

          const taskPin: TaskPin = {
            id: `${task.id}-${position.objectiveId ?? "main"}`,
            type: "task",
            name: task.name,
            objectiveId: objective?.id,
            objectiveType: objective?.type,
            objectiveDescription: objective?.description,
            position: {
              icon: undefined,
              x: position.x,
              y: position.y,
            },
            task: task,
          };

          allPins.push(taskPin);
        }
      }
    }

    // Add item pins
    for (const inventoryRecord of inventoryRecords) {
      if (inventoryRecord.mapPositions?.[mapId]) {
        const position = inventoryRecord.mapPositions[mapId];
        allPins.push({
          id: inventoryRecord.id,
          type: "item",
          name: inventoryRecord.name,
          position: {
            icon: inventoryRecord.iconLink,
            x: position.x,
            y: position.y,
          },
          inventory: inventoryRecord,
        });
      }
    }

    return allPins;
  }, [mapId, mapName, taskRecords, inventoryRecords]);

  return pins;
}
