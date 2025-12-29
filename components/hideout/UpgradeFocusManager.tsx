"use client";

import { useMemo, useState, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/index";
import { useStationLevels } from "@/hooks/use-station-levels";
import { useInventory } from "@/hooks/use-inventory";
import { usePlayerInfo } from "@/hooks/use-player-info";
import { useQuest } from "@/hooks/use-quest";
import {
  toggleFocusedUpgrade as toggleFocusedUpgradeDb,
  clearFocusedUpgrades as clearFocusedUpgradesDb,
  purchaseUpgrade as purchaseUpgradeDb,
} from "@/lib/db/updates";
import {
  getAvailableUpgrades,
  getFocusedUpgrades,
  isUpgradeAvailable,
} from "@/lib/utils/hideout-calculations";
import { Button } from "@/components/ui/button";
import { UpgradeCard } from "./UpgradeCard";
import { getUpgradeKey } from "@/lib/utils/hideout-data";
import { useFuzzySearch } from "@/hooks/use-fuzzy-search";
import { SearchInput } from "@/components/ui/search-input";
import type { UserHideoutState, StationLevel } from "@/lib/types/hideout";

export function UpgradeFocusManager() {
  const {
    hideoutData,
    isLoading: isLoadingStations,
    stationLevels,
  } = useStationLevels();
  const { inventory } = useInventory();
  const { traderLevels, playerLevel } = usePlayerInfo();
  const { allTasks } = useQuest();

  // Query stations to get focused upgrades
  const stations = useLiveQuery(() => db.stations.toArray(), []);

  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  // Reconstruct userState from individual hooks
  const userState = useMemo((): UserHideoutState | null => {
    if (!stations || !allTasks) return null;

    // Build focusedUpgrades array
    const focusedUpgradesArray: string[] = [];
    for (const station of stations) {
      for (const level of station.levels) {
        if (level.isFocused) {
          focusedUpgradesArray.push(getUpgradeKey(station.id, level.level));
        }
      }
    }

    // Build completedQuests array
    const completedQuestsArray = allTasks
      .filter((t) => t.isCompleted)
      .map((t) => t.id);

    return {
      stationLevels,
      inventory,
      focusedUpgrades: focusedUpgradesArray,
      traderLevels,
      completedQuests: completedQuestsArray,
      playerLevel: playerLevel ?? 1,
    };
  }, [stations, stationLevels, inventory, traderLevels, allTasks, playerLevel]);

  // Compute available upgrades
  const availableUpgrades = useMemo(() => {
    if (!hideoutData || !userState) return [];
    return getAvailableUpgrades(hideoutData, userState);
  }, [hideoutData, userState]);

  // Compute focused upgrades
  const focusedUpgrades = useMemo(() => {
    if (!hideoutData || !userState) return [];
    return getFocusedUpgrades(hideoutData, userState);
  }, [hideoutData, userState]);

  // Toggle focused upgrade
  const toggleFocusedUpgrade = useCallback(
    async (stationId: string, level: number) => {
      try {
        await toggleFocusedUpgradeDb(stationId, level);
      } catch (err) {
        console.error("Error toggling focused upgrade:", err);
      }
    },
    []
  );

  // Clear all focused upgrades
  const clearFocusedUpgrades = useCallback(async () => {
    try {
      await clearFocusedUpgradesDb();
    } catch (err) {
      console.error("Error clearing focused upgrades:", err);
    }
  }, []);

  // Purchase upgrade
  const purchaseUpgrade = useCallback(async (upgrade: StationLevel) => {
    try {
      await purchaseUpgradeDb(upgrade);
    } catch (err) {
      console.error("Error purchasing upgrade:", err);
    }
  }, []);

  const isLoading = isLoadingStations || !userState;

  const allUpgrades = useMemo(() => {
    if (!hideoutData) return [];
    const upgrades: (typeof hideoutData.stations)[0]["levels"] = [];
    for (const station of hideoutData.stations) {
      upgrades.push(...station.levels);
    }
    // Filter out upgrades that have already been purchased
    return upgrades.filter((upgrade) => {
      const userCurrentLevel = stationLevels[upgrade.stationId] || 0;
      return userCurrentLevel < upgrade.level;
    });
  }, [hideoutData, stationLevels]);

  // Fuzzy search for upgrades
  const {
    results: fuzzySearchResults,
    query: searchQuery,
    setQuery: setSearchQuery,
  } = useFuzzySearch(allUpgrades, {
    keys: [
      { name: "stationName", weight: 1 },
      { name: "level", weight: 1 },
    ],
    minMatchCharLength: 2,
  });

  // Convert fuzzy search results back to upgrade array
  const fuzzySearchUpgrades = useMemo(() => {
    if (!searchQuery.trim()) {
      return showAvailableOnly ? availableUpgrades : allUpgrades;
    }
    return fuzzySearchResults as unknown as typeof allUpgrades;
  }, [
    searchQuery,
    fuzzySearchResults,
    showAvailableOnly,
    availableUpgrades,
    allUpgrades,
  ]);

  const displayedUpgrades = useMemo(() => {
    // Group by station
    const grouped = new Map<string, typeof fuzzySearchUpgrades>();
    for (const upgrade of fuzzySearchUpgrades) {
      if (!grouped.has(upgrade.stationId)) {
        grouped.set(upgrade.stationId, []);
      }
      grouped.get(upgrade.stationId)!.push(upgrade);
    }

    // Sort upgrades within each station by level
    for (const [stationId, stationUpgrades] of grouped) {
      stationUpgrades.sort((a, b) => a.level - b.level);
    }

    return grouped;
  }, [fuzzySearchUpgrades]);

  const focusedCount = userState?.focusedUpgrades.length ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Upgrade Focus</h2>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hideoutData || !userState) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Upgrade Focus</h2>
        <p className="text-muted-foreground text-sm">
          Select upgrades to focus on. These will show in "Required Now" column.
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <SearchInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Search upgrades..."
            className="flex-1"
          />
          <Button
            variant={showAvailableOnly ? "default" : "outline"}
            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
          >
            {showAvailableOnly ? "Show All" : "Available Only"}
          </Button>
          {focusedCount > 0 && (
            <Button variant="outline" onClick={clearFocusedUpgrades}>
              Clear Focus ({focusedCount})
            </Button>
          )}
        </div>

        <div className="space-y-4 md:max-h-[600px] overflow-y-auto">
          {displayedUpgrades.size === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              {searchQuery ? "No upgrades found" : "No upgrades available"}
            </p>
          ) : (
            Array.from(displayedUpgrades.entries()).map(
              ([stationId, upgrades]) => {
                const station = hideoutData.stations.find(
                  (s) => s.id === stationId
                );
                return (
                  <div key={stationId} className="space-y-2">
                    <h3 className="font-semibold text-sm sticky top-0 bg-background z-10 py-1 flex items-center gap-2">
                      {station?.imageLink && (
                        <img
                          src={station.imageLink}
                          alt={station.name}
                          className="w-5 h-5 object-contain"
                        />
                      )}
                      {station?.name || "Unknown Station"}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                      {upgrades.map((upgrade) => {
                        const key = getUpgradeKey(
                          upgrade.stationId,
                          upgrade.level
                        );
                        const isFocused =
                          userState?.focusedUpgrades.includes(key) ?? false;
                        const isAvailable = userState
                          ? isUpgradeAvailable(upgrade, userState)
                          : false;

                        return (
                          <UpgradeCard
                            key={key}
                            upgrade={upgrade}
                            isFocused={isFocused}
                            isAvailable={isAvailable}
                            userState={userState}
                            onToggleFocus={() =>
                              toggleFocusedUpgrade(
                                upgrade.stationId,
                                upgrade.level
                              )
                            }
                            onPurchase={() => purchaseUpgrade(upgrade)}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>

        {focusedCount > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-muted-foreground text-sm">
              {focusedCount} upgrade{focusedCount !== 1 ? "s" : ""} focused
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
