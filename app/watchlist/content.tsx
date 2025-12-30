"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { WatchlistItems } from "@/components/watchlist/WatchlistItems";
import { WatchlistMap } from "@/components/watchlist/WatchlistMap";
import { WatchlistTasks } from "@/components/watchlist/WatchlistTasks";
import { useInventory } from "@/hooks/use-inventory";
import { useWatchlistData } from "@/hooks/use-watchlist-data";
import { db, type MapRecord } from "@/lib/db";

import { useSearchState } from "./useSearchState";

export default function Content() {
  const [{ map }] = useSearchState();

  const allMaps = useLiveQuery(() => db.maps.toArray(), [], [] as MapRecord[]);

  const selectedMap = useMemo(() => {
    return allMaps.find((m) => m.normalizedName === map);
  }, [allMaps, map]);

  const { inventory } = useInventory();
  const { filteredTasks, filteredItems, isLoading } = useWatchlistData(
    selectedMap?.id ?? null
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Watchlist Overview</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-2">
      {/* Left Column - Map Image */}
      <div className="order-2 lg:order-1">
        <WatchlistMap
          selectedMap={selectedMap?.id ?? null}
          mapName={selectedMap?.name ?? null}
          mapImageLink={selectedMap?.imageLink ?? null}
        />
      </div>

      {/* Right Column - Tasks and Items */}
      <div className="order-1 lg:order-2">
        <Card className="h-[calc(100svh-15rem)] overflow-y-auto">
          <CardContent className="py-2">
            <WatchlistTasks tasks={filteredTasks} />

            {/* Separator */}
            {(filteredTasks.length > 0 || filteredItems.length > 0) && (
              <div className="border-t my-2" />
            )}

            <WatchlistItems items={filteredItems} inventory={inventory} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
