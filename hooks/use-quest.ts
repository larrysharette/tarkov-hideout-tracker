import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/index";
import {
  toggleQuestCompletion as toggleQuestCompletionDb,
  markQuestsAsCompleted as markQuestsAsCompletedDb,
} from "@/lib/db/updates";

/**
 * Hook for quest-related functionality
 * Queries only task completion status from Dexie
 */
export function useQuest(taskId?: string) {
  // Query specific task if taskId provided, otherwise query all tasks
  const task = useLiveQuery(
    () => (taskId ? db.tasks.get(taskId) : undefined),
    [taskId]
  );

  const allTasks = useLiveQuery(() => db.tasks.toArray(), []);

  // Get completion status for a specific task
  const isQuestCompleted = useCallback(
    (id: string): boolean => {
      if (!allTasks) return false;
      const task = allTasks.find((t) => t.id === id);
      return task?.isCompleted ?? false;
    },
    [allTasks]
  );

  // Get all completed quest IDs
  const completedQuests = useCallback((): Set<string> => {
    if (!allTasks) return new Set();
    return new Set(
      allTasks.filter((t) => t.isCompleted).map((t) => t.id)
    );
  }, [allTasks]);

  // Toggle quest completion
  const toggleQuestCompletion = useCallback(
    async (id: string) => {
      try {
        await toggleQuestCompletionDb(id);
      } catch (err) {
        console.error("Error toggling quest completion:", err);
        throw err;
      }
    },
    []
  );

  // Mark multiple quests as completed
  const markQuestsAsCompleted = useCallback(
    async (ids: string[]) => {
      try {
        await markQuestsAsCompletedDb(ids);
      } catch (err) {
        console.error("Error marking quests as completed:", err);
        throw err;
      }
    },
    []
  );

  return {
    // Current task data (if taskId provided)
    task,
    // All tasks (for completion status lookups)
    allTasks,
    // Helper functions
    isQuestCompleted,
    completedQuests,
    toggleQuestCompletion,
    markQuestsAsCompleted,
    // Loading state
    isLoading: allTasks === undefined,
  };
}

