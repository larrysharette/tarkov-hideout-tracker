"use client";

import { useEffect, useRef } from "react";

import { db } from "@/lib/db/index";
import { migrateFromLocalStorage } from "@/lib/db/migration";
import { syncAllData } from "@/lib/db/sync";

/**
 * Component that handles one-time migration from localStorage to IndexedDB
 * This runs once on app mount, after ensuring base data exists
 */
export function Migration() {
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Only run migration once
    if (hasRunRef.current) {
      console.log("[Migration] Already ran, skipping");
      return;
    }

    async function runMigration() {
      try {
        console.log("[Migration] Starting migration process...");

        // Check if localStorage key exists before syncing
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("tarkov-hideout-state");
          if (!stored) {
            console.log(
              "[Migration] No localStorage data found, skipping migration"
            );
            hasRunRef.current = true;
            return;
          }
          console.log(
            "[Migration] Found localStorage data, proceeding with migration"
          );
        }

        // Wait for database to be ready
        console.log("[Migration] Waiting for database to be ready...");
        try {
          // Check if database is already open
          if (!db.isOpen()) {
            await db.open();
          }
          // Verify database is accessible by doing a simple query
          await db.stations.count();
          console.log("[Migration] Database is ready");
        } catch (error) {
          console.error("[Migration] Error ensuring database is ready:", error);
          // Wait a bit and retry
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (!db.isOpen()) {
            await db.open();
          }
          console.log("[Migration] Database ready after retry");
        }

        // First, ensure base data exists by syncing from API
        // This is needed because migration needs stations, items, tasks, etc. to exist
        console.log("[Migration] Syncing base data from API...");
        await syncAllData().catch((err) => {
          console.error(
            "[Migration] Error syncing data before migration:",
            err
          );
          // Continue even if sync fails - might have cached data
        });
        console.log("[Migration] Base data sync completed");

        // Check for and migrate localStorage data if it exists
        console.log("[Migration] Calling migrateFromLocalStorage...");
        const migrationOccurred = await migrateFromLocalStorage();
        if (migrationOccurred) {
          console.log(
            "[Migration] Migration from localStorage completed successfully"
          );
        } else {
          console.log(
            "[Migration] No migration occurred (no localStorage data or already migrated)"
          );
        }

        hasRunRef.current = true;
      } catch (error) {
        console.error("[Migration] Error during migration:", error);
        // Set hasRun to true even on error to prevent infinite retries
        hasRunRef.current = true;
      }
    }

    void runMigration();
  }, []);

  return null;
}
