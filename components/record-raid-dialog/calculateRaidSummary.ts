import type {
  RaidItem,
  RaidSummary,
  SelectedTask,
} from "./types";
import type { UserHideoutState, TransformedHideoutData } from "@/lib/types/hideout";
import {
  getUnpurchasedUpgrades,
  getUnmetRequirements,
} from "@/lib/utils/hideout-calculations";

export function calculateRaidSummary(
  raidItems: RaidItem[],
  selectedTasks: Map<string, SelectedTask>,
  userState: UserHideoutState,
  hideoutData: TransformedHideoutData | null
): RaidSummary | null {
  if (!hideoutData) return null;

  // Get all unpurchased upgrades (regardless of lock status)
  const unpurchasedUpgrades = getUnpurchasedUpgrades(hideoutData, userState);

  // Create a map of items being added
  const itemsBeingAdded = new Map<string, number>();
  raidItems.forEach((raidItem) => {
    if (raidItem.item && raidItem.quantity > 0) {
      const current = itemsBeingAdded.get(raidItem.item.name) || 0;
      itemsBeingAdded.set(raidItem.item.name, current + raidItem.quantity);
    }
  });

  // Find upgrades that use any of the items being added
  const hideoutProgress: RaidSummary["hideoutProgress"] = [];
  for (const upgrade of unpurchasedUpgrades) {
    const itemsAdded: RaidSummary["hideoutProgress"][0]["itemsAdded"] = [];

    // Check each item requirement of this upgrade
    for (const itemReq of upgrade.itemRequirements) {
      const quantityAdded = itemsBeingAdded.get(itemReq.itemName);
      if (quantityAdded && quantityAdded > 0) {
        const previousOwned = userState.inventory[itemReq.itemName] || 0;
        const newOwned = previousOwned + quantityAdded;
        itemsAdded.push({
          itemName: itemReq.itemName,
          quantityAdded,
          requiredTotal: itemReq.count,
          previousOwned,
          newOwned,
        });
      }
    }

    // Only include upgrades that have at least one matching item
    if (itemsAdded.length > 0) {
      // Check if upgrade is locked (has unmet requirements)
      const unmet = getUnmetRequirements(upgrade, userState);
      const isLocked =
        unmet.stationRequirements.length > 0 ||
        unmet.traderRequirements.length > 0;

      hideoutProgress.push({
        upgrade,
        itemsAdded,
        isLocked,
      });
    }
  }

  // Calculate watchlist progress
  const watchlistProgress: RaidSummary["watchlistProgress"] = [];
  const watchlist = userState.watchlist || {};
  raidItems.forEach((raidItem) => {
    if (raidItem.item && raidItem.quantity > 0) {
      const itemName = raidItem.item.name;
      const watchlistTarget = watchlist[itemName];
      if (watchlistTarget && watchlistTarget > 0) {
        const previousOwned = userState.inventory[itemName] || 0;
        const newOwned = previousOwned + raidItem.quantity;
        const progress = Math.min(newOwned, watchlistTarget);
        watchlistProgress.push({
          itemName,
          previousOwned,
          newOwned,
          watchlistTarget,
          progress,
        });
      }
    }
  });

  // Get completed tasks from selected tasks
  const completedTasks = Array.from(selectedTasks.values())
    .filter((st) => st.completed)
    .map((st) => st.task);

  return {
    hideoutProgress,
    watchlistProgress,
    completedTasks,
  };
}

