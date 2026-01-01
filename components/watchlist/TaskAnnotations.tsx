"use client";

import {
  IconBookmark,
  IconBookmarkOff,
  IconEye,
  IconEyeOff,
  IconMapPin,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { useMemo } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFuzzySearch } from "@/hooks/use-fuzzy-search";
import { useTaskWatchlist } from "@/hooks/use-task-watchlist";
import { type TaskRecord } from "@/lib/db/types";
import { formatObjectiveType } from "@/lib/utils";

import type { TaskPin } from "./useMapPins";

interface TaskAnnotationsProps {
  taskPins: TaskPin[];
  visiblePinIds: Set<string>;
  onTogglePin: (pinId: string) => void;
  onToggleTask?: (taskId: string) => void;
  onSelectTask?: (taskId: string, objectiveId?: string | null) => void;
  onRemove?: (pinId: string, objectiveId?: string) => void;
}

export function TaskAnnotations({
  taskPins,
  visiblePinIds,
  onTogglePin,
  onToggleTask,
  onSelectTask,
  onRemove,
}: TaskAnnotationsProps) {
  const { addTaskToWatchlist, removeTaskFromWatchlist, isTaskInWatchlist } =
    useTaskWatchlist();

  // Fuzzy search for task pins
  const {
    results: filteredTaskPins,
    query: taskSearch,
    setQuery: setTaskSearch,
  } = useFuzzySearch(taskPins, {
    keys: [
      { name: "name", weight: 1 },
      { name: "objectiveDescription", weight: 0.8 },
      { name: "objectiveType", weight: 0.6 },
    ],
    minMatchCharLength: 2,
    threshold: 0.3,
  });

  // Group task pins by task name and enrich with task data
  const groupedTaskPins = useMemo(() => {
    const groups = new Map<string, TaskPin[]>();
    filteredTaskPins.forEach((pin) => {
      const key = pin.task.id || "unknown";
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(pin);
    });
    return Array.from(groups.entries()).map(([taskId, pins]) => ({
      taskId,
      taskName: pins[0]!.task.name || "Unknown Task",
      wikiLink: pins[0]!.task.wikiLink,
      task: pins[0]!.task as TaskRecord,
      pins,
    }));
  }, [filteredTaskPins]);

  return (
    <div className="flex flex-col gap-2 flex-1 min-h-0">
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Tasks ({groupedTaskPins.length})
        </label>
        <Input
          type="text"
          placeholder="Search tasks..."
          value={taskSearch}
          onChange={(e) => setTaskSearch(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
      <ScrollArea className="flex-1 overflow-y-auto">
        {groupedTaskPins.length === 0 ? (
          <div className="text-xs text-muted-foreground py-2 text-center">
            {taskSearch ? "No tasks found" : "No task annotations"}
          </div>
        ) : (
          <Accordion multiple className="w-full">
            {groupedTaskPins.map(
              ({ taskId, taskName, wikiLink, pins: taskPins, task }) => {
                // Check if all pins for this task are visible
                const allPinsVisible = taskPins.every((pin) =>
                  visiblePinIds.has(pin.id)
                );
                const isTaskVisible = allPinsVisible && taskPins.length > 0;

                // Create a map of objectiveId to pin for quick lookup
                const objectivePinMap = new Map<string, TaskPin>();
                taskPins.forEach((pin) => {
                  if (pin.type === "task" && pin.objectiveId) {
                    objectivePinMap.set(pin.objectiveId, pin);
                  }
                });

                // Check if task has a "main" pin (no objectiveId)
                const mainPin = taskPins.find((p) => !p.objectiveId);

                return (
                  <AccordionItem key={taskId} value={taskId}>
                    <AccordionTrigger className="py-2 px-2 hover:no-underline">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                          data-visibility-toggle
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onToggleTask) {
                              onToggleTask(taskId);
                            } else {
                              taskPins.forEach((pin) => onTogglePin(pin.id));
                            }
                          }}
                          className="shrink-0"
                        >
                          {isTaskVisible ? (
                            <IconEye className="h-3.5 w-3.5" />
                          ) : (
                            <IconEyeOff className="h-3.5 w-3.5 opacity-50" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-xs font-medium truncate flex items-center gap-1">
                            {wikiLink ? (
                              <Link
                                href={wikiLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="hover:underline text-foreground"
                              >
                                {taskName}
                              </Link>
                            ) : (
                              <span>{taskName}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const isInWatchlist = isTaskInWatchlist(taskId);
                            if (isInWatchlist) {
                              void removeTaskFromWatchlist(taskId);
                            } else {
                              void addTaskToWatchlist(taskId);
                            }
                          }}
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                          title={
                            isTaskInWatchlist(taskId)
                              ? "Remove from watchlist"
                              : "Add to watchlist"
                          }
                        >
                          {isTaskInWatchlist(taskId) ? (
                            <IconBookmark className="h-3.5 w-3.5 fill-current" />
                          ) : (
                            <IconBookmarkOff className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-2">
                      <div className="space-y-1 pt-1">
                        {/* Main task pin */}
                        {mainPin ? (
                          <div className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-muted-foreground">
                                Entire task
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => onTogglePin(mainPin.id)}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                {visiblePinIds.has(mainPin.id) ? (
                                  <IconEye className="h-3 w-3" />
                                ) : (
                                  <IconEyeOff className="h-3 w-3 opacity-50" />
                                )}
                              </button>
                              {onSelectTask && (
                                <button
                                  onClick={() =>
                                    onSelectTask(mainPin.task.id, null)
                                  }
                                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                                  title="Replace pin position"
                                >
                                  <IconMapPin className="h-3 w-3" />
                                  Pin
                                </button>
                              )}
                              {onRemove && (
                                <button
                                  onClick={() => onRemove(mainPin.id)}
                                  className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1"
                                >
                                  <IconTrash className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          onSelectTask && (
                            <div className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-muted-foreground">
                                  Entire task
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => onSelectTask(taskId, null)}
                                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                                  title="Place pin for entire task"
                                >
                                  <IconMapPin className="h-3 w-3" />
                                  Place pin
                                </button>
                              </div>
                            </div>
                          )
                        )}

                        {/* Objective pins */}
                        {task.objectives.map((objective) => {
                          const pin = objectivePinMap.get(objective.id);
                          const hasPin = !!pin;

                          return (
                            <div
                              key={objective.id}
                              className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium">
                                  {formatObjectiveType(objective.type)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {objective.description}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {hasPin ? (
                                  <>
                                    <button
                                      onClick={() => onTogglePin(pin!.id)}
                                      className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                      {visiblePinIds.has(pin!.id) ? (
                                        <IconEye className="h-3 w-3" />
                                      ) : (
                                        <IconEyeOff className="h-3 w-3 opacity-50" />
                                      )}
                                    </button>
                                    {onSelectTask && pin?.type === "task" && (
                                      <button
                                        onClick={() =>
                                          onSelectTask(
                                            pin.task.id,
                                            pin.objectiveId ?? null
                                          )
                                        }
                                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                                        title="Replace pin position"
                                      >
                                        <IconMapPin className="h-3 w-3" />
                                        Pin
                                      </button>
                                    )}
                                    {onRemove && (
                                      <button
                                        onClick={() =>
                                          onRemove(
                                            pin!.task.id,
                                            pin!.objectiveId
                                          )
                                        }
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                      >
                                        <IconTrash className="h-3 w-3" />
                                      </button>
                                    )}
                                  </>
                                ) : onSelectTask ? (
                                  <button
                                    onClick={() =>
                                      onSelectTask(taskId, objective.id)
                                    }
                                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                                    title="Place pin for this objective"
                                  >
                                    <IconMapPin className="h-3 w-3" />
                                    Place pin
                                  </button>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    No pin
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              }
            )}
          </Accordion>
        )}
      </ScrollArea>
    </div>
  );
}
