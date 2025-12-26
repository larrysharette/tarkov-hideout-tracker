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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQuest } from "@/contexts/QuestContext";
import {
  IconArrowRight,
  IconArrowRightFromArc,
  IconEye,
} from "@tabler/icons-react";

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

export function QuestDialog({
  quest,
  allQuests,
  open,
  onOpenChange,
  onQuestClick,
}: QuestDialogProps) {
  const { isQuestCompleted, toggleQuestCompletion } = useQuest();

  // Get quests that this quest unlocks
  const getUnlockedQuests = useCallback(
    (task: Task): Task[] => {
      return allQuests.filter((t) =>
        t.taskRequirements.some((req) => req.task.id === task.id)
      );
    },
    [allQuests]
  );

  if (!quest) return null;

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
                  {quest.kappaRequired && (
                    <Badge className="bg-amber-500 text-amber-950 mt-2 w-fit">
                      Kappa Required
                    </Badge>
                  )}
                </DialogHeader>

                {/* Mark as Completed checkbox */}
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
        ) : (
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{quest.name}</DialogTitle>
            {quest.kappaRequired && (
              <Badge className="bg-amber-500 text-amber-950 mt-2 w-fit">
                Kappa Required
              </Badge>
            )}
          </DialogHeader>
        )}
        <ScrollArea className="flex-1 pr-4 px-6 pb-6">
          <div className="space-y-4">
            {/* Required Quests (Prerequisites) */}
            {quest.taskRequirements.length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Required Quests</Label>
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
            {quest.neededKeys.keys.length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Required Keys</Label>
                <div className="mt-2 space-y-1">
                  {quest.neededKeys.keys.map((key) => (
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

            <Separator />

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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
