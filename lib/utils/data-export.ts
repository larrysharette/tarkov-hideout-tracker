import * as yaml from "yaml";

import { applyUserStateToDexie } from "@/lib/db/migration";
import { getUserHideoutState } from "@/lib/db/queries";
import type { UserHideoutState } from "@/lib/types/hideout";

// Legacy type for backward compatibility with export/import
export interface StoredState {
  version: number;
  userState: UserHideoutState;
}

const CURRENT_VERSION = 1;

/**
 * Encodes the stored state to a compact YAML format
 */
export function encodeData(state: StoredState): string {
  return yaml.stringify(state, null, {
    indent: 2,
    lineWidth: 0, // No line wrapping for compactness
    simpleKeys: false,
  });
}

/**
 * Decodes a YAML string back to stored state
 */
export function decodeData(yamlString: string): StoredState {
  try {
    const parsed = yaml.parse(yamlString);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid YAML structure");
    }
    return parsed as StoredState;
  } catch (_error) {
    throw new Error("Invalid YAML format. Please check your import data.");
  }
}

/**
 * Migration pipeline - migrates data from old versions to current version
 */
function migrateData(data: StoredState): StoredState {
  const migrated = data;

  // Version 1 -> 2 migrations would go here
  // if (migrated.version === 1) {
  //   migrated = migrateV1ToV2(migrated);
  // }

  // Ensure we have all required fields with defaults
  if (!migrated.userState) {
    migrated.userState = {
      stationLevels: {},
      inventory: {},
      focusedUpgrades: [],
      traderLevels: {},
      completedQuests: [],
    };
  }

  const userState = migrated.userState;
  migrated.userState = {
    stationLevels: userState.stationLevels || {},
    inventory: userState.inventory || {},
    focusedUpgrades: userState.focusedUpgrades || [],
    traderLevels: userState.traderLevels || {},
    completedQuests: userState.completedQuests || [],
  };

  // Update version to current
  migrated.version = CURRENT_VERSION;

  return migrated;
}

/**
 * Imports and migrates data from encoded string
 */
export function importData(encoded: string): StoredState {
  const decoded = decodeData(encoded);
  return migrateData(decoded);
}

/**
 * Exports current state from Dexie
 */
export async function exportCurrentState(): Promise<string | null> {
  try {
    const userState = await getUserHideoutState();

    const state: StoredState = {
      version: CURRENT_VERSION,
      userState,
    };

    return encodeData(state);
  } catch (error) {
    console.error("Error exporting state:", error);
    return null;
  }
}

/**
 * Imports data to Dexie
 */
export async function importToDexie(encoded: string): Promise<void> {
  const migrated = importData(encoded);
  await applyUserStateToDexie(migrated.userState);
}

/**
 * @deprecated Use importToDexie instead
 * Legacy function kept for backward compatibility
 */
export function importToLocalStorage(encoded: string): void {
  const migrated = importData(encoded);
  if (typeof window !== "undefined") {
    localStorage.setItem("tarkov-hideout-state", JSON.stringify(migrated));
  }
}
