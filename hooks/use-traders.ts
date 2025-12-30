import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

import { db } from "@/lib/db/index";
import { getTradersData } from "@/lib/db/queries";
import type { TransformedTradersData } from "@/lib/types/hideout";

/**
 * Hook for traders data
 * Queries traders from Dexie
 */
export function useTraders() {
  // Query general information to get traders
  const generalInfo = useLiveQuery(() => db.generalInformation.get("general"), []);

  // Get traders data structure
  const tradersData = useLiveQuery(
    async () => {
      if (!generalInfo) return null;
      return await getTradersData();
    },
    [generalInfo]
  );

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

  return {
    tradersData: tradersData as TransformedTradersData | null,
    traderLevels,
    getTraderLevel,
    isLoading: generalInfo === undefined || tradersData === undefined,
  };
}

