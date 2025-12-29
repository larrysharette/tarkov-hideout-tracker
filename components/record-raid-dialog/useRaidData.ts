import { useState, useEffect } from "react";
import type { Item } from "@/lib/types/item";
import type { Task } from "@/lib/types/tasks";
import { addVersionToApiUrl } from "@/lib/utils/version";

export function useRaidData(open: boolean) {
  const [items, setItems] = useState<Item[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoadingItems(true);
      setIsLoadingTasks(true);
      Promise.all([
        fetch(addVersionToApiUrl("/api/items"))
          .then((res) => {
            if (!res.ok) {
              throw new Error("Failed to fetch items");
            }
            return res.json();
          })
          .then((data: Item[]) => {
            setItems(data);
          })
          .catch((error) => {
            console.error("Error fetching items:", error);
          })
          .finally(() => {
            setIsLoadingItems(false);
          }),
        fetch(addVersionToApiUrl("/api/tasks"))
          .then((res) => {
            if (!res.ok) {
              throw new Error("Failed to fetch tasks");
            }
            return res.json();
          })
          .then((data: Task[]) => {
            setTasks(data);
          })
          .catch((error) => {
            console.error("Error fetching tasks:", error);
          })
          .finally(() => {
            setIsLoadingTasks(false);
          }),
      ]);
    }
  }, [open]);

  return {
    items,
    tasks,
    isLoadingItems,
    isLoadingTasks,
  };
}
