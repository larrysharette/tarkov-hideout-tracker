import type { StationLevel } from "@/lib/types/hideout";

import { db } from "./index";

/**
 * Update station level in Dexie
 */
export async function updateStationLevel(
  stationId: string,
  level: number
): Promise<void> {
  await db.stations.update(stationId, {
    currentLevel: level,
  });
}

/**
 * Update inventory quantity for an item by name
 */
export async function updateInventoryQuantity(
  itemName: string,
  quantity: number
): Promise<void> {
  const item = await db.inventory.where("name").equals(itemName).first();
  if (item) {
    await db.inventory.update(item.id, {
      quantityOwned: Math.max(0, quantity),
    });
  }
}

/**
 * Toggle focused upgrade for a station level
 */
export async function toggleFocusedUpgrade(
  stationId: string,
  level: number
): Promise<void> {
  const station = await db.stations.get(stationId);
  if (!station) return;

  const levelIndex = station.levels.findIndex((l) => l.level === level);
  if (levelIndex === -1) return;

  const updatedLevels = [...station.levels];
  updatedLevels[levelIndex] = {
    ...updatedLevels[levelIndex],
    isFocused: !updatedLevels[levelIndex].isFocused,
  };

  await db.stations.update(stationId, {
    levels: updatedLevels,
  });
}

/**
 * Clear all focused upgrades
 */
export async function clearFocusedUpgrades(): Promise<void> {
  const stations = await db.stations.toArray();
  for (const station of stations) {
    const updatedLevels = station.levels.map((level) => ({
      ...level,
      isFocused: false,
    }));
    await db.stations.update(station.id, {
      levels: updatedLevels,
    });
  }
}

/**
 * Reset all inventory quantities to 0
 */
export async function resetInventory(): Promise<void> {
  const inventory = await db.inventory.toArray();
  for (const item of inventory) {
    await db.inventory.update(item.id, {
      quantityOwned: 0,
    });
  }
}

/**
 * Reset all station levels to 0
 */
export async function resetHideoutLevels(): Promise<void> {
  const stations = await db.stations.toArray();
  for (const station of stations) {
    await db.stations.update(station.id, {
      currentLevel: 0,
    });
  }
}

/**
 * Update trader level
 */
export async function updateTraderLevel(
  traderName: string,
  level: number
): Promise<void> {
  const generalInfo = await db.generalInformation.get("general");
  if (!generalInfo) return;

  const updatedTraders = generalInfo.traders.map((trader) =>
    trader.name === traderName ? { ...trader, level } : trader
  );

  await db.generalInformation.update("general", {
    traders: updatedTraders,
  });
}

/**
 * Update player level
 */
export async function updatePlayerLevel(level: number): Promise<void> {
  await db.generalInformation.update("general", {
    playerLevel: level,
  });
}

/**
 * Purchase an upgrade - updates station level and subtracts items from inventory
 */
export async function purchaseUpgrade(upgrade: StationLevel): Promise<void> {
  // Update station level
  await updateStationLevel(upgrade.stationId, upgrade.level);

  // Update inventory by subtracting item requirements
  for (const req of upgrade.itemRequirements) {
    const item = await db.inventory.where("name").equals(req.itemName).first();
    if (item) {
      const newQuantity = Math.max(0, item.quantityOwned - req.count);
      await db.inventory.update(item.id, {
        quantityOwned: newQuantity,
      });
    }
  }
}

/**
 * Toggle quest completion status
 */
export async function toggleQuestCompletion(taskId: string): Promise<void> {
  const task = await db.tasks.get(taskId);
  if (!task) return;

  await db.tasks.update(taskId, {
    isCompleted: !task.isCompleted,
  });
}

/**
 * Mark multiple quests as completed
 */
export async function markQuestsAsCompleted(taskIds: string[]): Promise<void> {
  for (const taskId of taskIds) {
    await db.tasks.update(taskId, {
      isCompleted: true,
    });
  }
}

/**
 * Add item to watchlist
 */
export async function addToWatchlist(
  itemName: string,
  quantity: number
): Promise<void> {
  const item = await db.inventory.where("name").equals(itemName).first();
  console.log("Item:", item);
  if (!item) {
    throw new Error(`Item "${itemName}" not found in database`);
  }

  const currentQuantity = item.quantityNeeded || 0;
  await db.inventory.update(item.id, {
    isWatchlisted: true,
    quantityNeeded: currentQuantity + quantity,
  });

  const updatedItem = await db.inventory.get(item.id);
  console.log("Updated item:", updatedItem);
}

