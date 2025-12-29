"use client";

import { useState, useCallback, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/index";
import { getHideoutData, getUserHideoutState } from "@/lib/db/queries";
import { useInventory } from "@/hooks/use-inventory";
import { useQuest } from "@/hooks/use-quest";
import type {
  UserHideoutState,
  TransformedHideoutData,
} from "@/lib/types/hideout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRaidItems } from "./useRaidItems";
import { useSelectedTasks } from "./useSelectedTasks";
import { useRaidData } from "./useRaidData";
import { calculateRaidSummary } from "./calculateRaidSummary";
import { RaidFormView } from "./RaidFormView";
import { RaidSummaryView } from "./RaidSummaryView";
import type { RaidSummary } from "./types";

export function RecordRaidDialog() {
  const [open, setOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<RaidSummary | null>(null);

  const { inventory, setInventoryQuantity } = useInventory();
  const { allTasks, markQuestsAsCompleted } = useQuest();

  // Query stations and general info for userState reconstruction
  const stations = useLiveQuery(() => db.stations.toArray(), []);
  const generalInfo = useLiveQuery(
    () => db.generalInformation.get("general"),
    []
  );
  const inventoryRecords = useLiveQuery(() => db.inventory.toArray(), []);

  // Get hideout data
  const hideoutData = useLiveQuery(async () => {
    if (!stations) return null;
    return await getHideoutData();
  }, [stations]) as TransformedHideoutData | null;

  // Reconstruct userState from individual hooks and queries
  const userState = useMemo((): UserHideoutState | null => {
    if (!stations || !generalInfo || !inventoryRecords || !allTasks)
      return null;

    // Build stationLevels map
    const stationLevels: Record<string, number> = {};
    for (const station of stations) {
      if (station.currentLevel > 0) {
        stationLevels[station.id] = station.currentLevel;
      }
    }

    // Build traderLevels map
    const traderLevels: Record<string, number> = {};
    if (generalInfo.traders) {
      for (const trader of generalInfo.traders) {
        if (trader.level > 0) {
          traderLevels[trader.name] = trader.level;
        }
      }
    }

    // Build completedQuests array from allTasks
    const completedQuestsArray = allTasks
      .filter((t) => t.isCompleted)
      .map((t) => t.id);

    // Build watchlist map
    const watchlist: Record<string, number> = {};
    for (const item of inventoryRecords) {
      if (item.isWatchlisted && item.quantityNeeded > 0) {
        watchlist[item.name] = item.quantityNeeded;
      }
    }

    return {
      stationLevels,
      inventory,
      focusedUpgrades: [], // Not needed for calculateRaidSummary
      traderLevels,
      completedQuests: completedQuestsArray,
      watchlist: Object.keys(watchlist).length > 0 ? watchlist : undefined,
      taskWatchlist: undefined, // Not needed for calculateRaidSummary
      playerLevel: generalInfo.playerLevel ?? 1,
    };
  }, [stations, generalInfo, inventoryRecords, inventory, allTasks]);

  // Custom hooks
  const { items, tasks, isLoadingItems } = useRaidData(open);
  const { raidItems, addItem, removeItem, updateItem, getComboboxRef } =
    useRaidItems(!open);
  const {
    selectedTasks,
    addTask,
    removeTask,
    toggleTaskCompletion,
    getCompletedTaskIds,
  } = useSelectedTasks(!open);

  // Calculate summary
  const calculateSummary = useCallback((): RaidSummary | null => {
    if (!userState || !hideoutData) return null;
    return calculateRaidSummary(
      raidItems,
      selectedTasks,
      userState,
      hideoutData
    );
  }, [raidItems, selectedTasks, userState, hideoutData]);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    const calculatedSummary = calculateSummary();

    // Update inventory for each item
    raidItems.forEach((raidItem) => {
      if (raidItem.item && raidItem.quantity > 0) {
        const currentQuantity = inventory[raidItem.item.name] || 0;
        setInventoryQuantity(
          raidItem.item.name,
          currentQuantity + raidItem.quantity
        );
      }
    });

    // Mark completed tasks
    const completedTaskIds = getCompletedTaskIds();
    if (completedTaskIds.length > 0) {
      markQuestsAsCompleted(completedTaskIds);
    }

    // Show summary screen
    if (calculatedSummary) {
      setSummary(calculatedSummary);
      setShowSummary(true);
    } else {
      setOpen(false);
    }
  }, [
    raidItems,
    inventory,
    setInventoryQuantity,
    calculateSummary,
    getCompletedTaskIds,
    markQuestsAsCompleted,
  ]);

  const hasValidItems = raidItems.some(
    (raidItem) => raidItem.item && raidItem.quantity > 0
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Record Raid</Button>} />
      <DialogContent size="lg" className="max-h-[90vh] flex flex-col max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {showSummary ? "Raid Summary" : "Record Raid"}
          </DialogTitle>
          <DialogDescription>
            {showSummary
              ? "Here's how this raid progressed your hideout and watchlist."
              : "Record items collected from your raid. Add items and quantities to update your inventory."}
          </DialogDescription>
        </DialogHeader>

        {showSummary && summary ? (
          <RaidSummaryView summary={summary} />
        ) : (
          <RaidFormView
            isLoadingItems={isLoadingItems}
            items={items}
            tasks={tasks}
            raidItems={raidItems}
            selectedTasks={selectedTasks}
            playerLevel={userState?.playerLevel || 1}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
            onTaskSelect={addTask}
            onTaskToggle={toggleTaskCompletion}
            onTaskRemove={removeTask}
            getComboboxRef={getComboboxRef}
          />
        )}

        <DialogFooter>
          {showSummary ? (
            <Button onClick={() => setOpen(false)}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!hasValidItems}>
                Record Raid
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
