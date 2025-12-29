import { db } from "./index";
import type {
  StationRecord,
  InventoryRecord,
  TaskRecord,
  GeneralInformationRecord,
} from "./index";
import type {
  TransformedHideoutData,
  TransformedTradersData,
  Station,
  StationLevel,
} from "@/lib/types/hideout";
import type { Task } from "@/lib/types/tasks";
import type { Item } from "@/lib/types/item";
import { getUpgradeKey } from "@/lib/utils/hideout-data";
import { addVersionToApiUrl } from "@/lib/utils/version";

/**
 * Sync hideout stations data from API to Dexie
 * Uses update() to preserve user-defined fields (currentLevel, isFocused, isCompleted)
 */
export async function syncHideoutData(): Promise<void> {
  try {
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
        await db.stations.update(station.id, {
          name: station.name,
          imageLink: station.imageLink,
          levels: mergedLevels,
          // currentLevel is preserved automatically by update()
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
        await db.stations.add(stationRecord);
      }
    }
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
      await db.generalInformation.update("general", {
        traders: updatedTraders,
        // playerLevel is preserved automatically by update()
      });
    } else {
      // General information doesn't exist, create it
      const generalRecord: GeneralInformationRecord = {
        id: "general",
        playerLevel: 1,
        traders: updatedTraders,
      };
      await db.generalInformation.add(generalRecord);
    }
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
        await db.inventory.update(item.id, {
          name: item.name,
          iconLink: item.iconLink,
          wikiLink: item.wikiLink,
          usedInTasks: item.usedInTasks,
          craftsFor: item.craftsFor,
          craftsUsing: item.craftsUsing,
          // quantityOwned, quantityNeeded, isWatchlisted are preserved automatically by update()
        });
      } else {
        // Item doesn't exist, add it with defaults
        const inventoryRecord: InventoryRecord = {
          ...item,
          quantityOwned: 0,
          quantityNeeded: 0,
          isWatchlisted: false,
        };
        await db.inventory.add(inventoryRecord);
      }
    }
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
        await db.tasks.update(task.id, {
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
        });
      } else {
        // Task doesn't exist, add it with defaults
        const taskRecord: TaskRecord = {
          ...task,
          isCompleted: false,
          isWatchlisted: false,
        };
        await db.tasks.add(taskRecord);
      }
    }
  } catch (error) {
    console.error("Error syncing tasks data:", error);
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
  ]);
}
