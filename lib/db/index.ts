import Dexie, { type Table } from "dexie";

import {
  type GeneralInformationRecord,
  type InventoryRecord,
  type MapRecord,
  type StationRecord,
  type TaskRecord,
} from "./types";

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
