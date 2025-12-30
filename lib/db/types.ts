import type { StationLevel, Trader } from "@/lib/types/hideout";

import { type Item } from "../types/item";
import { type Map } from "../types/maps";
import { type Task } from "../types/tasks";

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
