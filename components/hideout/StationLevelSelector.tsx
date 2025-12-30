"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStationLevels } from "@/hooks/use-station-levels";

export function StationLevelSelector() {
  const { hideoutData, isLoading, getStationLevel, setStationLevel } =
    useStationLevels();

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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {hideoutData.stations.map((station) => {
          const maxLevel = Math.max(
            ...station.levels.map((level) => level.level),
            0
          );
          const currentLevel = getStationLevel(station.id);

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
