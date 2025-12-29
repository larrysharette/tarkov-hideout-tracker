import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/index";
import { updateStationLevel } from "@/lib/db/updates";
import { getHideoutData } from "@/lib/db/queries";
import type { TransformedHideoutData } from "@/lib/types/hideout";

/**
 * Hook for station level management
 * Queries stations and their current levels from Dexie
 */
export function useStationLevels() {
  // Query all stations with their current levels
  const stations = useLiveQuery(() => db.stations.toArray(), []);

  // Get hideout data structure (for station info)
  const hideoutData = useLiveQuery(
    async () => {
      if (!stations) return null;
      return await getHideoutData();
    },
    [stations]
  );

  // Get current level for a specific station
  const getStationLevel = useMemo(() => {
    if (!stations) return () => 0;
    return (stationId: string): number => {
      const station = stations.find((s) => s.id === stationId);
      return station?.currentLevel ?? 0;
    };
  }, [stations]);

  // Get all station levels as a record
  const stationLevels = useMemo((): Record<string, number> => {
    if (!stations) return {};
    const levels: Record<string, number> = {};
    for (const station of stations) {
      if (station.currentLevel > 0) {
        levels[station.id] = station.currentLevel;
      }
    }
    return levels;
  }, [stations]);

  // Update station level
  const setStationLevel = async (stationId: string, level: number) => {
    try {
      await updateStationLevel(stationId, level);
    } catch (err) {
      console.error("Error updating station level:", err);
      throw err;
    }
  };

  return {
    stations,
    hideoutData: hideoutData as TransformedHideoutData | null,
    getStationLevel,
    stationLevels,
    setStationLevel,
    isLoading: stations === undefined || hideoutData === undefined,
  };
}

