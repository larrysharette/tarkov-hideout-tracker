"use client";

import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { Pin } from "./useMapPins";

interface AnnotationListProps {
  pins: Pin[];
  visiblePinIds: Set<string>;
  onTogglePin: (pinId: string) => void;
  onToggleTask?: (taskId: string) => void;
}

export function AnnotationList({
  pins,
  visiblePinIds,
  onTogglePin,
  onToggleTask,
}: AnnotationListProps) {
  const [taskSearch, setTaskSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  // Separate pins by type
  const taskPins = useMemo(() => {
    return pins.filter((pin) => pin.type === "task");
  }, [pins]);

  const itemPins = useMemo(() => {
    return pins.filter((pin) => pin.type === "item");
  }, [pins]);

  // Filter tasks by search
  const filteredTaskPins = useMemo(() => {
    if (!taskSearch.trim()) return taskPins;
    const searchLower = taskSearch.toLowerCase();
    return taskPins.filter(
      (pin) =>
        pin.taskName?.toLowerCase().includes(searchLower) ||
        pin.objectiveDescription?.toLowerCase().includes(searchLower) ||
        pin.objectiveType?.toLowerCase().includes(searchLower)
    );
  }, [taskPins, taskSearch]);

  // Filter items by search
  const filteredItemPins = useMemo(() => {
    if (!itemSearch.trim()) return itemPins;
    const searchLower = itemSearch.toLowerCase();
    return itemPins.filter((pin) =>
      pin.itemName?.toLowerCase().includes(searchLower)
    );
  }, [itemPins, itemSearch]);

  // Group task pins by task name
  const groupedTaskPins = useMemo(() => {
    const groups = new Map<string, Pin[]>();
    filteredTaskPins.forEach((pin) => {
      const key = pin.taskId || "unknown";
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(pin);
    });
    return Array.from(groups.entries()).map(([taskId, pins]) => ({
      taskId,
      taskName: pins[0]?.taskName || "Unknown Task",
      pins,
    }));
  }, [filteredTaskPins]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Annotations</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Tasks Section */}
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
          <ScrollArea className="flex-1">
            <div className="space-y-1">
              {groupedTaskPins.length === 0 ? (
                <div className="text-xs text-muted-foreground py-2 text-center">
                  {taskSearch ? "No tasks found" : "No task annotations"}
                </div>
              ) : (
                groupedTaskPins.map(({ taskId, taskName, pins: taskPins }) => {
                  // Check if all pins for this task are visible
                  const allPinsVisible = taskPins.every((pin) =>
                    visiblePinIds.has(pin.id)
                  );
                  const isTaskVisible = allPinsVisible && taskPins.length > 0;

                  return (
                    <Button
                      key={taskId}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start h-auto py-1.5 px-2 text-xs",
                        isTaskVisible && "bg-muted/50"
                      )}
                      onClick={() => {
                        if (onToggleTask) {
                          onToggleTask(taskId);
                        } else {
                          // Fallback: toggle all pins individually
                          taskPins.forEach((pin) => onTogglePin(pin.id));
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isTaskVisible ? (
                          <IconEye className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <IconEyeOff className="h-3.5 w-3.5 shrink-0 opacity-50" />
                        )}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-xs font-medium truncate">
                            {taskName}
                          </div>
                          {taskPins.length > 1 && (
                            <div className="text-xs text-muted-foreground truncate">
                              {taskPins.length} objectives
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Items Section */}
        <div className="flex flex-col gap-2 flex-1 min-h-0">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Items ({filteredItemPins.length})
            </label>
            <Input
              type="text"
              placeholder="Search items..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-1">
              {filteredItemPins.length === 0 ? (
                <div className="text-xs text-muted-foreground py-2 text-center">
                  {itemSearch ? "No items found" : "No item annotations"}
                </div>
              ) : (
                filteredItemPins.map((pin) => {
                  const isVisible = visiblePinIds.has(pin.id);
                  return (
                    <Button
                      key={pin.id}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start h-auto py-1.5 px-2 text-xs",
                        isVisible && "bg-muted/50"
                      )}
                      onClick={() => onTogglePin(pin.id)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isVisible ? (
                          <IconEye className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <IconEyeOff className="h-3.5 w-3.5 shrink-0 opacity-50" />
                        )}
                        {pin.itemIconLink && (
                          <img
                            src={pin.itemIconLink}
                            alt={pin.itemName || ""}
                            className="w-4 h-4 object-contain shrink-0"
                          />
                        )}
                        <div className="text-xs truncate flex-1 min-w-0 text-left">
                          {pin.itemName}
                        </div>
                      </div>
                    </Button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

