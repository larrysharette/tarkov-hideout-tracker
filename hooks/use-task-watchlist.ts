import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useMemo } from "react";

import { db } from "@/lib/db/index";
import {
  addTaskToWatchlist as addTaskToWatchlistDb,
  removeTaskFromWatchlist as removeTaskFromWatchlistDb,
} from "@/lib/db/updates";

/**
 * Hook for task watchlist management
 * Queries task watchlist status from Dexie
 */
export function useTaskWatchlist() {
  // Query all tasks to get watchlist status
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);

  // Get watchlisted task IDs
  const watchlistedTaskIds = useMemo((): Set<string> => {
    if (!tasks) return new Set();
    return new Set(tasks.filter((t) => t.isWatchlisted).map((t) => t.id));
  }, [tasks]);

  // Check if task is in watchlist
  const isTaskInWatchlist = useCallback(
    (taskId: string): boolean => {
      return watchlistedTaskIds.has(taskId);
    },
    [watchlistedTaskIds]
  );

  // Get all watchlisted task IDs as array
  const taskWatchlist = useMemo((): string[] => {
    return Array.from(watchlistedTaskIds);
  }, [watchlistedTaskIds]);

  // Add task to watchlist
  const addTaskToWatchlist = useCallback(async (taskId: string) => {
    try {
      await addTaskToWatchlistDb(taskId);
    } catch (err) {
      console.error("Error adding task to watchlist:", err);
      throw err;
    }
  }, []);

  // Remove task from watchlist
  const removeTaskFromWatchlist = useCallback(async (taskId: string) => {
    try {
      await removeTaskFromWatchlistDb(taskId);
    } catch (err) {
      console.error("Error removing task from watchlist:", err);
      throw err;
    }
  }, []);

  return {
    watchlistedTaskIds,
    taskWatchlist,
    isTaskInWatchlist,
    addTaskToWatchlist,
    removeTaskFromWatchlist,
    isLoading: tasks === undefined,
  };
}

