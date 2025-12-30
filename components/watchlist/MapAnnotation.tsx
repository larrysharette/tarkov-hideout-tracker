"use client";

import { IconPin } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { AnnotationHUD } from "./AnnotationHUD";
import { MapPins } from "./MapPins";

interface MapAnnotationProps {
  mapId: string | null;
  mapImagePath: string | null;
  mapName: string | null;
}

export function MapAnnotation({
  mapId,
  mapImagePath,
  mapName,
}: MapAnnotationProps) {
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);

  if (!mapId || !mapImagePath) {
    return null;
  }

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div
        id="map-container"
        className={cn(
          "relative w-full h-full bg-stone-900/50 rounded-lg",
          !isAnnotationMode && "cursor-default"
        )}
      >
        <Image
          src={mapImagePath}
          alt={mapName || "Map"}
          fill
          className="object-contain rounded-lg"
          sizes="100vw"
        />

        {/* Hover Preview Pin */}

        <MapPins
          mapId={mapId}
          mapName={mapName}
          isAnnotationMode={isAnnotationMode}
        />
      </div>

      {/* Annotation Mode Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant={isAnnotationMode ? "default" : "outline"}
          size="sm"
          className="gap-2"
          onClick={() => setIsAnnotationMode(!isAnnotationMode)}
        >
          <IconPin className="h-4 w-4" />
          {isAnnotationMode ? "Exit Annotation" : "Annotate Map"}
        </Button>
      </div>

      {/* HUD Overlay */}
      {isAnnotationMode && (
        <AnnotationHUD
          mapId={mapId}
          mapName={mapName || ""}
          isAnnotationMode={isAnnotationMode}
        />
      )}
    </div>
  );
}
