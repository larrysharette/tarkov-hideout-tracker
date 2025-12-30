import type {
  StationLevel,
  TransformedHideoutData,
  TransformedTradersData,
} from "@/lib/types/hideout";
import type { Item } from "@/lib/types/item";
import type { Task } from "@/lib/types/tasks";
import { getUpgradeKey } from "@/lib/utils/hideout-data";
import { addVersionToApiUrl } from "@/lib/utils/version";

import { type Map } from "../types/maps";
import type {
  GeneralInformationRecord,
  InventoryRecord,
  MapRecord,
  StationRecord,
  TaskRecord,
} from "./index";
import { db } from "./index";

/**
 * Sync hideout stations data from API to Dexie
 * Uses update() to preserve user-defined fields (currentLevel, isFocused, isCompleted)
 */
export async function syncHideoutData(): Promise<void> {
  try {
    const updates: Array<{ key: string; changes: Partial<StationRecord> }> = [];
    const adds: StationRecord[] = [];

    const response = await fetch(addVersionToApiUrl("/api/hideout"));
    if (!response.ok) {
      throw new Error(`Failed to fetch hideout: ${response.statusText}`);
    }

    const data = await response.json();
    const transformedData: TransformedHideoutData = {
      stations: data.stations,
      stationLevelsMap: new Map(Object.entries(data.stationLevelsMap)),
    };

    // Sync each station
    for (const station of transformedData.stations) {
      const existing = await db.stations.get(station.id);

      if (existing) {
        // Merge existing user state with new level data
        const existingLevelsMap = new Map(
          existing.levels.map((l) => [getUpgradeKey(station.id, l.level), l])
        );

        const mergedLevels = station.levels.map((level: StationLevel) => {
          const key = getUpgradeKey(station.id, level.level);
          const existingLevel = existingLevelsMap.get(key);
          return {
            ...level,
            isFocused: existingLevel?.isFocused ?? false,
            isCompleted: existingLevel?.isCompleted ?? false,
          };
        });

        // Use update to preserve user-defined fields (currentLevel, isFocused, isCompleted)
        updates.push({
          key: station.id,
          changes: {
            name: station.name,
            imageLink: station.imageLink,
            levels: mergedLevels,
            // currentLevel is preserved automatically by update()
          },
        });
      } else {
        // Station doesn't exist, add it with defaults
        const stationRecord: StationRecord = {
          id: station.id,
          name: station.name,
          imageLink: station.imageLink,
          currentLevel: 0,
          levels: station.levels.map((level: StationLevel) => ({
            ...level,
            isFocused: false,
            isCompleted: false,
          })),
        };
        adds.push(stationRecord);
      }
    }

    await db.transaction("rw", db.stations, async () => {
      if (updates.length > 0) {
        await db.stations.bulkUpdate(updates);
      }
      if (adds.length > 0) {
        await db.stations.bulkAdd(adds);
      }
    });
  } catch (error) {
    console.error("Error syncing hideout data:", error);
    throw error;
  }
}

/**
 * Sync traders data from API to Dexie (stored in generalInformation)
 */
export async function syncTradersData(): Promise<void> {
  try {
    const updates: Array<{
      key: string;
      changes: Partial<GeneralInformationRecord>;
    }> = [];
    const adds: GeneralInformationRecord[] = [];

    const response = await fetch(addVersionToApiUrl("/api/traders"));
    if (!response.ok) {
      throw new Error(`Failed to fetch traders: ${response.statusText}`);
    }

    const tradersData: TransformedTradersData = await response.json();

    // Get existing general information
    const existing = await db.generalInformation.get("general");
    const existingTraders = existing?.traders || [];

    // Create a map of existing trader levels
    const traderLevelMap = new Map(
      existingTraders.map((t) => [t.name, t.level])
    );

    // Merge API data with existing user-defined levels
    const updatedTraders = tradersData.traders.map((trader) => ({
      ...trader,
      level: traderLevelMap.get(trader.name) ?? 0,
    }));

    if (existing) {
      // Use update to preserve playerLevel
      updates.push({
        key: "general",
        changes: {
          traders: updatedTraders,
          // playerLevel is preserved automatically by update()
        },
      });
    } else {
      // General information doesn't exist, create it
      const generalRecord: GeneralInformationRecord = {
        id: "general",
        playerLevel: 1,
        traders: updatedTraders,
      };
      adds.push(generalRecord);
    }

    await db.transaction("rw", db.generalInformation, async () => {
      if (updates.length > 0) {
        await db.generalInformation.bulkUpdate(updates);
      }
      if (adds.length > 0) {
        await db.generalInformation.bulkAdd(adds);
      }
    });
  } catch (error) {
    console.error("Error syncing traders data:", error);
    throw error;
  }
}

/**
 * Sync items data from API to Dexie
 * Uses update() to preserve user-defined fields (quantityOwned, quantityNeeded, isWatchlisted)
 */
