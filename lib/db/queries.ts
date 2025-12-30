import type {
  StationLevel,
  TransformedHideoutData,
  TransformedTradersData,
} from "@/lib/types/hideout";
import { getUpgradeKey } from "@/lib/utils/hideout-data";

import { db } from "./index";
import type {
  GeneralInformationRecord,
  InventoryRecord,
  StationRecord,
  TaskRecord,
} from "./types";

/**
 * Get all stations from Dexie
 */
export async function getStations(): Promise<StationRecord[]> {
  return await db.stations.toArray();
}

/**
 * Get a single station by ID
 */
export async function getStation(
  stationId: string
): Promise<StationRecord | undefined> {
  return await db.stations.get(stationId);
}

/**
 * Get hideout data in the format expected by the app
 */
export async function getHideoutData(): Promise<TransformedHideoutData | null> {
  const stations = await db.stations.toArray();

  if (stations.length === 0) {
    return null;
  }

  // Convert StationRecord[] to Station[] and build stationLevelsMap
  const stationLevelsMap = new Map<string, StationLevel>();
  const transformedStations = stations.map((record) => {
    const stationLevels = record.levels.map((level) => {
      const key = getUpgradeKey(record.id, level.level);
      // Remove isFocused and isCompleted from StationLevel (they're stored separately)
      const { isFocused, isCompleted, ...stationLevel } = level;
      stationLevelsMap.set(key, stationLevel);
      return stationLevel;
    });

    return {
      id: record.id,
      name: record.name,
      imageLink: record.imageLink,
      levels: stationLevels,
    };
  });

  return {
    stations: transformedStations,
    stationLevelsMap,
  };
}

/**
 * Get traders data from Dexie
 */
export async function getTradersData(): Promise<TransformedTradersData | null> {
  const generalInfo = await db.generalInformation.get("general");

  if (!generalInfo?.traders) {
    return null;
  }

  // Convert trader records to Trader format (remove level)
  const traders = generalInfo.traders.map(({ level, ...trader }) => trader);

  return {
    traders,
  };
}

/**
 * Get all inventory items from Dexie
 */
export async function getInventory(): Promise<InventoryRecord[]> {
  return await db.inventory.toArray();
}

/**
 * Get a single inventory item by ID
 */
export async function getInventoryItem(
  itemId: string
): Promise<InventoryRecord | undefined> {
  return await db.inventory.get(itemId);
}

/**
 * Get inventory item by name
 */
export async function getInventoryItemByName(
  itemName: string
): Promise<InventoryRecord | undefined> {
  return await db.inventory.where("name").equals(itemName).first();
}

/**
 * Get all tasks from Dexie
 */
export async function getTasks(): Promise<TaskRecord[]> {
  return await db.tasks.toArray();
}

/**
 * Get a single task by ID
 */
export async function getTask(taskId: string): Promise<TaskRecord | undefined> {
  return await db.tasks.get(taskId);
}

/**
 * Get general information (player level, trader levels)
 */
export async function getGeneralInformation(): Promise<
  GeneralInformationRecord | undefined
> {
  return await db.generalInformation.get("general");
}

/**
 * Get user hideout state from Dexie
 * This reconstructs the UserHideoutState format from Dexie records
 */
export async function getUserHideoutState() {
  const stations = await db.stations.toArray();
  const inventory = await db.inventory.toArray();
  const generalInfo = await db.generalInformation.get("general");
  const tasks = await db.tasks.toArray();

  // Build stationLevels map
  const stationLevels: Record<string, number> = {};
  for (const station of stations) {
    if (station.currentLevel > 0) {
      stationLevels[station.id] = station.currentLevel;
    }
  }

  // Build inventory map
  const inventoryMap: Record<string, number> = {};
  for (const item of inventory) {
    if (item.quantityOwned > 0) {
      inventoryMap[item.name] = item.quantityOwned;
    }
  }

  // Build focusedUpgrades array
  const focusedUpgrades: string[] = [];
  for (const station of stations) {
    for (const level of station.levels) {
      if (level.isFocused) {
        focusedUpgrades.push(getUpgradeKey(station.id, level.level));
      }
    }
  }

  // Build traderLevels map
  const traderLevels: Record<string, number> = {};
  if (generalInfo?.traders) {
    for (const trader of generalInfo.traders) {
      if (trader.level > 0) {
        traderLevels[trader.name] = trader.level;
      }
    }
  }

  // Build completedQuests array
  const completedQuests: string[] = [];
  for (const task of tasks) {
    if (task.isCompleted) {
      completedQuests.push(task.id);
    }
  }

  // Build watchlist map
  const watchlist: Record<string, number> = {};
  for (const item of inventory) {
    if (item.isWatchlisted && item.quantityNeeded > 0) {
      watchlist[item.name] = item.quantityNeeded;
    }
  }

  // Build taskWatchlist array
  const taskWatchlist: string[] = [];
  for (const task of tasks) {
    if (task.isWatchlisted) {
      taskWatchlist.push(task.id);
    }
  }

  return {
    stationLevels,
    inventory: inventoryMap,
    focusedUpgrades,
    traderLevels,
    completedQuests,
    watchlist: Object.keys(watchlist).length > 0 ? watchlist : undefined,
    taskWatchlist: taskWatchlist.length > 0 ? taskWatchlist : undefined,
    playerLevel: generalInfo?.playerLevel ?? 1,
  };
}
