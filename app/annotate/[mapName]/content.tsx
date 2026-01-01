"use client";

import { IconZoomIn, IconZoomOut, IconZoomScan } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnnotationHUD } from "@/components/watchlist/AnnotationHUD";
import { AnnotationList } from "@/components/watchlist/AnnotationList";
import { MapPin } from "@/components/watchlist/MapPin";
import { MapScene, type MapSceneRef } from "@/components/watchlist/MapScene";
import { useMapPins } from "@/components/watchlist/useMapPins";
import { db } from "@/lib/db";
import {
  removeItemMapPosition,
  removeTaskMapPositionByObjectiveId,
} from "@/lib/db/updates";
import { cn } from "@/lib/utils";

export default function Content({ mapName }: { mapName: string }) {
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
  const [externalTaskSelection, setExternalTaskSelection] = useState<{
    taskId: string;
    objectiveId?: string | null;
  } | null>(null);
  const [externalItemSelection, setExternalItemSelection] = useState<
    string | null
  >(null);

  const map = useLiveQuery(
    () => db.maps.where("normalizedName").equals(mapName).first(),
    [mapName]
  );

  // Get pins for the annotation list
  const pins = useMapPins({
    mapId: map?.id || null,
    mapName: map?.name || null,
    isAnnotationMode: true,
  });

  // Track previous pin IDs to detect new pins
  const previousPinIdsRef = useRef<Set<string>>(new Set());

  // Automatically add newly placed pins to visiblePinIds
  useEffect(() => {
    const currentPinIds = new Set(pins.map((pin) => pin.id));
    const previousPinIds = previousPinIdsRef.current;

    // Find new pins that weren't in the previous set
    const newPinIds = Array.from(currentPinIds).filter(
      (id) => !previousPinIds.has(id)
    );

    // Add new pins to visiblePinIds if they exist
    if (newPinIds.length > 0) {
      setVisiblePinIds((prev) => {
        const next = new Set(prev);
        newPinIds.forEach((id) => next.add(id));
        return next;
      });
    }

    // Update the ref for next comparison
    previousPinIdsRef.current = currentPinIds;
  }, [pins]);

  const mapSceneRef = useRef<MapSceneRef>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [pinSize, setPinSize] = useState(0.3);

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

  const handleRemoveTaskPin = (pinId: string, objectiveId?: string) => {
    if (map?.id) {
      void removeTaskMapPositionByObjectiveId(pinId, map.id, objectiveId);
    }
  };

  const handleRemoveItemPin = (pinId: string) => {
    if (map?.id) {
      void removeItemMapPosition(pinId, map.id);
    }
  };
  // Toggle all pins for a task
  const handleToggleTask = (taskId: string) => {
    const taskPins = pins.filter(
      (pin) => pin.type === "task" && pin.task.id === taskId
    );
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
          (pin) =>
            pin.type === "task" && pin.id === placementState.selectedTaskId
        );
        return new Set(taskPins.map((pin) => pin.id));
      } else if (placementState.selectedItemName) {
        // Show pin for the selected item
        const itemPin = pins.find(
          (pin) =>
            pin.type === "item" && pin.id === placementState.selectedItemName
        );
        return itemPin ? new Set([itemPin.id]) : new Set<string>();
      }
      return new Set<string>();
    }

    // If a task is selected but not placing, show that task's pins
    if (placementState.selectedTaskId && !placementState.isPlacingPin) {
      const taskPins = pins.filter(
        (pin) => pin.type === "task" && pin.id === placementState.selectedTaskId
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
      // but preserve any newly added pins
      if (
        (!state.isPlacingPin && placementState.isPlacingPin) ||
        (!isTaskSelected && wasTaskSelected && !state.isPlacingPin) ||
        (!isItemSelected && wasItemSelected && !state.isPlacingPin)
      ) {
        // Merge previous visibility with current pins to preserve newly added ones
        const currentPinIds = new Set(pins.map((pin) => pin.id));
        const restored = new Set(previousVisiblePinIds);
        // Add any pins that exist now but weren't in previous (newly added pins)
        currentPinIds.forEach((pinId) => {
          if (!previousVisiblePinIds.has(pinId)) {
            restored.add(pinId);
          }
        });
        setVisiblePinIds(restored);
      }

      setPlacementState(state);
    },
    [visiblePinIds, previousVisiblePinIds, placementState, pins]
  );

  // Handle task selection from AnnotationList
  const handleSelectTask = useCallback(
    (taskId: string, objectiveId?: string | null) => {
      setExternalTaskSelection({ taskId, objectiveId });
      // Clear after a moment to allow the effect to run
      setTimeout(() => {
        setExternalTaskSelection(null);
      }, 0);
    },
    []
  );

  // Handle item selection from AnnotationList
  const handleSelectItem = useCallback((itemId: string) => {
    setExternalItemSelection(itemId);
    // Clear after a moment to allow the effect to run
    setTimeout(() => {
      setExternalItemSelection(null);
    }, 0);
  }, []);

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
    <>
      {/* Map Container and Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4">
        {/* Map */}
        <div className="relative w-full h-[calc(100svh-12rem)] bg-stone-900/50 rounded-lg overflow-hidden">
          <div
            id="map-container"
            className={cn(
              "relative w-full h-full",
              placementState.isPlacingPin && "cursor-crosshair"
            )}
          >
            <MapScene
              ref={mapSceneRef}
              mapImageUrl={map.imageLink}
              onMapClick={(x, y) => {
                // Pass coordinates to AnnotationHUD via window handler
                interface WindowWithHandler extends Window {
                  __mapCoordinateClickHandler?: (x: number, y: number) => void;
                }
                const handler = (window as WindowWithHandler)
                  .__mapCoordinateClickHandler;
                if (handler) {
                  handler(x, y);
                }
              }}
              disablePan={placementState.isPlacingPin}
              pins={pins.filter((pin) => effectiveVisiblePinIds.has(pin.id))}
              onZoomChange={(zoomed) => {
                setIsZoomed(zoomed);
              }}
              pinSize={pinSize}
              renderPin={(pin) => (
                <MapPin
                  pin={pin}
                  onRemove={
                    placementState.isPlacingPin
                      ? async (pinToRemove) => {
                          if (pinToRemove.type === "task" && pinToRemove.id) {
                            const { removeTaskMapPosition } = await import(
                              "@/lib/db/updates"
                            );
                            await removeTaskMapPosition(pinToRemove.id, map.id);
                          } else if (
                            pinToRemove.type === "item" &&
                            pinToRemove.id
                          ) {
                            const { removeItemMapPosition } = await import(
                              "@/lib/db/updates"
                            );
                            await removeItemMapPosition(pinToRemove.id, map.id);
                          }
                        }
                      : undefined
                  }
                />
              )}
            />

            <AnnotationHUD
              mapId={map.id}
              mapName={map.name}
              isAnnotationMode
              onPlacementStateChange={handlePlacementStateChange}
              externalTaskSelection={externalTaskSelection}
              externalItemSelection={externalItemSelection}
              mapSceneRef={
                mapSceneRef as React.RefObject<{
                  resetCamera: () => void;
                  zoomIn: () => void;
                  zoomOut: () => void;
                } | null>
              }
              onMapCoordinateClick={() => {
                // Handler is set up in AnnotationHUD useEffect
              }}
            />
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
        </div>

        {/* Annotation List Sidebar */}
        <div className="h-[calc(100svh-12rem)]">
          <AnnotationList
            pins={pins}
            visiblePinIds={visiblePinIds}
            onTogglePin={handleTogglePin}
            onToggleTask={handleToggleTask}
            onSelectTask={handleSelectTask}
            onSelectItem={handleSelectItem}
            onRemoveTaskPin={handleRemoveTaskPin}
            onRemoveItemPin={handleRemoveItemPin}
          />
        </div>
      </div>
    </>
  );
}
