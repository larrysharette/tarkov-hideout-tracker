import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useMemo } from "react";

import { db } from "@/lib/db/index";
import type { InventoryRecord } from "@/lib/db/types";
import {
  addToWatchlist as addToWatchlistDb,
  removeFromWatchlist as removeFromWatchlistDb,
  setWatchlistQuantity as setWatchlistQuantityDb,
  updateInventoryQuantity,
} from "@/lib/db/updates";

const CURRENCY_ITEMS = new Set([
  "Roubles",
  "Euros",
  "Dollars",
  "USD",
  "US Dollars",
]);

/**
 * Hook for inventory management
 * Queries inventory items and quantities from Dexie
 */
export function useInventory() {
  // Query all inventory items from Dexie
  const inventoryRecords = useLiveQuery(() => db.inventory.toArray(), []);

  // Get inventory as a record (itemName -> quantity)
  const inventory = useMemo((): Record<string, number> => {
    if (!inventoryRecords) return {};
    const inv: Record<string, number> = {};
    for (const record of inventoryRecords) {
      if (record.quantityOwned > 0) {
        inv[record.name] = record.quantityOwned;
      }
    }
    return inv;
  }, [inventoryRecords]);

  // Get all inventory items with full data
  const inventoryItems = useMemo((): InventoryRecord[] => {
    if (!inventoryRecords) return [];
    return inventoryRecords.filter(
      (item) => item.quantityOwned > 0 && !CURRENCY_ITEMS.has(item.name)
    );
  }, [inventoryRecords]);

  // Get currency amounts
  const currencies = useMemo(() => {
    if (!inventoryRecords) return { roubles: 0, euros: 0, dollars: 0 };

    const roubles =
      inventoryRecords.find((r) => r.name === "Roubles")?.quantityOwned || 0;
    const euros =
      inventoryRecords.find((r) => r.name === "Euros")?.quantityOwned || 0;
    const dollars =
      inventoryRecords.find((r) => r.name === "Dollars")?.quantityOwned ||
      inventoryRecords.find((r) => r.name === "USD")?.quantityOwned ||
      inventoryRecords.find((r) => r.name === "US Dollars")?.quantityOwned ||
      0;

    return { roubles, euros, dollars };
  }, [inventoryRecords]);

  // Get item by name
  const getItem = useCallback(
    (itemName: string): InventoryRecord | undefined => {
      if (!inventoryRecords) return undefined;
      return inventoryRecords.find((item) => item.name === itemName);
    },
    [inventoryRecords]
  );

  // Get quantity for a specific item
  const getQuantity = useCallback(
    (itemName: string): number => {
      const item = getItem(itemName);
      return item?.quantityOwned ?? 0;
    },
    [getItem]
  );

  // Check if item is in watchlist
  const isInWatchlist = useCallback(
    (itemName: string): boolean => {
      const item = getItem(itemName);
      return item?.isWatchlisted ?? false;
    },
    [getItem]
  );

  // Update inventory quantity
  const setInventoryQuantity = useCallback(
    async (itemName: string, quantity: number) => {
      try {
        await updateInventoryQuantity(itemName, quantity);
      } catch (err) {
        console.error("Error updating inventory quantity:", err);
        throw err;
      }
    },
    []
  );

  // Add to watchlist
  const addToWatchlist = useCallback(
    async (itemName: string, quantity: number) => {
      try {
        console.log("Adding to watchlist:", itemName, quantity);
        await addToWatchlistDb(itemName, quantity);
      } catch (err) {
        console.error("Error adding to watchlist:", err);
        throw err;
      }
    },
    []
  );

  // Remove from watchlist
  const removeFromWatchlist = useCallback(async (itemName: string) => {
    try {
      await removeFromWatchlistDb(itemName);
    } catch (err) {
      console.error("Error removing from watchlist:", err);
      throw err;
    }
  }, []);

  // Set watchlist quantity
  const setWatchlistQuantity = useCallback(
    async (itemName: string, quantity: number) => {
      try {
        await setWatchlistQuantityDb(itemName, quantity);
      } catch (err) {
        console.error("Error setting watchlist quantity:", err);
        throw err;
      }
    },
    []
  );

  const updateCurrencies = useCallback(
    async (roubles: number, euros: number, dollars: number) => {
      try {
        await updateInventoryQuantity("Roubles", roubles);
        await updateInventoryQuantity("Euros", euros);
        await updateInventoryQuantity("Dollars", dollars);
      } catch (err) {
        console.error("Error updating currencies:", err);
        throw err;
      }
    },
    []
  );

  return {
    inventory,
    inventoryItems,
    inventoryRecords,
    currencies,
    getItem,
    getQuantity,
    isInWatchlist,
    setInventoryQuantity,
    addToWatchlist,
    removeFromWatchlist,
    setWatchlistQuantity,
    updateCurrencies,
    isLoading: inventoryRecords === undefined,
  };
}