/**
 * Set watchlist quantity for an item
 */
export async function setWatchlistQuantity(
  itemName: string,
  quantity: number
): Promise<void> {
  const item = await db.inventory.where("name").equals(itemName).first();
  if (!item) return;

  if (quantity <= 0) {
    await db.inventory.update(item.id, {
      isWatchlisted: false,
      quantityNeeded: 0,
    });
  } else {
    await db.inventory.update(item.id, {
      isWatchlisted: true,
      quantityNeeded: quantity,
    });
  }
}

/**
 * Remove item from watchlist
 */
export async function removeFromWatchlist(itemName: string): Promise<void> {
  const item = await db.inventory.where("name").equals(itemName).first();
  if (!item) return;

  await db.inventory.update(item.id, {
    isWatchlisted: false,
    quantityNeeded: 0,
  });
}

/**
 * Add task to watchlist
 */
export async function addTaskToWatchlist(taskId: string): Promise<void> {
  await db.tasks.update(taskId, {
    isWatchlisted: true,
  });
}

/**
 * Remove task from watchlist
 */
export async function removeTaskFromWatchlist(taskId: string): Promise<void> {
  await db.tasks.update(taskId, {
    isWatchlisted: false,
  });
}

/**
 * Update task map position
 * If a position with the same objectiveId already exists, it will be replaced
 */
export async function updateTaskMapPosition(
  taskId: string,
  mapId: string,
  position: { objectiveId?: string; x: number; y: number }
): Promise<void> {
  const task = await db.tasks.get(taskId);
  if (!task) return;

  const mapPositions = task.mapPositions || {};

  if (!mapPositions[mapId]) {
    mapPositions[mapId] = [position];
  } else {
    // Check if a position with the same objectiveId exists
    const existingIndex = mapPositions[mapId].findIndex(
      (p) => p.objectiveId === position.objectiveId
    );
    if (existingIndex !== -1) {
      // Replace existing position
      mapPositions[mapId][existingIndex] = position;
    } else {
      // Add new position
      mapPositions[mapId].push(position);
    }
  }

  await db.tasks.update(taskId, {
    mapPositions,
  });
}

/**
 * Remove task map position
 */
export async function removeTaskMapPosition(
  taskId: string,
  mapId: string
): Promise<void> {
  const task = await db.tasks.get(taskId);
  if (!task?.mapPositions) return;

  const mapPositions = { ...task.mapPositions };
  delete mapPositions[mapId];

  await db.tasks.update(taskId, {
    mapPositions:
      Object.keys(mapPositions).length > 0 ? mapPositions : undefined,
  });
}

/**
 * Remove task map position by objectiveId
 */
export async function removeTaskMapPositionByObjectiveId(
  taskId: string,
  mapId: string,
  objectiveId?: string
): Promise<void> {
  const task = await db.tasks.get(taskId);
  if (!task?.mapPositions) return;

  const mapPositions = { ...task.mapPositions };
  const newMapPositions = mapPositions[mapId].filter(
    (p) => p.objectiveId !== objectiveId || !objectiveId
  );
  if (newMapPositions.length === 0) {
    delete mapPositions[mapId];
  } else {
    mapPositions[mapId] = newMapPositions;
  }

  await db.tasks.update(taskId, {
    mapPositions,
  });
}

/**
 * Update item map position
 */
export async function updateItemMapPosition(
  itemName: string,
  mapId: string,
  position: { x: number; y: number }
): Promise<void> {
  const item = await db.inventory.where("name").equals(itemName).first();
  if (!item) return;

  const mapPositions = item.mapPositions || {};
  mapPositions[mapId] = position;

  await db.inventory.update(item.id, {
    mapPositions,
  });
}

/**
 * Remove item map position
 */
export async function removeItemMapPosition(
  itemName: string,
  mapId: string
): Promise<void> {
  const item = await db.inventory.where("name").equals(itemName).first();
  if (!item?.mapPositions) return;

  const mapPositions = { ...item.mapPositions };
  delete mapPositions[mapId];

  await db.inventory.update(item.id, {
    mapPositions:
      Object.keys(mapPositions).length > 0 ? mapPositions : undefined,
  });
}
