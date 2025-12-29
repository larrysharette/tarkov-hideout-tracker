"use client";

import { useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { IconX } from "@tabler/icons-react";
import type { Task } from "@/lib/types/tasks";
import type { SelectedTask } from "./types";
import { useQuest } from "@/contexts/QuestContext";

interface TaskSelectorProps {
  tasks: Task[];
  selectedTasks: Map<string, SelectedTask>;
  playerLevel: number;
  onTaskSelect: (task: Task) => void;
  onTaskToggle: (taskId: string, completed: boolean) => void;
  onTaskRemove: (taskId: string) => void;
}

export function TaskSelector({
  tasks,
  selectedTasks,
  playerLevel,
  onTaskSelect,
  onTaskToggle,
  onTaskRemove,
}: TaskSelectorProps) {
  const { isQuestCompleted } = useQuest();
  const taskNames = tasks.map((task) => task.name);

  const isTaskLocked = useCallback(
    (task: Task): boolean => {
      if (task.minPlayerLevel && playerLevel < task.minPlayerLevel) {
        return true;
      }
      if (task.taskRequirements.length === 0) return false;
      return !task.taskRequirements.every((req) =>
        isQuestCompleted(req.task.id)
      );
    },
    [playerLevel, isQuestCompleted]
  );

  const handleTaskSelect = useCallback(
    (taskName: string | null) => {
      if (!taskName) return;
      const task = tasks.find((t) => t.name === taskName);
      if (task && !selectedTasks.has(task.id)) {
        onTaskSelect(task);
      }
    },
    [tasks, selectedTasks, onTaskSelect]
  );

  return (
    <div className="space-y-3 pt-4 border-t">
      <div className="text-sm font-semibold">Completed Tasks</div>
      <Combobox
        items={taskNames}
        value=""
        onValueChange={handleTaskSelect}
        limit={10}
      >
        <ComboboxInput
          showClear
          placeholder="Search for a task..."
          className="w-full"
        />
        <ComboboxContent>
          <ComboboxEmpty>No tasks found.</ComboboxEmpty>
          <ComboboxList>
            {(taskName) => {
              const task = tasks.find((t) => t.name === taskName);
              const isAlreadySelected = task
                ? selectedTasks.has(task.id)
                : false;
              return (
                <ComboboxItem
                  key={task?.id ?? taskName}
                  value={taskName}
                  disabled={isAlreadySelected}
                >
                  <div className="flex items-center gap-2">
                    <span>{taskName}</span>
                    {isAlreadySelected && (
                      <Badge variant="outline" className="text-xs">
                        Added
                      </Badge>
                    )}
                  </div>
                </ComboboxItem>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {Array.from(selectedTasks.values()).length > 0 && (
        <div className="space-y-2">
          {Array.from(selectedTasks.values()).map((selectedTask) => {
            const locked = isTaskLocked(selectedTask.task);
            return (
              <Card
                key={selectedTask.task.id}
                className={`p-2 transition-colors ${
                  selectedTask.completed
                    ? "bg-green-50/50 dark:bg-green-950/20 border-green-500"
                    : locked
                    ? "bg-muted/50 opacity-60"
                    : selectedTask.task.kappaRequired
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
                    : selectedTask.task.lightkeeperRequired
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm line-clamp-2">
                      {selectedTask.task.name}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTask.task.kappaRequired && (
                        <Badge
                          variant="outline"
                          className="text-xs border-amber-500 text-amber-600 dark:text-amber-400"
                        >
                          Kappa
                        </Badge>
                      )}
                      {selectedTask.task.lightkeeperRequired && (
                        <Badge
                          variant="outline"
                          className="text-xs border-blue-500 text-blue-600 dark:text-blue-400"
                        >
                          Lightkeeper
                        </Badge>
                      )}
                      {locked && (
                        <Badge variant="outline" className="text-xs">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedTask.completed}
                      onCheckedChange={(checked) =>
                        onTaskToggle(selectedTask.task.id, checked === true)
                      }
                      className="mt-0.5"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onTaskRemove(selectedTask.task.id)}
                      className="h-6 w-6"
                    >
                      <IconX className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

