"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type {
  HideoutContextValue,
  TransformedHideoutData,
  TransformedTradersData,
  UserHideoutState,
  ItemSummary,
  StationLevel,
} from "@/lib/types/hideout";
import {
  getAvailableUpgrades,
  getFocusedUpgrades,
  calculateItemSummary,
} from "@/lib/utils/hideout-calculations";
import { getUpgradeKey } from "@/lib/utils/hideout-data";
import { syncAllData, syncHideoutData, syncTradersData } from "@/lib/db/sync";
import {
  getHideoutData,
  getTradersData,
  getUserHideoutState,
} from "@/lib/db/queries";
import {
  updateStationLevel,
  updateInventoryQuantity,
  toggleFocusedUpgrade as toggleFocusedUpgradeDb,
  clearFocusedUpgrades as clearFocusedUpgradesDb,
  resetInventory as resetInventoryDb,
  resetHideoutLevels as resetHideoutLevelsDb,
  updateTraderLevel,
  updatePlayerLevel,
  purchaseUpgrade as purchaseUpgradeDb,
  toggleQuestCompletion as toggleQuestCompletionDb,
  markQuestsAsCompleted as markQuestsAsCompletedDb,
  addToWatchlist as addToWatchlistDb,
  setWatchlistQuantity as setWatchlistQuantityDb,
  removeFromWatchlist as removeFromWatchlistDb,
  addTaskToWatchlist as addTaskToWatchlistDb,
  removeTaskFromWatchlist as removeTaskFromWatchlistDb,
} from "@/lib/db/updates";

const defaultUserState: UserHideoutState = {
  stationLevels: {},
  inventory: {},
  focusedUpgrades: [],
  traderLevels: {},
  completedQuests: [],
  watchlist: {},
  taskWatchlist: [],
  playerLevel: 1,
};

const HideoutContext = createContext<HideoutContextValue | null>(null);

