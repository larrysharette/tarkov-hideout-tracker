"use client";

import { IconPin } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { MapPins } from "@/components/watchlist/MapPins";
import { toSnakeCase } from "@/lib/utils";

interface WatchlistMapProps {
  selectedMap: string | null;
  mapName: string | null;
  mapImageLink: string | null;
}

export function WatchlistMap({
  selectedMap,
  mapName,
  mapImageLink,
}: WatchlistMapProps) {
  const mapImagePath = useMemo(() => {
    if (!selectedMap || !mapName) return null;
    return `/maps/${toSnakeCase(mapName).replace("_21", "")}.webp`;
  }, [selectedMap, mapName]);

  if (!mapImagePath || !selectedMap) {
    return (
      <div className="text-center text-muted-foreground">
        <p className="text-sm">Select a map to view the map image</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100svh-15rem)] bg-stone-900/50 rounded-lg">
      <Image
        src={mapImageLink || mapImagePath}
        alt={mapName || "Map"}
        fill
        className="object-contain rounded-lg"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      {/* Read-only pins overlay */}
      <MapPins
        mapId={selectedMap}
        mapName={mapName}
        isAnnotationMode={false}
        watchlistOnly={true}
      />
      {/* Link to annotation page */}
      <div className="absolute top-4 right-4 z-10">
        <Link
          href={`/annotate/${toSnakeCase(mapName || "").replace("_21", "")}`}
        >
          <Button variant="outline" size="sm" className="gap-2">
            <IconPin className="h-4 w-4" />
            Annotate Map
          </Button>
        </Link>
      </div>
    </div>
  );
}