export async function syncItemsData(): Promise<void> {
  try {
    const updates: Array<{ key: string; changes: Partial<InventoryRecord> }> =
      [];
    const adds: InventoryRecord[] = [];

    const response = await fetch(addVersionToApiUrl("/api/items"));
    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.statusText}`);
    }

    const items: Item[] = await response.json();

    // Get all existing inventory records to preserve user state
    const existingRecords = await db.inventory.toArray();
    const existingMap = new Map(existingRecords.map((r) => [r.id, r]));

    // Sync each item
    for (const item of items) {
      const existing = existingMap.get(item.id);

      if (existing) {
        // Use update to preserve user-defined fields (quantityOwned, quantityNeeded, isWatchlisted)
        updates.push({
          key: item.id,
          changes: {
            name: item.name,
            iconLink: item.iconLink,
            wikiLink: item.wikiLink,
            usedInTasks: item.usedInTasks,
            craftsFor: item.craftsFor,
            craftsUsing: item.craftsUsing,
            // quantityOwned, quantityNeeded, isWatchlisted are preserved automatically by update()
          },
        });
      } else {
        // Item doesn't exist, add it with defaults
        const inventoryRecord: InventoryRecord = {
          ...item,
          quantityOwned: 0,
          quantityNeeded: 0,
          isWatchlisted: false,
          mapPositions: {},
        };
        adds.push(inventoryRecord);
      }
    }

    await db.transaction("rw", db.inventory, async () => {
      if (updates.length > 0) {
        await db.inventory.bulkUpdate(updates);
      }
      if (adds.length > 0) {
        await db.inventory.bulkAdd(adds);
      }
    });
  } catch (error) {
    console.error("Error syncing items data:", error);
    throw error;
  }
}

/**
 * Sync tasks data from API to Dexie
 * Uses update() to preserve user-defined fields (isCompleted, isWatchlisted)
 */
export async function syncTasksData(): Promise<void> {
  try {
    const updates: Array<{ key: string; changes: Partial<TaskRecord> }> = [];
    const adds: TaskRecord[] = [];

    const response = await fetch(addVersionToApiUrl("/api/tasks"));
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    const tasks: Task[] = await response.json();

    // Get all existing task records to preserve user state
    const existingRecords = await db.tasks.toArray();
    const existingMap = new Map(existingRecords.map((r) => [r.id, r]));

    // Sync each task
    for (const task of tasks) {
      const existing = existingMap.get(task.id);

      if (existing) {
        // Use update to preserve user-defined fields (isCompleted, isWatchlisted)
        updates.push({
          key: task.id,
          changes: {
            name: task.name,
            wikiLink: task.wikiLink,
            neededKeys: task.neededKeys,
            kappaRequired: task.kappaRequired,
            lightkeeperRequired: task.lightkeeperRequired,
            minPlayerLevel: task.minPlayerLevel,
            trader: task.trader,
            taskRequirements: task.taskRequirements,
            taskImageLink: task.taskImageLink,
            map: task.map,
            objectives: task.objectives,
            // isCompleted and isWatchlisted are preserved automatically by update()
          },
        });
      } else {
        // Task doesn't exist, add it with defaults
        const taskRecord: TaskRecord = {
          ...task,
          mapId: task.map?.id ?? null,
          isCompleted: false,
          isWatchlisted: false,
          mapPositions: {},
        };
        adds.push(taskRecord);
      }
    }

    await db.transaction("rw", db.tasks, async () => {
      if (updates.length > 0) {
        await db.tasks.bulkUpdate(updates);
      }
      if (adds.length > 0) {
        await db.tasks.bulkAdd(adds);
      }
    });
  } catch (error) {
    console.error("Error syncing tasks data:", error);
    throw error;
  }
}

function getMapImageLink(normalizedName: string): string {
  switch (normalizedName) {
    case "customs":
      return "/maps/customs.webp";
    case "reserve":
      return "/maps/reserve.webp";
    case "night-factory":
    case "factory":
      return "/maps/factory.webp";
    case "shoreline":
      return "/maps/shoreline.webp";
    case "interchange":
      return "/maps/interchange.webp";
    case "woods":
      return "/maps/woods.webp";
    case "ground-zero-21":
    case "ground-zero-tutorial":
    case "ground-zero":
      return "/maps/ground_zero.webp";
    case "the-lab":
      return "/maps/labs.webp";
    case "lighthouse":
      return "/maps/lighthouse.webp";
    case "streets-of-tarkov":
      return "/maps/streets_of_tarkov.webp";
    case "the-labyrinth":
      return "/maps/labyrinth.webp";
    case "terminal":
      return "/maps/terminal.webp";
    default:
      return "/maps/customs.webp";
  }
}

/**
 * Sync tasks data from API to Dexie
 * Uses update() to preserve user-defined fields (isCompleted, isWatchlisted)
 */
export async function syncMapsData(): Promise<void> {
  try {
    const updates: Array<{ key: string; changes: Partial<MapRecord> }> = [];
    const adds: MapRecord[] = [];
    const response = await fetch(addVersionToApiUrl("/api/maps"));
    if (!response.ok) {
      throw new Error(`Failed to fetch maps: ${response.statusText}`);
    }

    const maps: Map[] = await response.json();

    // Get all existing task records to preserve user state
    const existingRecords = await db.maps.toArray();
    const existingMap = new Map(existingRecords.map((r) => [r.id, r]));

    // Sync each map
    for (const map of maps) {
      const existing = existingMap.get(map.id);

      if (existing) {
        // Use update to preserve user-defined fields (isCompleted, isWatchlisted)
        updates.push({
          key: map.normalizedName,
          changes: {
            name: map.name,
            wiki: map.wiki,
            normalizedName: map.normalizedName,
          },
        });
      } else {
        // Task doesn't exist, add it with defaults
        const mapRecord: MapRecord = {
          ...map,
          imageLink: getMapImageLink(map.normalizedName),
        };
        adds.push(mapRecord);
      }
    }

    await db.transaction("rw", db.maps, async () => {
      if (updates.length > 0) {
        await db.maps.bulkUpdate(updates);
      }
      if (adds.length > 0) {
        await db.maps.bulkAdd(adds);
      }
    });
  } catch (error) {
    console.error("Error syncing maps data:", error);
    throw error;
  }
}

/**
 * Sync all data from APIs to Dexie
 * This should be called on app initialization and periodically in the background
 */
export async function syncAllData(): Promise<void> {
  await Promise.all([
    syncHideoutData(),
    syncTradersData(),
    syncItemsData(),
    syncTasksData(),
    syncMapsData(),
  ]);
}
