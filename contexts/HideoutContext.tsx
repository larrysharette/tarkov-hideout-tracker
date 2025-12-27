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

const STORAGE_KEY = "tarkov-hideout-state";
const STORAGE_VERSION = 1;

export interface StoredState {
  version: number;
  userState: UserHideoutState;
}

const defaultUserState: UserHideoutState = {
  stationLevels: {},
  inventory: {},
  focusedUpgrades: [],
  traderLevels: {},
  completedQuests: [],
  watchlist: {},
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

  // Load hideout data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch both hideout and traders data in parallel
        const [hideoutResponse, tradersResponse] = await Promise.all([
          fetch("/api/hideout"),
          fetch("/api/traders"),
        ]);

        if (!hideoutResponse.ok) {
          throw new Error(
            `Failed to fetch hideout: ${hideoutResponse.statusText}`
          );
        }

        if (!tradersResponse.ok) {
          throw new Error(
            `Failed to fetch traders: ${tradersResponse.statusText}`
          );
        }

        const hideoutData = await hideoutResponse.json();
        const tradersData = await tradersResponse.json();

        // Convert object back to Map
        const transformedHideoutData: TransformedHideoutData = {
          stations: hideoutData.stations,
          stationLevelsMap: new Map(
            Object.entries(hideoutData.stationLevelsMap)
          ),
        };
        setHideoutData(transformedHideoutData);
        setTradersData(tradersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Load user state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredState = JSON.parse(stored);
        // Check version for future migrations
        if (parsed.version === STORAGE_VERSION && parsed.userState) {
          setUserState(parsed.userState);
        }
      }
    } catch (err) {
      console.error("Error loading state from localStorage:", err);
    }
  }, []);

  // Save user state to localStorage whenever it changes
  useEffect(() => {
    try {
      const stateToStore: StoredState = {
        version: STORAGE_VERSION,
        userState,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
    } catch (err) {
      console.error("Error saving state to localStorage:", err);
    }
  }, [userState]);

  // Actions
  const setStationLevel = useCallback((stationId: string, level: number) => {
    setUserState((prev) => ({
      ...prev,
      stationLevels: {
        ...prev.stationLevels,
        [stationId]: level,
      },
    }));
  }, []);

  const setInventoryQuantity = useCallback(
    (itemName: string, quantity: number) => {
      setUserState((prev) => ({
        ...prev,
        inventory: {
          ...prev.inventory,
          [itemName]: Math.max(0, quantity), // Ensure non-negative
        },
      }));
    },
    []
  );

  const toggleFocusedUpgrade = useCallback(
    (stationId: string, level: number) => {
      setUserState((prev) => {
        const key = getUpgradeKey(stationId, level);
        const focused = new Set(prev.focusedUpgrades);

        if (focused.has(key)) {
          focused.delete(key);
        } else {
          focused.add(key);
        }

        return {
          ...prev,
          focusedUpgrades: Array.from(focused),
        };
      });
    },
    []
  );

  const clearFocusedUpgrades = useCallback(() => {
    setUserState((prev) => ({
      ...prev,
      focusedUpgrades: [],
    }));
  }, []);

  const resetInventory = useCallback(() => {
    setUserState((prev) => ({
      ...prev,
      inventory: {},
    }));
  }, []);

  const resetHideoutLevels = useCallback(() => {
    setUserState((prev) => ({
      ...prev,
      stationLevels: {},
    }));
  }, []);

  const setTraderLevel = useCallback((traderName: string, level: number) => {
    setUserState((prev) => ({
      ...prev,
      traderLevels: {
        ...(prev.traderLevels || {}),
        [traderName]: level,
      },
    }));
  }, []);

  const setPlayerLevel = useCallback((level: number) => {
    setUserState((prev) => ({
      ...prev,
      playerLevel: level,
    }));
  }, []);

  const purchaseUpgrade = useCallback((upgrade: StationLevel) => {
    setUserState((prev) => {
      // Update station level
      const updatedStationLevels = {
        ...prev.stationLevels,
        [upgrade.stationId]: upgrade.level,
      };

      // Update inventory by subtracting item requirements
      const updatedInventory = { ...prev.inventory };
      for (const req of upgrade.itemRequirements) {
        const currentQuantity = updatedInventory[req.itemName] || 0;
        const newQuantity = Math.max(0, currentQuantity - req.count);
        if (newQuantity > 0) {
          updatedInventory[req.itemName] = newQuantity;
        } else {
          // Remove item from inventory if quantity is 0
          delete updatedInventory[req.itemName];
        }
      }

      return {
        ...prev,
        stationLevels: updatedStationLevels,
        inventory: updatedInventory,
      };
    });
  }, []);

  const toggleQuestCompletion = useCallback((questId: string) => {
    setUserState((prev) => {
      const completedQuests = new Set(prev.completedQuests || []);
      if (completedQuests.has(questId)) {
        completedQuests.delete(questId);
      } else {
        completedQuests.add(questId);
      }
      return {
        ...prev,
        completedQuests: Array.from(completedQuests),
      };
    });
  }, []);

  const markQuestsAsCompleted = useCallback((questIds: string[]) => {
    setUserState((prev) => {
      const completedQuests = new Set(prev.completedQuests || []);
      questIds.forEach((questId) => {
        completedQuests.add(questId);
      });
      return {
        ...prev,
        completedQuests: Array.from(completedQuests),
      };
    });
  }, []);

  const addToWatchlist = useCallback((itemName: string, quantity: number) => {
    setUserState((prev) => {
      const currentQuantity = prev.watchlist?.[itemName] || 0;
      return {
        ...prev,
        watchlist: {
          ...(prev.watchlist || {}),
          [itemName]: currentQuantity + quantity,
        },
      };
    });
  }, []);

  const setWatchlistQuantity = useCallback(
    (itemName: string, quantity: number) => {
      setUserState((prev) => {
        if (quantity <= 0) {
          const watchlist = { ...(prev.watchlist || {}) };
          delete watchlist[itemName];
          return {
            ...prev,
            watchlist:
              Object.keys(watchlist).length > 0 ? watchlist : undefined,
          };
        }
        return {
          ...prev,
          watchlist: {
            ...(prev.watchlist || {}),
            [itemName]: quantity,
          },
        };
      });
    },
    []
  );

  const removeFromWatchlist = useCallback((itemName: string) => {
    setUserState((prev) => {
      const watchlist = { ...(prev.watchlist || {}) };
      delete watchlist[itemName];
      return {
        ...prev,
        watchlist: Object.keys(watchlist).length > 0 ? watchlist : undefined,
      };
    });
  }, []);

  const isInWatchlist = useCallback(
    (itemName: string) => {
      return (userState.watchlist?.[itemName] || 0) > 0;
    },
    [userState.watchlist]
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
