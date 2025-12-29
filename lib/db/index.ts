import Dexie, { type Table } from "dexie";
import type { StationLevel, Trader, Station } from "@/lib/types/hideout";
import { Item } from "../types/item";
import { Task } from "../types/tasks";
import { getUpgradeKey } from "@/lib/utils/hideout-data";

// Database schema - caching layer with user state flags
export interface StationRecord {
  id: string;
  name: string;
  imageLink: string;
  currentLevel: number;
  levels: Array<StationLevel & { isFocused: boolean; isCompleted: boolean }>;
}

export interface InventoryRecord extends Item {
  quantityOwned: number;
  quantityNeeded: number;
  isWatchlisted: boolean;
}

export interface GeneralInformationRecord {
  id: "general";
  playerLevel: number;
  traders: Array<Trader & { level: number }>;
}

export interface TaskRecord extends Task {
  isCompleted: boolean;
  isWatchlisted: boolean;
}

class AdinsTarkovTrackerDB extends Dexie {
  stations!: Table<StationRecord, string>;
  inventory!: Table<InventoryRecord, string>;
  generalInformation!: Table<GeneralInformationRecord, string>;
  tasks!: Table<TaskRecord, string>;

  constructor() {
    super("AdinsTarkovTrackerDB");
    this.version(1).stores({
      stations: "&id,name,imageLink,currentLevel,levels",
      inventory:
        "&id,name,iconLink,wikiLink,usedInTasks,craftsFor,craftsUsing,quantityOwned,quantityNeeded,isWatchlisted",
      generalInformation: "&id,playerLevel,traders",
      tasks:
        "&id,name,wikiLink,neededKeys,kappaRequired,lightkeeperRequired,minPlayerLevel,trader,taskRequirements,taskImageLink,map,objectives,isCompleted,isWatchlisted",
    });
  }
}

export const db = new AdinsTarkovTrackerDB();

void db.open().catch((error) => {
  console.error("Error opening database", error);
  void db.delete().then(() => {
    console.log("Database deleted, creating new one");
    void db.open();
  });
});
