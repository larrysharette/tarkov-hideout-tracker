"use client";

import { useCallback } from "react";
import type { Task } from "@/lib/types/tasks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQuest } from "@/hooks/use-quest";
import { useTaskWatchlist } from "@/hooks/use-task-watchlist";
import {
  IconArrowRight,
  IconArrowRightFromArc,
  IconEye,
  IconEyeOff,
  IconCheck,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface QuestDialogProps {
  quest: Task | null;
  allQuests: Task[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestClick?: (quest: Task) => void;
}

// Convert camelCase to Title Case
function formatObjectiveType(type: string): string {
  return type
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
}

// Recursively collect all prerequisite task IDs
function getAllPrerequisiteIds(
  taskId: string,
  allQuests: Task[],
  visited: Set<string> = new Set(),
  result: Set<string> = new Set()
): string[] {
  // Avoid cycles - if we've already processed this task, return current results
  if (visited.has(taskId)) {
    return Array.from(result);
  }
  visited.add(taskId);

  const task = allQuests.find((t) => t.id === taskId);
  if (!task) {
    return Array.from(result);
  }

  // Process all requirements of this task
  for (const req of task.taskRequirements) {
    const reqId = req.task.id;
    // Add to result if not already present
    result.add(reqId);
    // Recursively get prerequisites of this prerequisite
    // This will handle nested prerequisites and avoid cycles via visited set
    getAllPrerequisiteIds(reqId, allQuests, visited, result);
  }

  return Array.from(result);
}

export function QuestDialog({
  quest,
  allQuests,
  open,
  onOpenChange,
  onQuestClick,
}: QuestDialogProps) {
  const { isQuestCompleted, toggleQuestCompletion, markQuestsAsCompleted } =
    useQuest();
  const { addTaskToWatchlist, removeTaskFromWatchlist, isTaskInWatchlist } =
    useTaskWatchlist();

  // Get quests that this quest unlocks
  const getUnlockedQuests = useCallback(
    (task: Task): Task[] => {
      return allQuests.filter((t) =>
        t.taskRequirements.some((req) => req.task.id === task.id)
      );
    },
    [allQuests]
  );

  // Handle marking all prerequisites as completed
  const handleMarkPrerequisitesComplete = useCallback(() => {
    if (!quest) return;
    const prerequisiteIds = getAllPrerequisiteIds(quest.id, allQuests);
    // Filter out already completed quests
    const uncompletedPrereqs = prerequisiteIds.filter(
      (id) => !isQuestCompleted(id)
    );
    if (uncompletedPrereqs.length > 0) {
      markQuestsAsCompleted(uncompletedPrereqs);
    }
  }, [quest, allQuests, isQuestCompleted, markQuestsAsCompleted]);

  // Handle toggling watchlist (must be before early return)
  const handleToggleWatchlist = useCallback(() => {
    if (!quest) return;
    if (isTaskInWatchlist(quest.id)) {
      removeTaskFromWatchlist(quest.id);
    } else {
      addTaskToWatchlist(quest.id);
    }
  }, [quest, addTaskToWatchlist, removeTaskFromWatchlist, isTaskInWatchlist]);

  if (!quest) return null;

  const neededKeys = quest.neededKeys?.flatMap((key) => key.keys) ?? [];
  const isInWatchlist = isTaskInWatchlist(quest.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[90vh] flex flex-col p-0">
        {/* Banner Header with Quest Image */}
        {quest.taskImageLink ? (
          <div
            className="relative w-full h-48 bg-cover bg-center rounded-t-xl"
            style={{ backgroundImage: `url(${quest.taskImageLink})` }}
          >
            {/* Overlay gradient for text readability */}
            <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/80 rounded-t-xl" />

            {/* Content overlay */}
            <div className="relative h-full flex flex-col justify-between p-6">
              {/* Top row: Trader on left, Map/Level on right */}
              <div className="flex items-start justify-between">
                {/* Trader at top left */}
                {quest.trader && (
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 w-fit">
                    {quest.trader.imageLink && (
                      <img
                        src={quest.trader.imageLink}
                        alt={quest.trader.name}
                        className="w-6 h-6 object-contain"
                      />
                    )}
                    <span className="text-white text-sm font-medium drop-shadow-md">
                      {quest.trader.name}
                    </span>
                  </div>
                )}

                {/* Map and Level at top right */}
                <div className="flex flex-col items-end gap-2">
                  {quest.map && (
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 w-fit">
                      <span className="text-white text-sm font-medium drop-shadow-md">
                        {quest.map.name}
                      </span>
                    </div>
                  )}
                  {Boolean(quest.minPlayerLevel) && (
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 w-fit">
                      <span className="text-white text-sm font-medium drop-shadow-md">
                        Level {quest.minPlayerLevel}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom row: Title/badges on left, Complete checkbox on right */}
              <div className="flex items-end justify-between gap-4">
                <DialogHeader className="text-left flex-1">
                  <DialogTitle className="text-white drop-shadow-lg">
                    {quest.name}
                  </DialogTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {quest.kappaRequired && (
                      <Badge className="bg-amber-500 text-amber-950 w-fit">
                        Kappa Required
                      </Badge>
                    )}
                    {quest.lightkeeperRequired && (
                      <Badge className="bg-blue-500 text-blue-950 w-fit">
                        Lightkeeper Required
                      </Badge>
                    )}
                  </div>
                </DialogHeader>

                {/* Watchlist button and Mark as Completed checkbox */}
                <div className="flex items-center gap-2">
                  {/* Watchlist button */}
                  <Button
                    variant={isInWatchlist ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleWatchlist();
                    }}
                    title={
                      isInWatchlist
                        ? "Remove from watchlist"
                        : "Add to watchlist"
                    }
                  >
                    {isInWatchlist ? (
                      <IconEye className="h-4 w-4" />
                    ) : (
                      <IconEyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  {/* Complete checkbox */}
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2">
                    <Checkbox
                      id="complete-quest-banner"
                      checked={isQuestCompleted(quest.id)}
                      onCheckedChange={() => toggleQuestCompletion(quest.id)}
                      className="border-white/80 data-checked:bg-white data-checked:border-white"
                    />
                    <Label
                      htmlFor="complete-quest-banner"
                      className="text-white text-sm font-medium drop-shadow-md cursor-pointer"
                    >
                      Complete
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <DialogHeader className="px-6 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle>{quest.name}</DialogTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {quest.kappaRequired && (
                    <Badge className="bg-amber-500 text-amber-950 w-fit">
                      Kappa Required
                    </Badge>
                  )}
                  {quest.lightkeeperRequired && (
                    <Badge className="bg-blue-500 text-blue-950 w-fit">
                      Lightkeeper Required
                    </Badge>
                  )}
                </div>
              </div>
              {/* Watchlist button and Complete checkbox */}
              <div className="flex items-center gap-2">
                {/* Watchlist button */}
                <Button
                  variant={isInWatchlist ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleWatchlist();
                  }}
                  title={
                    isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
                  }
                >
                  {isInWatchlist ? (
                    <IconEye className="h-4 w-4" />
                  ) : (
                    <IconEyeOff className="h-4 w-4" />
                  )}
                </Button>
                {/* Complete checkbox */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="complete-quest-header"
                    checked={isQuestCompleted(quest.id)}
                    onCheckedChange={() => toggleQuestCompletion(quest.id)}
                  />
                  <Label
                    htmlFor="complete-quest-header"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Complete
                  </Label>
                </div>
              </div>
            </div>
          </DialogHeader>
        )}
        <ScrollArea className="pr-4 px-6 pb-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div className="space-y-4">
            {/* Required Quests (Prerequisites) */}
            {quest.taskRequirements.length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Required Tasks</Label>
                <div className="mt-2 space-y-1">
                  {quest.taskRequirements.map((req) => {
                    const isCompleted = isQuestCompleted(req.task.id);
                    return (
                      <Card
                        key={req.task.id}
                        className={`p-2 ${
                          isCompleted
                            ? "bg-green-50/50 dark:bg-green-950/20 border-green-500"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={isCompleted} disabled />
                          <span className="text-sm">{req.task.name}</span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Required Keys */}
            {neededKeys.length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Required Keys</Label>
                <div className="mt-2 space-y-1">
                  {neededKeys.map((key) => (
                    <Card key={key.id} className="p-2">
                      <div className="flex items-center gap-2">
                        {key.imageLink && (
                          <img
                            src={key.imageLink}
                            alt={key.name}
                            className="w-6 h-6 object-contain"
                          />
                        )}
                        <span className="text-sm">{key.name}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Objectives */}
            {quest.objectives.length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Objectives</Label>
                <div className="mt-2 space-y-2">
                  {Object.entries(
                    quest.objectives.reduce((acc, objective) => {
                      const type = objective.type;
                      if (!acc[type]) {
                        acc[type] = [];
                      }
                      acc[type].push(objective);
                      return acc;
                    }, {} as Record<string, typeof quest.objectives>)
                  ).map(([type, objectives]) => (
                    <Card key={type} className="py-1 px-2 gap-1">
                      <div className="font-medium text-sm">
                        {formatObjectiveType(type)}
                      </div>
                      <ul className="list-disc list-inside space-y-1">
                        {objectives.map((objective, index) => (
                          <li
                            key={index}
                            className="text-muted-foreground text-sm"
                          >
                            {objective.description}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites of Quests (What this unlocks) */}
            {getUnlockedQuests(quest).length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Unlocks Quests</Label>
                <div className="mt-2 space-y-1">
                  {getUnlockedQuests(quest).map((unlocked) => (
                    <Card
                      key={unlocked.id}
                      className={`p-2 flex flex-row items-center justify-between gap-2 ${
                        onQuestClick
                          ? "cursor-pointer hover:bg-accent transition-colors"
                          : ""
                      }`}
                      onClick={() => {
                        if (onQuestClick) {
                          onQuestClick(unlocked);
                          onOpenChange(false);
                        }
                      }}
                    >
                      <span className="text-sm">{unlocked.name}</span>
                      <Button variant="ghost" className="cursor-pointer">
                        View Task
                        <IconArrowRight />
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <div className="flex flex-col gap-2 px-6 pb-4 w-full">
            <Separator />
            {/* Mark Prerequisites Complete Button */}
            {quest.taskRequirements.length > 0 && (
              <Button
                variant="default"
                className="w-full"
                onClick={handleMarkPrerequisitesComplete}
              >
                <IconCheck className="mr-2 h-4 w-4" />
                Mark Prerequisites Complete
              </Button>
            )}

            {/* Wiki Link */}
            {quest.wikiLink && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(quest.wikiLink!, "_blank")}
              >
                View Wiki →
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
