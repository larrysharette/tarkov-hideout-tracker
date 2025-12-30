"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export default function useSearchParamState<T extends Record<string, unknown>>({
  keys,
  pathname,
  mode = "append",
}: {
  keys: Array<keyof T>;
  pathname?: string;
  mode?: "replace" | "append";
}): [T, (args: Partial<T>) => void] {
  const router = useRouter();
  const currentPathname = usePathname();
  const searchParams = useSearchParams();

  // Memoize the current search params string to prevent unnecessary recreations
  const currentSearchParamsString = useMemo(
    () => searchParams?.toString() || "",
    [searchParams]
  );

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (args: Partial<T>, currentParams: string) => {
      try {
        const params = new URLSearchParams(
          mode === "append" ? currentParams : undefined
        );

        Object.entries(args).forEach(([key, value]) => {
          try {
            if (value) {
              if (typeof value === "boolean") {
                params.set(key.toString(), "1");
              } else if (value instanceof Date) {
                params.set(key.toString(), value.getTime().toString());
              } else {
                params.set(key.toString(), value.toString());
              }
            } else {
              params.delete(key.toString());
            }
          } catch (paramError) {
            console.error("Error setting param:", paramError);
          }
        });

        return params.toString();
      } catch (error) {
        console.error("Error creating query string:", error);
        // Return empty string on error to prevent breaking the app
        return "";
      }
    },
    [mode]
  );

  const state = useMemo(() => {
    try {
      return Object.fromEntries(
        keys.map((key) => [key, searchParams?.get(key.toString()) ?? undefined])
      ) as T;
    } catch (error) {
      // Return empty object on error to prevent breaking the app
      console.error("Error getting state:", error);
      return {} as T;
    }
  }, [keys, searchParams]);

  const setState = useCallback(
    (args: Partial<T>) => {
      try {
        const queryString = createQueryString(args, currentSearchParamsString);
        const newUrl = queryString
          ? `${pathname ?? currentPathname}?${queryString}`
          : pathname ?? currentPathname;

        // Only push if the URL actually changed
        const currentUrl = `${pathname ?? currentPathname}${
          currentSearchParamsString ? `?${currentSearchParamsString}` : ""
        }`;

        if (newUrl !== currentUrl) {
          router.replace(newUrl, { scroll: false });
        }
      } catch (error) {
        console.error("Error setting state:", error);
      }
    },
    [
      pathname,
      currentPathname,
      createQueryString,
      router,
      currentSearchParamsString,
    ]
  );

  return [state, setState];
}
