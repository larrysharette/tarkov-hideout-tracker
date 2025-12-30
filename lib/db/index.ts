import { Dexie, type Table } from "dexie";

import type { StationLevel, Trader } from "@/lib/types/hideout";

import { type Item } from "../types/item";
import { type Map } from "../types/maps";
import { type Task } from "../types/tasks";

Dexie.debug = true;

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
  mapPositions: Record<string, { x: number; y: number }>;
}

export interface GeneralInformationRecord {
  id: "general";
  playerLevel: number;
  traders: Array<Trader & { level: number }>;
}

export interface TaskRecord extends Task {
  isCompleted: boolean;
  isWatchlisted: boolean;
  mapId: string | null;
  mapPositions: Record<
    string,
    Array<{ objectiveId?: string; x: number; y: number }>
  >;
}

export interface MapRecord extends Map {
  imageLink: string;
}

class AdinsTarkovTrackerDB extends Dexie {
  stations!: Table<StationRecord, string>;
  inventory!: Table<InventoryRecord, string>;
  generalInformation!: Table<GeneralInformationRecord, string>;
  tasks!: Table<TaskRecord, string>;
  maps!: Table<MapRecord, string>;

  constructor() {
    super("AdinsTarkovTrackerDB");
    this.version(1).stores({
      stations: "&id,name,imageLink,currentLevel,levels",
      inventory:
        "&id,name,iconLink,wikiLink,usedInTasks,craftsFor,craftsUsing,quantityOwned,quantityNeeded,isWatchlisted,mapPositions",
      generalInformation: "&id,playerLevel,traders",
      tasks:
        "&id,mapId,name,wikiLink,neededKeys,kappaRequired,lightkeeperRequired,minPlayerLevel,trader,taskRequirements,taskImageLink,map,objectives,isCompleted,isWatchlisted,mapPositions",
      maps: "&id,name,wiki,normalizedName,imageLink",
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
