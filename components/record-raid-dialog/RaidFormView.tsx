"use client";

import { IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { type Item } from "@/lib/types/item";
import type { Task } from "@/lib/types/tasks";

import { RaidItemRow } from "./RaidItemRow";
import { TaskSelector } from "./TaskSelector";
import type { RaidItem, SelectedTask } from "./types";

interface RaidFormViewProps {
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
  return (
    <>
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {raidItems.map((raidItem, index) => (
          <RaidItemRow
            key={raidItem.id}
            raidItem={raidItem}
            isLastItem={index === raidItems.length - 1}
            canRemove={raidItems.length > 1}
            onUpdate={onUpdateItem}
            onRemove={onRemoveItem}
            onAddItem={onAddItem}
            getComboboxRef={getComboboxRef}
          />
        ))}
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
        selectedTasks={selectedTasks}
        playerLevel={playerLevel}
        onTaskSelect={onTaskSelect}
        onTaskToggle={onTaskToggle}
        onTaskRemove={onTaskRemove}
      />
    </>
  );
}
