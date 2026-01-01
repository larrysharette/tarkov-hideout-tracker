"use client";

import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { ItemAnnotations } from "./ItemAnnotations";
import { TaskAnnotations } from "./TaskAnnotations";
import type { Pin } from "./useMapPins";

interface AnnotationListProps {
  pins: Pin[];
  visiblePinIds: Set<string>;
  onTogglePin: (pinId: string) => void;
  onToggleTask?: (taskId: string) => void;
  onSelectTask?: (taskId: string, objectiveId?: string | null) => void;
  onSelectItem?: (itemId: string) => void;
  onRemoveTaskPin?: (pinId: string, objectiveId?: string) => void;
  onRemoveItemPin?: (pinId: string) => void;
}

export function AnnotationList({
  pins,
  visiblePinIds,
  onTogglePin,
  onToggleTask,
  onSelectTask,
  onSelectItem,
  onRemoveTaskPin,
  onRemoveItemPin,
}: AnnotationListProps) {
  // Separate pins by type
  const taskPins = useMemo(() => {
    return pins.filter((pin) => pin.type === "task") as Array<
      Extract<Pin, { type: "task" }>
    >;
  }, [pins]);

  const itemPins = useMemo(() => {
    return pins.filter((pin) => pin.type === "item") as Array<
      Extract<Pin, { type: "item" }>
    >;
  }, [pins]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Annotations</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <TaskAnnotations
          taskPins={taskPins}
          visiblePinIds={visiblePinIds}
          onTogglePin={onTogglePin}
          onToggleTask={onToggleTask}
          onSelectTask={onSelectTask}
          onRemove={onRemoveTaskPin}
        />

        <Separator />

        <ItemAnnotations
          itemPins={itemPins}
          visiblePinIds={visiblePinIds}
          onTogglePin={onTogglePin}
          onSelectItem={onSelectItem}
          onRemove={onRemoveItemPin}
        />
      </CardContent>
    </Card>
  );
}
