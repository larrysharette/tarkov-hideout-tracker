import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

import { db } from "@/lib/db/index";
import { updatePlayerLevel, updateTraderLevel } from "@/lib/db/updates";

/**
 * Hook for player information (level, trader levels)
 * Queries general information from Dexie
 */
export function usePlayerInfo() {
  // Query general information
  const generalInfo = useLiveQuery(() => db.generalInformation.get("general"), []);

  // Get player level
  const playerLevel = useMemo((): number => {
    return generalInfo?.playerLevel ?? 1;
  }, [generalInfo]);

  // Get trader levels as a record
  const traderLevels = useMemo((): Record<string, number> => {
    if (!generalInfo?.traders) return {};
    const levels: Record<string, number> = {};
    for (const trader of generalInfo.traders) {
      if (trader.level > 0) {
        levels[trader.name] = trader.level;
      }
    }
    return levels;
  }, [generalInfo]);

  // Get trader level for a specific trader
  const getTraderLevel = useMemo(() => {
    if (!generalInfo?.traders) return () => 0;
    return (traderName: string): number => {
      const trader = generalInfo.traders.find((t) => t.name === traderName);
      return trader?.level ?? 0;
    };
  }, [generalInfo]);

  // Update player level
  const setPlayerLevel = async (level: number) => {
    try {
      await updatePlayerLevel(level);
    } catch (err) {
      console.error("Error updating player level:", err);
      throw err;
    }
  };

  // Update trader level
  const setTraderLevel = async (traderName: string, level: number) => {
    try {
      await updateTraderLevel(traderName, level);
    } catch (err) {
      console.error("Error updating trader level:", err);
      throw err;
    }
  };

  return {
    playerLevel,
    traderLevels,
    getTraderLevel,
    setPlayerLevel,
    setTraderLevel,
    isLoading: generalInfo === undefined,
  };
}

