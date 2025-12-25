"use client";

import { useMemo, memo } from "react";
import type { StationLevel, UserHideoutState } from "@/lib/types/hideout";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getUnmetRequirements } from "@/lib/utils/hideout-calculations";

interface UpgradeCardProps {
  upgrade: StationLevel;
  isFocused: boolean;
  isAvailable: boolean;
  userState: UserHideoutState;
  onToggleFocus: () => void;
}

export const UpgradeCard = memo(function UpgradeCard({
  upgrade,
  isFocused,
  isAvailable,
  userState,
  onToggleFocus,
}: UpgradeCardProps) {
  const hasRequirements = useMemo(() => {
    return (
      upgrade.stationRequirements.length > 0 ||
      upgrade.traderRequirements.length > 0
    );
  }, [upgrade]);

  const unmetRequirements = useMemo(() => {
    return getUnmetRequirements(upgrade, userState);
  }, [upgrade, userState]);

  return (
    <div
      className={cn(
        "cursor-pointer transition-all p-3 rounded-md border border-border z-0",
        "hover:border-primary/50 hover:bg-muted/30",
        isFocused && "border-primary bg-primary/10",
        !isAvailable && "opacity-60"
      )}
      onClick={onToggleFocus}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isFocused}
          onChange={onToggleFocus}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 h-4 w-4 rounded border-input bg-input/20 text-primary focus:ring-primary focus:ring-2 cursor-pointer"
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">
              {upgrade.stationName} Level {upgrade.level}
            </h4>
            {!isAvailable && (
              <Badge variant="outline" className="text-xs">
                Locked
              </Badge>
            )}
            {isFocused && (
              <Badge variant="default" className="text-xs">
                Focused
              </Badge>
            )}
          </div>

          {hasRequirements && (
            <div className="space-y-1 text-xs">
              {upgrade.stationRequirements.length > 0 && (
                <div>
                  <span className="font-medium">Station Requirements: </span>
                  {upgrade.stationRequirements.map((req, idx) => {
                    const unmet = unmetRequirements.stationRequirements.find(
                      (u) => u.requirement.stationId === req.stationId
                    );
                    const isMet = !unmet;
                    return (
                      <span
                        key={idx}
                        className={cn(
                          isMet
                            ? "text-muted-foreground"
                            : "text-destructive font-medium"
                        )}
                      >
                        {req.stationName} Lv.{req.level}
                        {!isMet && ` (You have Lv.${unmet.currentLevel})`}
                        {idx < upgrade.stationRequirements.length - 1 && ", "}
                      </span>
                    );
                  })}
                </div>
              )}
              {upgrade.traderRequirements.length > 0 && (
                <div>
                  <span className="font-medium">Trader Requirements: </span>
                  {upgrade.traderRequirements.map((req, idx) => {
                    const unmet = unmetRequirements.traderRequirements.find(
                      (u) => u.requirement.traderName === req.traderName
                    );
                    const isMet = !unmet;
                    return (
                      <span
                        key={idx}
                        className={cn(
                          isMet
                            ? "text-muted-foreground"
                            : "text-destructive font-medium"
                        )}
                      >
                        {req.traderName} Lv.{req.level}
                        {!isMet && ` (You have Lv.${unmet.currentLevel})`}
                        {idx < upgrade.traderRequirements.length - 1 && ", "}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {upgrade.itemRequirements.length > 0 && (
            <div className="pt-1">
              <p className="text-xs text-muted-foreground mb-1">
                Items Required:
              </p>
              <div className="flex flex-wrap gap-1">
                {upgrade.itemRequirements.slice(0, 5).map((req, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {req.itemName} x{req.count}
                  </Badge>
                ))}
                {upgrade.itemRequirements.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{upgrade.itemRequirements.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
