"use client";

import {
  IconPin,
  IconZoomIn,
  IconZoomOut,
  IconZoomScan,
} from "@tabler/icons-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "@/components/watchlist/MapPin";
import { MapScene, type MapSceneRef } from "@/components/watchlist/MapScene";
import { useMapPins } from "@/components/watchlist/useMapPins";
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
  const mapSceneRef = useRef<MapSceneRef>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [pinSize, setPinSize] = useState(0.2);

  const mapImagePath = useMemo(() => {
    if (!selectedMap || !mapName) return null;
    return `/maps/${toSnakeCase(mapName).replace("_21", "")}.webp`;
  }, [selectedMap, mapName]);

  // Get pins for watchlist
  const pins = useMapPins({
    mapId: selectedMap,
    mapName,
    isAnnotationMode: false,
    watchlistOnly: true,
  });

  if (!mapImagePath || !selectedMap || !mapImageLink) {
    return (
      <div className="text-center text-muted-foreground">
        <p className="text-sm">Select a map to view the map image</p>
      </div>
    );
  }

  const items = [
    { label: "x0.25", value: "0.1" },
    { label: "x0.5", value: "0.2" },
    { label: "x1", value: "0.3" },
    { label: "x2", value: "0.4" },
    { label: "x4", value: "0.5" },
    { label: "x8", value: "0.6" },
    { label: "x16", value: "0.7" },
  ];

  return (
    <div className="relative w-full h-[calc(100svh-15rem)] bg-stone-900/50 rounded-lg overflow-hidden">
      <MapScene
        ref={mapSceneRef}
        mapImageUrl={mapImageLink}
        disablePan={false}
        pins={pins}
        onZoomChange={(zoomed) => {
          setIsZoomed(zoomed);
        }}
        pinSize={pinSize}
        renderPin={(pin) => <MapPin pin={pin} />}
      />

      {/* Link to annotation page */}
      <div className="absolute top-4 right-4 z-20">
        <Link
          href={`/annotate/${
            mapName ? toSnakeCase(mapName).replace("_21", "") : ""
          }`}
        >
          <Button variant="outline" size="sm" className="gap-2">
            <IconPin className="h-4 w-4" />
            Annotate Map
          </Button>
        </Link>
      </div>

      <div className="absolute bottom-4 left-4 z-20">
        {/* Pin Size Control */}
        <Select
          value={pinSize.toString()}
          onValueChange={(value) => {
            if (value) {
              setPinSize(parseFloat(value));
            }
          }}
          items={items}
        >
          <SelectTrigger className="h-8 w-16 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        {isZoomed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => mapSceneRef.current?.resetCamera()}
            className="h-10 w-10 p-0"
            title="Reset Zoom"
          >
            <IconZoomScan className="size-5" />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            mapSceneRef.current?.zoomIn();
          }}
          className="h-10 w-10 p-0"
          title="Zoom In"
        >
          <IconZoomIn className="size-5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            mapSceneRef.current?.zoomOut();
          }}
          className="h-10 w-10 p-0"
          title="Zoom Out"
        >
          <IconZoomOut className="size-5" />
        </Button>
      </div>
    </div>
  );
}
