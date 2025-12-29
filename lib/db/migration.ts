import { db } from "./index";
import type { StoredState } from "@/lib/utils/data-export";
import type { UserHideoutState } from "@/lib/types/hideout";
import { parseUpgradeKey } from "@/lib/utils/hideout-data";
import {
  updateStationLevel,
  updateInventoryQuantity,
  updateTraderLevel,
  updatePlayerLevel,
  toggleQuestCompletion,
  setWatchlistQuantity,
  addTaskToWatchlist,
} from "./updates";

/**
 * Applies user state data to Dexie database
 * This is used by both migration and import functionality
 */
export async function applyUserStateToDexie(userState: UserHideoutState): Promise<void> {
  // Apply station levels
  if (userState.stationLevels) {
    const stationEntries = Object.entries(userState.stationLevels);
    for (const [stationId, level] of stationEntries) {
      try {
        const station = await db.stations.get(stationId);
        if (station) {
          await updateStationLevel(stationId, level);
        }
      } catch (error) {
        console.warn(`Failed to apply station level for ${stationId}:`, error);
      }
    }
  }

  // Apply inventory quantities
  if (userState.inventory) {
    for (const [itemName, quantity] of Object.entries(userState.inventory)) {
      try {
        const item = await db.inventory.where("name").equals(itemName).first();
        if (item) {
          await updateInventoryQuantity(itemName, quantity);
        }
      } catch (error) {
        console.warn(`Failed to apply inventory for ${itemName}:`, error);
      }
    }
  }

  // Apply focused upgrades
  if (userState.focusedUpgrades && userState.focusedUpgrades.length > 0) {
    const stations = await db.stations.toArray();
    for (const upgradeKey of userState.focusedUpgrades) {
      try {
        const { stationId, level } = parseUpgradeKey(upgradeKey);

        if (isNaN(level)) {
          console.warn(`Invalid upgrade key format: ${upgradeKey}`);
          continue;
        }

        const station = stations.find((s) => s.id === stationId);
        if (!station) {
          continue;
        }

        // Find the level and set isFocused
        const levelIndex = station.levels.findIndex((l) => l.level === level);
        if (levelIndex !== -1 && !station.levels[levelIndex].isFocused) {
          const updatedLevels = [...station.levels];
          updatedLevels[levelIndex] = {
            ...updatedLevels[levelIndex],
            isFocused: true,
          };
          await db.stations.update(stationId, {
            levels: updatedLevels,
          });
        }
      } catch (error) {
        console.warn(`Failed to apply focused upgrade ${upgradeKey}:`, error);
      }
    }
  }

  // Apply trader levels
  if (userState.traderLevels) {
    for (const [traderName, level] of Object.entries(userState.traderLevels)) {
      try {
        await updateTraderLevel(traderName, level);
      } catch (error) {
        console.warn(`Failed to apply trader level for ${traderName}:`, error);
      }
    }
  }

  // Apply player level
  if (userState.playerLevel !== undefined) {
    try {
      await updatePlayerLevel(userState.playerLevel);
    } catch (error) {
      console.warn("Failed to apply player level:", error);
    }
  }

  // Apply completed quests
  if (userState.completedQuests && userState.completedQuests.length > 0) {
    for (const taskId of userState.completedQuests) {
      try {
        const task = await db.tasks.get(taskId);
        if (task && !task.isCompleted) {
          await toggleQuestCompletion(taskId);
        }
      } catch (error) {
        console.warn(`Failed to apply completed quest ${taskId}:`, error);
      }
    }
  }

  // Apply watchlist items
  if (userState.watchlist) {
    for (const [itemName, quantity] of Object.entries(userState.watchlist)) {
      try {
        await setWatchlistQuantity(itemName, quantity);
      } catch (error) {
        console.warn(`Failed to apply watchlist item ${itemName}:`, error);
      }
    }
  }

  // Apply task watchlist
  if (userState.taskWatchlist && userState.taskWatchlist.length > 0) {
    for (const taskId of userState.taskWatchlist) {
      try {
        const task = await db.tasks.get(taskId);
        if (task && !task.isWatchlisted) {
          await addTaskToWatchlist(taskId);
        }
      } catch (error) {
        console.warn(`Failed to apply task watchlist ${taskId}:`, error);
      }
    }
  }
}

/**
 * Migrates data from localStorage to IndexedDB (Dexie)
 * This should be called once on app initialization if localStorage data exists
 */
export async function migrateFromLocalStorage(): Promise<boolean> {
  // Check if localStorage key exists
  if (typeof window === "undefined") {
    console.log("[Migration] Server-side, skipping migration");
    return false; // Server-side, skip migration
  }

  const stored = localStorage.getItem("tarkov-hideout-state");
  if (!stored) {
    console.log("[Migration] No localStorage key found");
    return false; // No data to migrate
  }

  console.log("[Migration] Found localStorage data, length:", stored.length);

  try {
    // Parse the stored state
    const parsed: StoredState = JSON.parse(stored);
    console.log("[Migration] Parsed localStorage data:", {
      version: parsed.version,
      hasUserState: !!parsed.userState,
      stationLevelsCount: Object.keys(parsed.userState?.stationLevels || {}).length,
      inventoryCount: Object.keys(parsed.userState?.inventory || {}).length,
      focusedUpgradesCount: parsed.userState?.focusedUpgrades?.length || 0,
    });

    const userState = parsed.userState;

    if (!userState) {
      console.warn("[Migration] No userState found in localStorage data");
      localStorage.removeItem("tarkov-hideout-state");
      return false;
    }

    console.log("[Migration] Starting data migration to IndexedDB...");

    // Apply user state to Dexie
    await applyUserStateToDexie(userState);

    // Delete localStorage key after successful migration
    localStorage.removeItem("tarkov-hideout-state");
    console.log("[Migration] Migration completed successfully. localStorage key removed.");

    return true;
  } catch (error) {
    console.error("[Migration] Error migrating from localStorage:", error);
    // Don't delete localStorage on error - user can retry
    return false;
  }
}


