import type {
  StationLevel,
  UserHideoutState,
  ItemSummary,
  TransformedHideoutData,
} from "@/lib/types/hideout";
import {
  getUpgradeKey,
  getAllUniqueItems,
  getAllStationLevels,
} from "./hideout-data";

/**
 * Get unmet requirements for an upgrade
 */
export function getUnmetRequirements(
  upgrade: StationLevel,
  userState: UserHideoutState
): {
  stationRequirements: Array<{
    requirement: { stationId: string; stationName: string; level: number };
    currentLevel: number;
  }>;
  traderRequirements: Array<{
    requirement: { traderName: string; level: number };
    currentLevel: number;
  }>;
} {
  const unmetStationRequirements: Array<{
    requirement: StationLevel["stationRequirements"][0];
    currentLevel: number;
  }> = [];
  const unmetTraderRequirements: Array<{
    requirement: StationLevel["traderRequirements"][0];
    currentLevel: number;
  }> = [];

  // Check station requirements
  for (const req of upgrade.stationRequirements) {
    const userLevel = userState.stationLevels[req.stationId] || 0;
    if (userLevel < req.level) {
      unmetStationRequirements.push({
        requirement: req,
        currentLevel: userLevel,
      });
    }
  }

  // Check trader requirements
  for (const req of upgrade.traderRequirements) {
    const userTraderLevel = userState.traderLevels?.[req.traderName] || 0;
    if (userTraderLevel < req.level) {
      unmetTraderRequirements.push({
        requirement: req,
        currentLevel: userTraderLevel,
      });
    }
  }

  return {
    stationRequirements: unmetStationRequirements,
    traderRequirements: unmetTraderRequirements,
  };
}

/**
 * Check if an upgrade is available based on user's current hideout state
 */
export function isUpgradeAvailable(
  upgrade: StationLevel,
  userState: UserHideoutState
): boolean {
  const unmet = getUnmetRequirements(upgrade, userState);
  return (
    unmet.stationRequirements.length === 0 &&
    unmet.traderRequirements.length === 0
  );
}

/**
 * Get all upgrades that are currently available to the user based on requirements
 * - Requirements must be met (station levels, trader levels)
 * - Excludes upgrades that have already been purchased (user's station level >= upgrade level)
 */
export function getAvailableUpgrades(
  data: TransformedHideoutData,
  userState: UserHideoutState
): StationLevel[] {
  const allLevels = getAllStationLevels(data);
  return allLevels.filter((level) => {
    // Check if requirements are met (station and trader requirements)
    if (!isUpgradeAvailable(level, userState)) {
      return false;
    }

    // Check if this upgrade has already been purchased
    // If user's current station level >= upgrade level, it's already done
    const userCurrentLevel = userState.stationLevels[level.stationId] || 0;
    if (userCurrentLevel >= level.level) {
      return false;
    }

    return true;
  });
}

/**
 * Get focused upgrades from user state
 */
export function getFocusedUpgrades(
  data: TransformedHideoutData,
  userState: UserHideoutState
): StationLevel[] {
  const focused: StationLevel[] = [];

  for (const key of userState.focusedUpgrades) {
    const level = data.stationLevelsMap.get(key);
    if (level) {
      focused.push(level);
    }
  }

  return focused;
}

/**
 * Aggregate item counts across multiple upgrades
 */
export function aggregateItemCounts(
  upgrades: StationLevel[]
): Map<string, number> {
  const itemCounts = new Map<string, number>();

  for (const upgrade of upgrades) {
    for (const itemReq of upgrade.itemRequirements) {
      const current = itemCounts.get(itemReq.itemName) || 0;
      itemCounts.set(itemReq.itemName, current + itemReq.count);
    }
  }

  return itemCounts;
}

/**
 * Get all upgrades that haven't been purchased yet (regardless of requirements)
 */
export function getUnpurchasedUpgrades(
  data: TransformedHideoutData,
  userState: UserHideoutState
): StationLevel[] {
  const allLevels = getAllStationLevels(data);
  return allLevels.filter((level) => {
    const userCurrentLevel = userState.stationLevels[level.stationId] || 0;
    return userCurrentLevel < level.level;
  });
}

/**
 * Calculate item summary for all items
 * Only includes items from upgrades that haven't been purchased yet
 */
export function calculateItemSummary(
  data: TransformedHideoutData,
  userState: UserHideoutState
): ItemSummary[] {
  // Get all unpurchased upgrades first
  const unpurchasedUpgrades = getUnpurchasedUpgrades(data, userState);

  // Get all unique items from unpurchased upgrades only
  const allItems = new Set<string>();
  for (const upgrade of unpurchasedUpgrades) {
    for (const itemReq of upgrade.itemRequirements) {
      allItems.add(itemReq.itemName);
    }
  }

  const summaries: ItemSummary[] = [];

  // Get all unpurchased upgrades (regardless of requirements)
  const allUnpurchasedUpgrades = getUnpurchasedUpgrades(data, userState);

  // Get focused upgrades (filtered to only unpurchased)
  const focusedUpgrades = getFocusedUpgrades(data, userState).filter(
    (upgrade) => {
      const userCurrentLevel = userState.stationLevels[upgrade.stationId] || 0;
      return userCurrentLevel < upgrade.level;
    }
  );

  // Get non-focused unpurchased upgrades (all unpurchased minus focused)
  const nonFocusedUnpurchased = allUnpurchasedUpgrades.filter(
    (upgrade) =>
      !userState.focusedUpgrades.includes(
        getUpgradeKey(upgrade.stationId, upgrade.level)
      )
  );

  // Aggregate item counts
  // "Required Now" = items from focused unpurchased upgrades
  const focusedItemCounts = aggregateItemCounts(focusedUpgrades);
  // "Will Need" = items from non-focused unpurchased upgrades (all unpurchased, not just available)
  const willNeedItemCounts = aggregateItemCounts(nonFocusedUnpurchased);
  // "Total Required" = items from all unpurchased upgrades (regardless of requirements)
  const totalItemCounts = aggregateItemCounts(allUnpurchasedUpgrades);

  // Build summaries
  for (const itemName of allItems) {
    const requiredNow = focusedItemCounts.get(itemName) || 0;
    const willNeed = willNeedItemCounts.get(itemName) || 0;
    const totalRequired = totalItemCounts.get(itemName) || 0;
    const owned = userState.inventory[itemName] || 0;
    const remaining = Math.max(0, requiredNow - owned);

    summaries.push({
      itemName,
      requiredNow,
      willNeed,
      totalRequired,
      owned,
      remaining,
    });
  }

  // Sort by remaining (descending), then by requiredNow (descending)
  summaries.sort((a, b) => {
    if (b.remaining !== a.remaining) {
      return b.remaining - a.remaining;
    }
    return b.requiredNow - a.requiredNow;
  });

  return summaries;
}

/**
 * Calculate remaining items needed (Required Now - Owned)
 */
export function calculateRemainingItems(
  requiredNow: number,
  owned: number
): number {
  return Math.max(0, requiredNow - owned);
}
