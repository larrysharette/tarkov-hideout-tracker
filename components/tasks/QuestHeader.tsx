"use client";

import { useMemo } from "react";
import type { Task } from "@/lib/types/tasks";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useQuest } from "@/contexts/QuestContext";

interface QuestHeaderProps {
  tasks: Task[];
}

export function QuestHeader({ tasks }: QuestHeaderProps) {
  const { isQuestCompleted } = useQuest();

  // Calculate Kappa Required progress
  const kappaProgress = useMemo(() => {
    const kappaQuests = tasks.filter((t) => t.kappaRequired);
    const completedKappaQuests = kappaQuests.filter((t) =>
      isQuestCompleted(t.id)
    );
    return {
      total: kappaQuests.length,
      completed: completedKappaQuests.length,
      percentage:
        kappaQuests.length > 0
          ? Math.round((completedKappaQuests.length / kappaQuests.length) * 100)
          : 0,
    };
  }, [tasks, isQuestCompleted]);

  // Calculate Lightkeeper Required progress
  const lightkeeperProgress = useMemo(() => {
    const lightkeeperQuests = tasks.filter((t) => t.lightkeeperRequired);
    const completedLightkeeperQuests = lightkeeperQuests.filter((t) =>
      isQuestCompleted(t.id)
    );
    return {
      total: lightkeeperQuests.length,
      completed: completedLightkeeperQuests.length,
      percentage:
        lightkeeperQuests.length > 0
          ? Math.round(
              (completedLightkeeperQuests.length / lightkeeperQuests.length) *
                100
            )
          : 0,
    };
  }, [tasks, isQuestCompleted]);

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Task Tracker</h1>
          <p className="text-muted-foreground">
            Browse and track all Escape from Tarkov tasks organized by trader
            and level
          </p>
        </div>

        {/* Progress Indicators */}
        {(kappaProgress.total > 0 || lightkeeperProgress.total > 0) && (
          <div className="flex flex-col gap-4 md:items-end">
            {/* Kappa Progress */}
            {kappaProgress.total > 0 && (
              <div className="min-w-[200px] md:min-w-[300px] lg:min-w-[500px]">
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-sm font-medium">Kappa Required</Label>
                  <span className="text-xs text-muted-foreground">
                    {kappaProgress.completed} / {kappaProgress.total}
                  </span>
                </div>
                <Progress
                  value={kappaProgress.percentage}
                  indicatorClassName="bg-amber-500"
                />
              </div>
            )}

            {/* Lightkeeper Progress */}
            {lightkeeperProgress.total > 0 && (
              <div className="min-w-[200px] md:min-w-[300px] lg:min-w-[500px]">
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-sm font-medium">
                    Lightkeeper Required
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {lightkeeperProgress.completed} /{" "}
                    {lightkeeperProgress.total}
                  </span>
                </div>
                <Progress
                  value={lightkeeperProgress.percentage}
                  indicatorClassName="bg-blue-500"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
