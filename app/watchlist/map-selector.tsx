"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/db/index";
import { type MapRecord } from "@/lib/db/types";

import { useSearchState } from "./useSearchState";

export default function MapSelector() {
  const [{ map }, setSearchState] = useSearchState();
  const maps = useLiveQuery(() => db.maps.toArray(), [], [] as MapRecord[]);

  const availableMaps = useMemo(() => {
    return maps.filter(
      (m) =>
        !m.name.includes("21") &&
        !m.name.includes("Night Factory") &&
        !m.name.includes("Tutorial")
    );
  }, [maps]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <label className="text-sm font-medium">Select Map:</label>
      <Select
        value={map || "all"}
        onValueChange={(value) => {
          setSearchState({
            map: value === "all" ? undefined : value ?? undefined,
          });
        }}
      >
        <SelectTrigger className="w-full sm:w-[300px]">
          <SelectValue>
            {map
              ? availableMaps.find((m) => m.normalizedName === map)?.name ||
                "Select a map"
              : "All Maps"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Maps</SelectItem>
          {availableMaps.map((map) => (
            <SelectItem key={map.normalizedName} value={map.normalizedName}>
              {map.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
