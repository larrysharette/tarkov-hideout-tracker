"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Image from "next/image";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WatchlistItems } from "@/components/watchlist/WatchlistItems";
import { WatchlistMap } from "@/components/watchlist/WatchlistMap";
import { WatchlistTasks } from "@/components/watchlist/WatchlistTasks";
import { useInventory } from "@/hooks/use-inventory";
import { useWatchlistData } from "@/hooks/use-watchlist-data";
import { db } from "@/lib/db/index";
import { type MapRecord } from "@/lib/db/types";

import { useSearchState } from "./useSearchState";

export default function Content() {
  const [{ map }, setSearchState] = useSearchState();

  const allMaps = useLiveQuery(() => db.maps.toArray(), [], [] as MapRecord[]);

  const selectedMap = useMemo(() => {
    return allMaps.find((m) => m.normalizedName === map);
  }, [allMaps, map]);

  const { inventory } = useInventory();
  const { filteredTasks, filteredItems, isLoading } = useWatchlistData(
    selectedMap?.id ?? null
  );

  const availableMaps = useMemo(() => {
    return allMaps.filter(
      (m) =>
        !m.name.includes("21") &&
        !m.name.includes("Night Factory") &&
        !m.name.includes("Tutorial")
    );
  }, [allMaps]);

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

  // Show map grid when no map is selected
  if (!selectedMap) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {availableMaps.map((mapRecord) => (
          <Card
            key={mapRecord.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-0">
              <div
                className="relative aspect-video bg-stone-900/50"
                onClick={() => {
                  setSearchState({ map: mapRecord.normalizedName });
                }}
              >
                <Image
                  src={mapRecord.imageLink}
                  alt={mapRecord.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-3">{mapRecord.name}</h3>
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => {
                    setSearchState({ map: mapRecord.normalizedName });
                  }}
                >
                  View Map
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
