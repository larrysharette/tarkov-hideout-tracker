import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

import { db } from "@/lib/db/index";
import { type InventoryRecord, type TaskRecord } from "@/lib/db/types";
import type { Item } from "@/lib/types/item";
import type { Task } from "@/lib/types/tasks";

import { useInventory } from "./use-inventory";
import { useTaskWatchlist } from "./use-task-watchlist";

interface WatchlistItem {
  name: string;
  quantity: number;
  itemData?: Item;
}

export function useWatchlistData(selectedMap: string | null) {
  const { isLoading: isLoadingInventory } = useInventory();
  const { taskWatchlist, isLoading: isLoadingTasks } = useTaskWatchlist();
  const inventoryRecords = useLiveQuery(() => db.inventory.toArray(), []);

  const isLoading =
    isLoadingInventory || isLoadingTasks || inventoryRecords === undefined;

  const tasks = useLiveQuery(() => db.tasks.toArray(), [], [] as TaskRecord[]);
  const items = useLiveQuery(
    () => db.inventory.toArray(),
    [],
    [] as InventoryRecord[]
  );

  // Get all unique maps from tasks
  const availableMaps = useMemo(() => {
    const mapSet = new Map<string, string>(); // id -> name
    tasks.forEach((task) => {
      if (
        task.map &&
        !(
          task.map.name.includes("21") ||
          task.map.name.includes("Night Factory")
        )
      ) {
        mapSet.set(task.map.id, task.map.name);
      }
    });
    return Array.from(mapSet.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([id, name]) => ({ id, name }));
  }, [tasks]);

  // Get watchlist tasks
  const watchlistTasks = useMemo((): Task[] => {
    return tasks.filter((task) => taskWatchlist.includes(task.id));
  }, [taskWatchlist, tasks]);

  // Filter tasks by selected map
  const filteredTasks = useMemo(() => {
    // If no map selected, show all watchlist tasks
    if (!selectedMap || selectedMap === "all") {
      return watchlistTasks;
    }

    const selectedMapData = availableMaps.find((m) => m.id === selectedMap);
    if (!selectedMapData) {
      return watchlistTasks;
    }

    return watchlistTasks.filter((task) => {
      // If task.map is null, it means any location - include it
      if (!task.map) {
        return true;
      }

      // If task.map matches selected map, include it
      if (
        task.map.id === selectedMap ||
        task.map.name.toLowerCase() === selectedMapData.name.toLowerCase()
      ) {
        return true;
      }

      // Check if any objective description contains the map name
      const mapName = selectedMapData.name.toLowerCase();
      const hasMapInObjective = task.objectives.some((objective) =>
        objective.description.toLowerCase().includes(mapName)
      );

      return hasMapInObjective;
    });
  }, [watchlistTasks, selectedMap, availableMaps]);

  // Get watchlist items
  const watchlistItems = useMemo((): WatchlistItem[] => {
    if (!inventoryRecords) return [];

    const itemsMap = new Map<string, Item>();
    items.forEach((item) => {
      itemsMap.set(item.name, item);
    });

    return inventoryRecords
      .filter((item) => item.isWatchlisted && item.quantityNeeded > 0)
      .map((item) => ({
        name: item.name,
        quantity: item.quantityNeeded,
        itemData: itemsMap.get(item.name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [inventoryRecords, items]);

  // Filter items by selected map (for now, show all items - can be enhanced later)
  const filteredItems = useMemo(() => {
    return watchlistItems;
  }, [watchlistItems]);

  return {
    tasks,
    items,
    watchlistTasks,
    watchlistItems,
    availableMaps,
    filteredTasks,
    filteredItems,
    isLoading,
  };
}
