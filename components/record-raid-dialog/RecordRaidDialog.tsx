"use client";

import { useState, useCallback } from "react";
import { useHideout } from "@/contexts/HideoutContext";
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

  const {
    setInventoryQuantity,
    userState,
    hideoutData,
    markQuestsAsCompleted,
  } = useHideout();

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
        const currentQuantity = userState.inventory[raidItem.item.name] || 0;
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
    setInventoryQuantity,
    userState.inventory,
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
            playerLevel={userState.playerLevel || 1}
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
