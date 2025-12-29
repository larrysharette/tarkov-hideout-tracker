import { APP_VERSION } from "@/changelog-data";

const VERSION_STORAGE_KEY = "tarkov-tracker-version";

/**
 * Gets the current app version
 */
export function getAppVersion(): string {
  return APP_VERSION;
}

/**
 * Checks if the stored version differs from the current version
 * Updates localStorage with the current version
 * Returns true if version changed (or first time)
 */
export function checkAndUpdateVersion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);
  const currentVersion = getAppVersion();

  if (storedVersion !== currentVersion) {
    localStorage.setItem(VERSION_STORAGE_KEY, currentVersion);
    return true;
  }

  return false;
}

/**
 * Adds the current app version as a query parameter to an API URL
 * This ensures browser cache is invalidated when the version changes
 */
export function addVersionToApiUrl(url: string): string {
  const version = getAppVersion();
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${version}`;
}
