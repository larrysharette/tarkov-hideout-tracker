"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconPlus } from "@tabler/icons-react";
import type { Task } from "@/lib/types/tasks";
import type { RaidItem, SelectedTask } from "./types";
import { RaidItemRow } from "./RaidItemRow";
import { TaskSelector } from "./TaskSelector";
import { Item } from "@/lib/types/item";

interface RaidFormViewProps {
  isLoadingItems: boolean;
  items: Item[];
  tasks: Task[];
  raidItems: RaidItem[];
  selectedTasks: Map<string, SelectedTask>;
  playerLevel: number;
  onAddItem: () => void;
  onUpdateItem: (id: string, updates: Partial<RaidItem>) => void;
  onRemoveItem: (id: string) => void;
  onTaskSelect: (task: Task) => void;
  onTaskToggle: (taskId: string, completed: boolean) => void;
  onTaskRemove: (taskId: string) => void;
  getComboboxRef: (id: string) => (el: HTMLDivElement | null) => void;
}

export function RaidFormView({
  isLoadingItems,
  items,
  tasks,
  raidItems,
  selectedTasks,
  playerLevel,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onTaskSelect,
  onTaskToggle,
  onTaskRemove,
  getComboboxRef,
}: RaidFormViewProps) {
  const itemNames = items.map((item) => item.name);

  // Get related tasks for items being added
  const relatedTasksForRaid = useMemo(() => {
    const relatedTaskIds = new Set<string>();
    raidItems.forEach((raidItem) => {
      if (raidItem.item && raidItem.quantity > 0) {
        raidItem.item.usedInTasks?.forEach((task) => {
          relatedTaskIds.add(task.id);
        });
      }
    });
    return tasks.filter((task) => relatedTaskIds.has(task.id));
  }, [raidItems, tasks]);

  return (
    <>
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {isLoadingItems ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading items...
          </div>
        ) : (
          <>
            {relatedTasksForRaid.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="text-sm font-semibold">
                  Related Tasks ({relatedTasksForRaid.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {relatedTasksForRaid.map((task) => (
                    <Badge key={task.id} variant="outline" className="text-xs">
                      {task.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {raidItems.map((raidItem, index) => (
              <RaidItemRow
                key={raidItem.id}
                raidItem={raidItem}
                index={index}
                items={items}
                itemNames={itemNames}
                isLastItem={index === raidItems.length - 1}
                canRemove={raidItems.length > 1}
                onUpdate={onUpdateItem}
                onRemove={onRemoveItem}
                onAddItem={onAddItem}
                getComboboxRef={getComboboxRef}
              />
            ))}
          </>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={onAddItem}
          className="flex items-center gap-2"
        >
          <IconPlus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <TaskSelector
        tasks={tasks}
        selectedTasks={selectedTasks}
        playerLevel={playerLevel}
        onTaskSelect={onTaskSelect}
        onTaskToggle={onTaskToggle}
        onTaskRemove={onTaskRemove}
      />
    </>
  );
}
