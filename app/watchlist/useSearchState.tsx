import { useMemo } from "react";
import { z } from "zod";

import useSearchParamState from "@/hooks/use-search-params-state";
import { stripInvalidProperties } from "@/lib/utils";

const searchQuerySchema = z
  .object({
    map: z.string(),
  })
  .partial();

type SearchQuery = z.infer<typeof searchQuerySchema>;

export function useSearchState(): [
  Partial<SearchQuery>,
  (args: Partial<SearchQuery>) => void
] {
  const [values, setState] = useSearchParamState<SearchQuery>({
    keys: ["map"],
    mode: "replace",
  });

  const vals = useMemo(() => {
    return stripInvalidProperties(searchQuerySchema, values);
  }, [values]);

  return [vals, setState];
}
