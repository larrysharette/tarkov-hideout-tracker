"use client";

import { useEffect } from "react";

import { syncAllData } from "@/lib/db/sync";

/**
 * Component that handles background data synchronization from API to Dexie
 * This runs on app mount and periodically in the background
 */
export function DataSync() {
  useEffect(() => {
    // Initial sync on mount
    syncAllData().catch((err) => {
      console.error("Error in initial data sync:", err);
    });

    // Periodic background sync (every 5 minutes)
    const interval = setInterval(() => {
      syncAllData().catch((err) => {
        console.error("Error in background sync:", err);
      });
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  return null;
}
