import * as yaml from "yaml";
import type { StoredState } from "@/contexts/HideoutContext";

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
  } catch (error) {
    throw new Error("Invalid YAML format. Please check your import data.");
  }
}

/**
 * Migration pipeline - migrates data from old versions to current version
 */
function migrateData(data: StoredState): StoredState {
  let migrated = data;

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
 * Exports current state from localStorage
 */
export function exportCurrentState(): string | null {
  try {
    const stored = localStorage.getItem("tarkov-hideout-state");
    if (!stored) return null;

    const parsed: StoredState = JSON.parse(stored);
    return encodeData(parsed);
  } catch (error) {
    console.error("Error exporting state:", error);
    return null;
  }
}

/**
 * Imports data to localStorage
 */
export function importToLocalStorage(encoded: string): void {
  const migrated = importData(encoded);
  localStorage.setItem("tarkov-hideout-state", JSON.stringify(migrated));
}