export function HideoutProvider({ children }: { children: React.ReactNode }) {
  const [hideoutData, setHideoutData] = useState<TransformedHideoutData | null>(
    null
  );
  const [tradersData, setTradersData] = useState<TransformedTradersData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userState, setUserState] =
    useState<UserHideoutState>(defaultUserState);

  // Load data from Dexie on mount and sync from API in background
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        // First, try to load from Dexie (fast)
        const [hideoutDataFromDb, tradersDataFromDb, userStateFromDb] =
          await Promise.all([
            getHideoutData(),
            getTradersData(),
            getUserHideoutState(),
          ]);

        if (hideoutDataFromDb) {
          setHideoutData(hideoutDataFromDb);
        }
        if (tradersDataFromDb) {
          setTradersData(tradersDataFromDb);
        }
        if (userStateFromDb) {
          setUserState(userStateFromDb);
        }

        setIsLoading(false);

        // Then sync from API in the background (updates Dexie without overwriting user data)
        syncAllData()
          .then(async () => {
            // Reload data from Dexie after sync
            const [updatedHideoutData, updatedTradersData, updatedUserState] =
              await Promise.all([
                getHideoutData(),
                getTradersData(),
                getUserHideoutState(),
              ]);

            if (updatedHideoutData) {
              setHideoutData(updatedHideoutData);
            }
            if (updatedTradersData) {
              setTradersData(updatedTradersData);
            }
            if (updatedUserState) {
              setUserState(updatedUserState);
            }
          })
          .catch((err) => {
            console.error("Error syncing data in background:", err);
            // Don't set error state for background sync failures
          });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Error loading data:", err);
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Periodically sync data from API in the background (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await syncAllData();
        // Reload data after sync
        const [updatedHideoutData, updatedTradersData, updatedUserState] =
          await Promise.all([
            getHideoutData(),
            getTradersData(),
            getUserHideoutState(),
          ]);

        if (updatedHideoutData) {
          setHideoutData(updatedHideoutData);
        }
        if (updatedTradersData) {
          setTradersData(updatedTradersData);
        }
        if (updatedUserState) {
          setUserState(updatedUserState);
        }
      } catch (err) {
        console.error("Error in background sync:", err);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Actions - all now update Dexie and then refresh state
  const setStationLevel = useCallback(
    async (stationId: string, level: number) => {
      try {
        await updateStationLevel(stationId, level);
        const updatedUserState = await getUserHideoutState();
        setUserState(updatedUserState);
      } catch (err) {
        console.error("Error updating station level:", err);
      }
    },
    []
  );

  const setInventoryQuantity = useCallback(
    async (itemName: string, quantity: number) => {
      try {
        await updateInventoryQuantity(itemName, quantity);
        const updatedUserState = await getUserHideoutState();
        setUserState(updatedUserState);
      } catch (err) {
        console.error("Error updating inventory quantity:", err);
      }
    },
    []
  );

  const toggleFocusedUpgrade = useCallback(
    async (stationId: string, level: number) => {
      try {
        await toggleFocusedUpgradeDb(stationId, level);
        const updatedUserState = await getUserHideoutState();
        setUserState(updatedUserState);
      } catch (err) {
        console.error("Error toggling focused upgrade:", err);
      }
    },
    []
  );

  const clearFocusedUpgrades = useCallback(async () => {
    try {
      await clearFocusedUpgradesDb();
      const updatedUserState = await getUserHideoutState();
      setUserState(updatedUserState);
    } catch (err) {
      console.error("Error clearing focused upgrades:", err);
    }
  }, []);

  const resetInventory = useCallback(async () => {
    try {
      await resetInventoryDb();
      const updatedUserState = await getUserHideoutState();
      setUserState(updatedUserState);
    } catch (err) {
      console.error("Error resetting inventory:", err);
    }
  }, []);

  const resetHideoutLevels = useCallback(async () => {
    try {
      await resetHideoutLevelsDb();
      const updatedUserState = await getUserHideoutState();
      setUserState(updatedUserState);
    } catch (err) {
      console.error("Error resetting hideout levels:", err);
    }
  }, []);

  const setTraderLevel = useCallback(
    async (traderName: string, level: number) => {
      try {
        await updateTraderLevel(traderName, level);
        const updatedUserState = await getUserHideoutState();
        setUserState(updatedUserState);
      } catch (err) {
        console.error("Error updating trader level:", err);
      }
    },
    []
  );

  const setPlayerLevel = useCallback(async (level: number) => {
    try {
      await updatePlayerLevel(level);
      const updatedUserState = await getUserHideoutState();
      setUserState(updatedUserState);
    } catch (err) {
      console.error("Error updating player level:", err);
    }
  }, []);

  const purchaseUpgrade = useCallback(async (upgrade: StationLevel) => {
    try {
      await purchaseUpgradeDb(upgrade);
      const updatedUserState = await getUserHideoutState();
      setUserState(updatedUserState);
    } catch (err) {
      console.error("Error purchasing upgrade:", err);
    }
  }, []);

  const toggleQuestCompletion = useCallback(async (questId: string) => {
    try {
      await toggleQuestCompletionDb(questId);
      const updatedUserState = await getUserHideoutState();
      setUserState(updatedUserState);
    } catch (err) {
      console.error("Error toggling quest completion:", err);
    }
  }, []);

  const markQuestsAsCompleted = useCallback(async (questIds: string[]) => {
    try {
      await markQuestsAsCompletedDb(questIds);
      const updatedUserState = await getUserHideoutState();
      setUserState(updatedUserState);
    } catch (err) {
      console.error("Error marking quests as completed:", err);
    }
  }, []);

  const addToWatchlist = useCallback(
    async (itemName: string, quantity: number) => {
      try {
        await addToWatchlistDb(itemName, quantity);
        const updatedUserState = await getUserHideoutState();
        setUserState(updatedUserState);
      } catch (err) {
        console.error("Error adding to watchlist:", err);
      }
    },
    []
  );

  const setWatchlistQuantity = useCallback(
    async (itemName: string, quantity: number) => {
      try {
        await setWatchlistQuantityDb(itemName, quantity);
        const updatedUserState = await getUserHideoutState();
        setUserState(updatedUserState);
      } catch (err) {
        console.error("Error setting watchlist quantity:", err);
      }
    },
    []
  );

  const removeFromWatchlist = useCallback(async (itemName: string) => {
    try {
      await removeFromWatchlistDb(itemName);
      const updatedUserState = await getUserHideoutState();
      setUserState(updatedUserState);
    } catch (err) {
      console.error("Error removing from watchlist:", err);
    }
  }, []);

  const isInWatchlist = useCallback(
    (itemName: string) => {
      return (userState.watchlist?.[itemName] || 0) > 0;
    },
    [userState.watchlist]
  );

  const addTaskToWatchlist = useCallback(async (taskId: string) => {
    try {
      await addTaskToWatchlistDb(taskId);
      const updatedUserState = await getUserHideoutState();
      setUserState(updatedUserState);
    } catch (err) {
      console.error("Error adding task to watchlist:", err);
    }
  }, []);

  const removeTaskFromWatchlist = useCallback(async (taskId: string) => {
    try {
      await removeTaskFromWatchlistDb(taskId);
      const updatedUserState = await getUserHideoutState();
      setUserState(updatedUserState);
    } catch (err) {
      console.error("Error removing task from watchlist:", err);
    }
  }, []);

  const isTaskInWatchlist = useCallback(
    (taskId: string) => {
      return (userState.taskWatchlist || []).includes(taskId);
    },
    [userState.taskWatchlist]
  );

  // Computed values
  const getItemSummary = useCallback((): ItemSummary[] => {
    if (!hideoutData) return [];
    return calculateItemSummary(hideoutData, userState);
  }, [hideoutData, userState]);

  const getAvailableUpgradesMemo = useMemo((): StationLevel[] => {
    if (!hideoutData) return [];
    return getAvailableUpgrades(hideoutData, userState);
  }, [hideoutData, userState]);

  const getFocusedUpgradesMemo = useMemo((): StationLevel[] => {
    if (!hideoutData) return [];
    return getFocusedUpgrades(hideoutData, userState);
  }, [hideoutData, userState]);

  const contextValue: HideoutContextValue = {
    hideoutData,
    tradersData,
    isLoading,
    error,
    userState,
    setStationLevel,
    setInventoryQuantity,
    toggleFocusedUpgrade,
    clearFocusedUpgrades,
    resetInventory,
    resetHideoutLevels,
    setTraderLevel,
    setPlayerLevel,
    purchaseUpgrade,
    toggleQuestCompletion,
    markQuestsAsCompleted,
    addToWatchlist,
    setWatchlistQuantity,
    removeFromWatchlist,
    isInWatchlist,
    addTaskToWatchlist,
    removeTaskFromWatchlist,
    isTaskInWatchlist,
    getItemSummary,
    getAvailableUpgrades: () => getAvailableUpgradesMemo,
    getFocusedUpgrades: () => getFocusedUpgradesMemo,
  };

  return (
    <HideoutContext.Provider value={contextValue}>
      {children}
    </HideoutContext.Provider>
  );
}

export function useHideout() {
  const context = useContext(HideoutContext);
  if (!context) {
    throw new Error("useHideout must be used within HideoutProvider");
  }
  return context;
}
