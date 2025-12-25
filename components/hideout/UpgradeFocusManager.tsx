"use client";

import { useMemo, useState } from "react";
import { useHideout } from "@/contexts/HideoutContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UpgradeCard } from "./UpgradeCard";
import { getUpgradeKey } from "@/lib/utils/hideout-data";
import { isUpgradeAvailable } from "@/lib/utils/hideout-calculations";

export function UpgradeFocusManager() {
  const {
    hideoutData,
    isLoading,
    error,
    userState,
    toggleFocusedUpgrade,
    clearFocusedUpgrades,
    getAvailableUpgrades,
  } = useHideout();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const availableUpgrades = useMemo(() => {
    if (!hideoutData) return [];
    return getAvailableUpgrades();
  }, [
    hideoutData,
    userState.stationLevels,
    userState.traderLevels,
    getAvailableUpgrades,
  ]);

  const allUpgrades = useMemo(() => {
    if (!hideoutData) return [];
    const upgrades: (typeof hideoutData.stations)[0]["levels"] = [];
    for (const station of hideoutData.stations) {
      upgrades.push(...station.levels);
    }
    // Filter out upgrades that have already been purchased
    return upgrades.filter((upgrade) => {
      const userCurrentLevel = userState.stationLevels[upgrade.stationId] || 0;
      return userCurrentLevel < upgrade.level;
    });
  }, [hideoutData, userState.stationLevels]);

  const displayedUpgrades = useMemo(() => {
    let upgrades = showAvailableOnly ? availableUpgrades : allUpgrades;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      upgrades = upgrades.filter(
        (upgrade) =>
          upgrade.stationName.toLowerCase().includes(query) ||
          upgrade.level.toString().includes(query)
      );
    }

    // Group by station
    const grouped = new Map<string, typeof upgrades>();
    for (const upgrade of upgrades) {
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
  }, [allUpgrades, availableUpgrades, showAvailableOnly, searchQuery]);

  const focusedCount = userState.focusedUpgrades.length;

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

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Upgrade Focus</h2>
          <p className="text-destructive text-sm">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!hideoutData) {
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
          <Input
            type="text"
            placeholder="Search upgrades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        <div className="space-y-4 max-h-[600px] overflow-y-auto">
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
                          userState.focusedUpgrades.includes(key);
                        const isAvailable = isUpgradeAvailable(
                          upgrade,
                          userState
                        );

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
