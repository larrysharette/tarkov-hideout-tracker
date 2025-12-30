import type { StationLevel } from "@/lib/types/hideout";
import type { Item } from "@/lib/types/item";
import type { Task } from "@/lib/types/tasks";

export interface RaidItem {
  id: string;
  item: Item | null;
  quantity: number;
}

export interface SelectedTask {
  task: Task;
  completed: boolean;
}

export interface RaidSummary {
  hideoutProgress: Array<{
    upgrade: StationLevel;
    itemsAdded: Array<{
      itemName: string;
      quantityAdded: number;
      requiredTotal: number;
      previousOwned: number;
      newOwned: number;
    }>;
    isLocked: boolean;
  }>;
  watchlistProgress: Array<{
    itemName: string;
    previousOwned: number;
    newOwned: number;
    watchlistTarget: number;
    progress: number;
  }>;
  completedTasks: Task[];
}
