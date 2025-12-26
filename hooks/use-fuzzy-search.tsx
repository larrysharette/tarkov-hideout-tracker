import Fuse, { type FuseResultMatch } from "fuse.js";
import { useEffect, useMemo, useState } from "react";

export interface FuzzySearchOptions<T> {
  keys?: Array<keyof T | { name: keyof T; weight?: number }>;
  q?: string;
  threshold?: number;
  includeScore?: boolean;
  includeMatches?: boolean;
  minMatchCharLength?: number;
  shouldSort?: boolean;
  findAllMatches?: boolean;
}

export interface FuzzySearchResult<T> {
  item: T;
  score?: number;
  matches?: FuseResultMatch[];
}

export interface UseFuzzySearchReturn<T> {
  results: T[];
  setQuery: (query: string | undefined) => void;
  clear: () => void;
  query: string;
  isSearching: boolean;
}

export function useFuzzySearch<T>(
  data: T[],
  options: FuzzySearchOptions<T>
): UseFuzzySearchReturn<T> {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (options.q) {
      setQuery(options.q);
    }
  }, [data, options.q]);

  const {
    keys,
    threshold = 0.2,
    includeScore = true,
    includeMatches = true,
    minMatchCharLength = 1,
    shouldSort = true,
    findAllMatches = false,
  } = options;

  // Create Fuse instance with memoized options
  const fuse = useMemo(() => {
    if (!data.length) return null;

    return new Fuse(data, {
      keys: keys?.map((key) =>
        typeof key === "string" ||
        typeof key === "number" ||
        typeof key === "symbol"
          ? { name: key as string, weight: 1 }
          : { name: key.name as string, weight: key.weight ?? 1 }
      ),
      threshold,
      includeScore,
      includeMatches,
      minMatchCharLength,
      shouldSort,
      findAllMatches,
    });
  }, [
    data,
    keys,
    threshold,
    includeScore,
    includeMatches,
    minMatchCharLength,
    shouldSort,
    findAllMatches,
  ]);

  // Filtered results based on current query
  const results = useMemo(() => {
    if (!fuse || !query?.trim() || options.q === "") return data;

    const searchResults = fuse.search(query);
    return searchResults.map((result) => result.item);
  }, [fuse, query, data, options.q]);

  const clear = () => setQuery("");

  return {
    results,
    setQuery: (query: string | undefined) => setQuery(query ?? ""),
    clear,
    query,
    isSearching: query.length > 0,
  };
}
