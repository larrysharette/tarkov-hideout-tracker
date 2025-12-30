import { useCallback, useEffect,useState } from "react";

import type { Task } from "@/lib/types/tasks";

import type { SelectedTask } from "./types";

export function useSelectedTasks(resetTrigger: boolean) {
  const [selectedTasks, setSelectedTasks] = useState<Map<string, SelectedTask>>(
    new Map()
  );

  // Reset when trigger changes
  useEffect(() => {
    if (resetTrigger) {
      setSelectedTasks(new Map());
    }
  }, [resetTrigger]);

  const addTask = useCallback((task: Task) => {
    setSelectedTasks((prev) => {
      if (prev.has(task.id)) return prev;
      const newMap = new Map(prev);
      newMap.set(task.id, {
        task,
        completed: false,
      });
      return newMap;
    });
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setSelectedTasks((prev) => {
      const newMap = new Map(prev);
      newMap.delete(taskId);
      return newMap;
    });
  }, []);

  const toggleTaskCompletion = useCallback(
    (taskId: string, completed: boolean) => {
      setSelectedTasks((prev) => {
        const newMap = new Map(prev);
        const selectedTask = newMap.get(taskId);
        if (selectedTask) {
          newMap.set(taskId, {
            ...selectedTask,
            completed,
          });
        }
        return newMap;
      });
    },
    []
  );

  const getCompletedTaskIds = useCallback(() => {
    return Array.from(selectedTasks.values())
      .filter((st) => st.completed)
      .map((st) => st.task.id);
  }, [selectedTasks]);

  return {
    selectedTasks,
    addTask,
    removeTask,
    toggleTaskCompletion,
    getCompletedTaskIds,
  };
}

