"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuest } from "@/contexts/QuestContext";
import type { Task } from "@/lib/types/tasks";

interface QuestCardProps {
  quest: Task;
  isLocked: boolean;
  onClick: () => void;
}

export function QuestCard({ quest, isLocked, onClick }: QuestCardProps) {
  const { isQuestCompleted, toggleQuestCompletion } = useQuest();
  const isCompleted = isQuestCompleted(quest.id);

  return (
    <Card
      className={`p-2 cursor-pointer transition-colors ${
        isCompleted
          ? "bg-green-50/50 dark:bg-green-950/20 border-green-500"
          : isLocked
          ? "bg-muted/50 opacity-60"
          : quest.kappaRequired
          ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
          : "hover:bg-accent"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm line-clamp-2">{quest.name}</div>
          {quest.kappaRequired && (
            <Badge
              variant="outline"
              className="mt-1 text-xs border-amber-500 text-amber-600 dark:text-amber-400"
            >
              Kappa
            </Badge>
          )}
        </div>
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => {
            toggleQuestCompletion(quest.id);
          }}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5"
        />
      </div>
    </Card>
  );
}

