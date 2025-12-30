"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { db, type TaskRecord } from "@/lib/db";
import { type Task } from "@/lib/types/tasks";

interface TaskSelectorProps {
  mapId?: string;
  mapName?: string;
  value: string;
  onValueChange: (value: Task | null) => void;
  placeholder?: string;
  limit?: number;
  className?: string;
  showClear?: boolean;
}

/**
 * Reusable task selector combobox component
 * Displays tasks in a searchable dropdown
 */
export function TaskSelector({
  mapId,
  mapName,
  value,
  onValueChange,
  placeholder = "Search for a task...",
  limit = 10,
  className = "w-full",
  showClear = true,
}: TaskSelectorProps) {
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], [] as TaskRecord[]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (mapId) {
        return task.map?.id === mapId;
      }
      if (mapName) {
        return task.objectives.some((objective) =>
          objective.description.includes(mapName)
        );
      }
      if (task.mapPositions?.[mapId ?? ""]) {
        return true;
      }
      return true;
    });
  }, [tasks, mapName, mapId]);

  const taskIds = useMemo(
    () =>
      filteredTasks.map((task) => ({
        value: task.id,
        label: task.name,
        trader: task.trader?.name,
      })),
    [filteredTasks]
  );

  function handleValueChange(taskId: string | null) {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      onValueChange(task);
    } else {
      onValueChange(null);
    }
  }

  return (
    <Combobox
      items={taskIds}
      value={value}
      onValueChange={handleValueChange}
      limit={limit}
    >
      <ComboboxInput
        replaceInput={true}
        placeholder={placeholder}
        showClear={showClear}
        className={className}
      >
        {!!value ? (
          <span className="text-nowrap text-xs text-foreground px-2 mr-auto">
            {tasks.find((t) => t.id === value)?.name}
          </span>
        ) : undefined}
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxEmpty>No tasks found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => {
            return (
              <ComboboxItem key={item.value} value={item.value}>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex-1 text-nowrap">{item.label}</span>
                  {item.trader && (
                    <span className="text-xs text-muted-foreground">
                      ({item.trader})
                    </span>
                  )}
                </div>
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
