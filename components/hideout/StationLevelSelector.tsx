"use client";

import { useHideout } from "@/contexts/HideoutContext";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function StationLevelSelector() {
  const { hideoutData, isLoading, error, userState, setStationLevel } =
    useHideout();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Hideout Levels</h2>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Hideout Levels</h2>
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
        <h2 className="text-xl font-semibold mb-1">Hideout Levels</h2>
        <p className="text-muted-foreground text-sm">
          Select your current level for each hideout station
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-4">
        {hideoutData.stations.map((station) => {
          const maxLevel = Math.max(
            ...station.levels.map((level) => level.level),
            0
          );
          const currentLevel = userState.stationLevels[station.id] || 0;

          return (
            <div key={station.id} className="flex flex-col items-center gap-2">
              {station.imageLink && (
                <img
                  src={station.imageLink}
                  alt={station.name}
                  className="w-16 h-16 object-contain"
                />
              )}
              <Label htmlFor={`station-${station.id}`} className="text-center">
                {station.name}
              </Label>
              <Select
                value={currentLevel.toString()}
                onValueChange={(value) =>
                  setStationLevel(station.id, parseInt(value ?? "0", 10))
                }
              >
                <SelectTrigger id={`station-${station.id}`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxLevel + 1 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      Level {i}
                      {i === 0 && " (Not built)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {maxLevel > 0 && (
                <p className="text-muted-foreground text-xs">
                  Max level: {maxLevel}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
