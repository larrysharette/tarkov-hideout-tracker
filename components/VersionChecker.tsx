"use client";

import { useEffect } from "react";
import { checkAndUpdateVersion } from "@/lib/utils/version";

/**
 * Client component that checks app version on mount
 * and clears cache if version has changed
 */
export function VersionChecker() {
  useEffect(() => {
    const versionChanged = checkAndUpdateVersion();

    if (versionChanged) {
      // Version changed - the query string approach will handle cache busting
      // But we can also log it for debugging
      console.log(
        "App version updated - API calls will use new version parameter"
      );
    }
  }, []);

  return null;
}
