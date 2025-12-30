"use client";

import { IconCheck } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { RaidSummary } from "./types";

interface RaidSummaryViewProps {
  summary: RaidSummary;
}

export function RaidSummaryView({ summary }: RaidSummaryViewProps) {
  return (
    <ScrollArea className="flex-1 pr-4 min-h-0">
      <div className="space-y-4">
        {/* Hideout Progress */}
        {summary.hideoutProgress.length > 0 && (
          <div>
            <div className="text-sm font-semibold mb-2">
              Hideout Progress ({summary.hideoutProgress.length})
            </div>
            <div className="space-y-2">
              {summary.hideoutProgress.map((progress) => (
                <div
                  key={`${progress.upgrade.stationId}-${progress.upgrade.level}`}
                  className="bg-muted/50 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">
                      {progress.upgrade.stationName} Level{" "}
                      {progress.upgrade.level}
                    </div>
                    {progress.isLocked && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      >
                        Locked
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {progress.itemsAdded.map((item) => (
                      <div
                        key={item.itemName}
                        className="text-sm text-muted-foreground"
                      >
                        <span className="font-medium">{item.itemName}</span>
                        : {item.previousOwned} → {item.newOwned} /{" "}
                        {item.requiredTotal}
                        {item.newOwned >= item.requiredTotal && (
                          <Badge
                            variant="outline"
                            className="ml-2 bg-green-500/10 text-green-600 dark:text-green-400"
                          >
                            <IconCheck className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Watchlist Progress */}
        {summary.watchlistProgress.length > 0 && (
          <div>
            <div className="text-sm font-semibold mb-2">
              Watchlist Progress ({summary.watchlistProgress.length})
            </div>
            <div className="space-y-2">
              {summary.watchlistProgress.map((item) => (
                <div
                  key={item.itemName}
                  className="bg-muted/50 rounded-lg p-3"
                >
                  <div className="font-medium mb-1">{item.itemName}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.previousOwned} → {item.newOwned} /{" "}
                    {item.watchlistTarget}
                    {item.progress >= item.watchlistTarget && (
                      <Badge
                        variant="outline"
                        className="ml-2 bg-green-500/10 text-green-600 dark:text-green-400"
                      >
                        <IconCheck className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${Math.min(
                          (item.progress / item.watchlistTarget) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {summary.completedTasks.length > 0 && (
          <div>
            <div className="text-sm font-semibold mb-2">
              Completed Tasks ({summary.completedTasks.length})
            </div>
            <div className="space-y-2">
              {summary.completedTasks.map((task) => (
                <div key={task.id} className="bg-muted/50 rounded-lg p-3">
                  <div className="font-medium">{task.name}</div>
                  {task.trader && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {task.trader.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {summary.hideoutProgress.length === 0 &&
          summary.watchlistProgress.length === 0 &&
          summary.completedTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No significant progress detected. Items have been added to your
              inventory.
            </div>
          )}
      </div>
    </ScrollArea>
  );
}

