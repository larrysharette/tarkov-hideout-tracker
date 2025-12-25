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

export function TraderLevelSelector() {
  const { tradersData, isLoading, error, userState, setTraderLevel } =
    useHideout();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Trader Loyalty Levels</h2>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Trader Loyalty Levels</h2>
          <p className="text-destructive text-sm">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!tradersData || tradersData.traders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Trader Loyalty Levels</h2>
        <p className="text-muted-foreground text-sm">
          Select your current loyalty level for each trader
        </p>
      </div>
      <div className="flex flex-wrap gap-4 items-end">
        {tradersData.traders.map((trader) => {
          const currentLevel = userState.traderLevels?.[trader.name] || 0;

          return (
            <div
              key={trader.id}
              className="flex flex-col items-center gap-2 min-w-[120px]"
            >
              {trader.imageLink && (
                <img
                  src={trader.imageLink}
                  alt={trader.name}
                  className="w-16 h-16 object-contain"
                />
              )}
              <Label htmlFor={`trader-${trader.id}`} className="text-center">
                {trader.name}
              </Label>
              <Select
                value={currentLevel.toString()}
                onValueChange={(value) =>
                  setTraderLevel(trader.name, parseInt(value ?? "0", 10))
                }
              >
                <SelectTrigger id={`trader-${trader.id}`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: trader.maxLevel + 1 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      Level {i}
                      {i === 0 && " (No loyalty)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
