"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { AnnotationHUD } from "@/components/watchlist/AnnotationHUD";
import { AnnotationList } from "@/components/watchlist/AnnotationList";
import { MapPins } from "@/components/watchlist/MapPins";
import { useMapPins } from "@/components/watchlist/useMapPins";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export default function Content({ mapName }: { mapName: string }) {
  const [isAnnotationMode] = useState(true); // Always in annotation mode on this page
  const [visiblePinIds, setVisiblePinIds] = useState<Set<string>>(new Set());
  const [previousVisiblePinIds, setPreviousVisiblePinIds] = useState<
    Set<string>
  >(new Set());
  const [placementState, setPlacementState] = useState<{
    isPlacingPin: boolean;
    selectedTaskId: string | null;
    selectedItemName: string | null;
  }>({
    isPlacingPin: false,
    selectedTaskId: null,
    selectedItemName: null,
  });

  const map = useLiveQuery(
    () => db.maps.where("normalizedName").equals(mapName).first(),
    [mapName]
  );

  console.log("map", map);

  // Get pins for the annotation list
  const pins = useMapPins({
    mapId: map?.id || null,
    mapName: map?.name || null,
    isAnnotationMode,
  });

  // Toggle pin visibility
  const handleTogglePin = (pinId: string) => {
    setVisiblePinIds((prev) => {
      const next = new Set(prev);
      if (next.has(pinId)) {
        next.delete(pinId);
      } else {
        next.add(pinId);
      }
      return next;
    });
  };

  // Toggle all pins for a task
  const handleToggleTask = (taskId: string) => {
    const taskPins = pins.filter((pin) => pin.taskId === taskId);
    if (taskPins.length === 0) return;

    // Check if all pins are visible
    const allVisible = taskPins.every((pin) => visiblePinIds.has(pin.id));

    setVisiblePinIds((prev) => {
      const next = new Set(prev);
      if (allVisible) {
        // Hide all pins for this task
        taskPins.forEach((pin) => next.delete(pin.id));
      } else {
        // Show all pins for this task
        taskPins.forEach((pin) => next.add(pin.id));
      }
      return next;
    });
  };

  // Calculate visible pins based on placement state
  const effectiveVisiblePinIds = useMemo((): Set<string> => {
    // If placing a pin, show only pins for the selected task/item and hide others
    if (placementState.isPlacingPin) {
      if (placementState.selectedTaskId) {
        // Show all pins for the selected task
        const taskPins = pins.filter(
          (pin) => pin.taskId === placementState.selectedTaskId
        );
        return new Set(taskPins.map((pin) => pin.id));
      } else if (placementState.selectedItemName) {
        // Show pin for the selected item
        const itemPin = pins.find(
          (pin) => pin.itemName === placementState.selectedItemName
        );
        return itemPin ? new Set([itemPin.id]) : new Set<string>();
      }
      return new Set<string>();
    }

    // If a task is selected but not placing, show that task's pins
    if (placementState.selectedTaskId && !placementState.isPlacingPin) {
      const taskPins = pins.filter(
        (pin) => pin.taskId === placementState.selectedTaskId
      );
      return new Set(taskPins.map((pin) => pin.id));
    }

    // Otherwise, use the user's selected visibility
    return visiblePinIds;
  }, [placementState, pins, visiblePinIds]);

  // Handle placement state changes
  const handlePlacementStateChange = useCallback(
    (state: {
      isPlacingPin: boolean;
      selectedTaskId: string | null;
      selectedItemName: string | null;
    }) => {
      // When a task/item is first selected, save current visibility state
      const wasTaskSelected = placementState.selectedTaskId !== null;
      const isTaskSelected = state.selectedTaskId !== null;
      const wasItemSelected = placementState.selectedItemName !== null;
      const isItemSelected = state.selectedItemName !== null;

      if (
        (isTaskSelected && !wasTaskSelected) ||
        (isItemSelected && !wasItemSelected)
      ) {
        setPreviousVisiblePinIds(new Set(visiblePinIds));
      }

      // When finishing placement or deselecting, restore previous visibility
      if (
        (!state.isPlacingPin && placementState.isPlacingPin) ||
        (!isTaskSelected && wasTaskSelected && !state.isPlacingPin) ||
        (!isItemSelected && wasItemSelected && !state.isPlacingPin)
      ) {
        setVisiblePinIds(new Set<string>(previousVisiblePinIds));
      }

      setPlacementState(state);
    },
    [visiblePinIds, previousVisiblePinIds]
  );

  if (!map) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          The map "{mapName}" could not be found.
        </p>
        <Link href="/annotate">
          <Button variant="outline">Back to Maps</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Map Container and Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4">
        {/* Map */}
        <div className="relative w-full h-[calc(100svh-12rem)] bg-stone-900/50 rounded-lg">
          <div
            id="map-container"
            className={cn(
              "relative w-full h-full rounded-lg",
              isAnnotationMode && "ring-2 ring-primary"
            )}
          >
            <Image
              src={map.imageLink}
              alt={map.name}
              fill
              className="object-contain rounded-lg"
              sizes="(max-width: 1024px) 100vw, 75vw"
            />

            {/* Pins Overlay */}
            <MapPins
              mapId={map.id}
              mapName={map.name}
              isAnnotationMode={isAnnotationMode}
              visiblePinIds={effectiveVisiblePinIds}
            />
          </div>

          {/* HUD Overlay */}
          {isAnnotationMode && (
            <AnnotationHUD
              mapId={map.id}
              mapName={map.name}
              isAnnotationMode={isAnnotationMode}
              onPlacementStateChange={handlePlacementStateChange}
            />
          )}
        </div>

        {/* Annotation List Sidebar */}
        <div className="h-[calc(100svh-12rem)]">
          <AnnotationList
            pins={pins}
            visiblePinIds={visiblePinIds}
            onTogglePin={handleTogglePin}
            onToggleTask={handleToggleTask}
          />
        </div>
      </div>
    </>
  );
}
