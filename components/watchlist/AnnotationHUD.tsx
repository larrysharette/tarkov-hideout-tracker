"use client";

import { IconMapPin, IconPin } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db/index";
import { updateItemMapPosition, updateTaskMapPosition } from "@/lib/db/updates";
import { cn } from "@/lib/utils";

import { ItemSelector } from "../ui/item-selector";
import { TaskSelector } from "../ui/task-selector";

interface AnnotationHUDProps {
  mapId: string;
  mapName: string;
  isAnnotationMode: boolean;
  onPlacementStateChange?: (state: {
    isPlacingPin: boolean;
    selectedTaskId: string | null;
    selectedItemName: string | null;
  }) => void;
}

export function AnnotationHUD({
  mapId,
  mapName,
  isAnnotationMode,
  onPlacementStateChange,
}: AnnotationHUDProps) {
  const taskRecords = useLiveQuery(() => db.tasks.toArray(), []);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(
    null
  );
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);
  const [isPlacingPin, setIsPlacingPin] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Handle map click to place pin
  const handleMapClick = useCallback(
    (e: PointerEvent) => {
      // Don't place pin if clicking on a pin, button, or HUD overlay
      if (
        (e.target as HTMLElement).closest("button") ||
        (e.target as HTMLElement).closest("[data-pin-element]") ||
        (e.target as HTMLElement).closest("[data-hud-overlay]")
      ) {
        return;
      }

      if (!isPlacingPin || !mapId || !mapContainerRef.current) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = mapContainerRef.current.getBoundingClientRect();
      const x = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );
      const y = Math.max(
        0,
        Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)
      );

      try {
        if (selectedTaskId !== null) {
          // Task pin placement
          const objectiveId =
            selectedObjectiveId !== null ? selectedObjectiveId : undefined;
          void updateTaskMapPosition(selectedTaskId, mapId, {
            objectiveId,
            x,
            y,
          });
          // Don't reset - allow placing multiple pins for different objectives
          setIsPlacingPin(false);
          setSelectedObjectiveId(null);
        } else if (selectedItemName) {
          // Item pin placement
          void updateItemMapPosition(selectedItemName, mapId, { x, y });
          setIsPlacingPin(false);
          setSelectedItemName(null);
        }
      } catch (error) {
        console.error("Error placing pin:", error);
      }
    },
    [isPlacingPin, mapId, selectedTaskId, selectedObjectiveId, selectedItemName]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isPlacingPin) {
        setHoverPosition(null);
        return;
      }
      const rect = mapContainerRef.current?.getBoundingClientRect();

      if (!rect) return;

      const x = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );
      const y = Math.max(
        0,
        Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)
      );
      setHoverPosition({ x, y });
    },
    [isPlacingPin, mapContainerRef]
  );

  const handleMouseLeave = useCallback(() => {
    if (isPlacingPin) {
      setHoverPosition(null);
    }
  }, [isPlacingPin]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    mapContainerRef.current = document.getElementById(
      "map-container"
    ) as HTMLDivElement;

    if (!mapContainerRef.current) return;
    mapContainerRef.current.addEventListener("mousemove", handleMouseMove);
    mapContainerRef.current.addEventListener("mouseleave", handleMouseLeave);
    mapContainerRef.current.addEventListener("click", handleMapClick);
    return () => {
      if (!mapContainerRef.current) return;
      mapContainerRef.current.removeEventListener("mousemove", handleMouseMove);
      mapContainerRef.current.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
      mapContainerRef.current.removeEventListener("click", handleMapClick);
    };
  }, [isPlacingPin, handleMouseMove, handleMouseLeave, handleMapClick]);

  useEffect(() => {
    if (!isAnnotationMode) {
      setSelectedTaskId(null);
      setSelectedObjectiveId(null);
      setSelectedItemName(null);
      setIsPlacingPin(false);
    }
  }, [isAnnotationMode]);

  // Notify parent of placement state changes
  useEffect(() => {
    onPlacementStateChange?.({
      isPlacingPin,
      selectedTaskId,
      selectedItemName,
    });
  }, [isPlacingPin, selectedTaskId, selectedItemName, onPlacementStateChange]);

  // Update cursor style when placing pin
  useEffect(() => {
    const mapContainer = document.getElementById("map-container");
    if (!mapContainer) return;

    if (isPlacingPin) {
      mapContainer.style.cursor = "crosshair";
    } else {
      mapContainer.style.cursor = "default";
    }

    return () => {
      if (mapContainer) {
        mapContainer.style.cursor = "default";
      }
    };
  }, [isPlacingPin]);

  function handleObjectiveSelect(objectiveId: string | null) {
    setSelectedObjectiveId(objectiveId);
    setIsPlacingPin(objectiveId !== null);
  }

  return (
    <>
      {isPlacingPin && hoverPosition && (
        <div
          className="absolute z-5 pointer-events-none"
          style={{
            left: `${hoverPosition.x}%`,
            top: `${hoverPosition.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg",
              selectedTaskId
                ? "bg-cyan-500/70 border-cyan-400"
                : "bg-orange-500/70 border-orange-400"
            )}
          >
            <IconMapPin className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      <div
        data-hud-overlay
        className="absolute flex items-center gap-2 top-2 left-2 z-20 shadow-lg max-w-md w-full max-h-[calc(100%-2rem)] overflow-y-auto"
      >
        {/* Task Section */}
        {!isPlacingPin && !selectedItemName && (
          <div className="space-y-2 bg-background/50 backdrop-blur-sm px-2 py-0.5">
            <label className="text-xs font-medium text-muted-foreground">
              Tasks
            </label>
            <TaskSelector
              value={selectedTaskId || ""}
              mapId={mapId}
              mapName={mapName}
              onValueChange={(task) => {
                setSelectedTaskId(task?.id || null);
                setSelectedObjectiveId(null);
                setIsPlacingPin(false);
              }}
              placeholder="Search for a task..."
              showClear={true}
            />

            {/* Task Objectives List */}
            {selectedTaskId && (
              <SelectedTaskObjectives
                mapId={mapId}
                taskId={selectedTaskId}
                isPlacingPin={isPlacingPin}
                selectedObjectiveId={selectedObjectiveId}
                onObjectiveSelect={handleObjectiveSelect}
                onFinish={() => {
                  setIsPlacingPin(false);
                  setSelectedTaskId(null);
                  setSelectedObjectiveId(null);
                  setSelectedItemName(null);
                }}
              />
            )}
          </div>
        )}

        {/* Item Section */}
        {!selectedTaskId && !isPlacingPin && (
          <div className="space-y-2 bg-background/50 backdrop-blur-sm px-2 py-0.5">
            <label className="text-xs font-medium text-muted-foreground">
              Items
            </label>
            <ItemSelector
              value={selectedItemName || ""}
              onValueChange={(itemName) => {
                setSelectedItemName(itemName?.name || null);
                setIsPlacingPin(true);
              }}
              placeholder="Search for an item..."
              showClear={true}
            />
          </div>
        )}

        {/* Placement Status */}
        {isPlacingPin && (
          <div className="bg-background/50 backdrop-blur-sm px-2 py-0.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <IconPin className="h-3 w-3 text-primary" />
              <span>
                {selectedTaskId
                  ? selectedObjectiveId !== null
                    ? `Placing pin for: ${
                        taskRecords
                          ?.find((t) => t.id === selectedTaskId)
                          ?.objectives.find((o) => o.id === selectedObjectiveId)
                          ?.description || ""
                      }`
                    : `Placing pin for: ${
                        taskRecords?.find((t) => t.id === selectedTaskId)
                          ?.name || ""
                      }`
                  : selectedItemName
                  ? `Placing pin for: ${selectedItemName}`
                  : "Select something to annotate"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Click on the map to place the pin
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function SelectedTaskObjectives({
  mapId,
  taskId,
  isPlacingPin,
  selectedObjectiveId,
  onObjectiveSelect,
  onFinish,
}: {
  mapId: string;
  taskId: string;
  isPlacingPin: boolean;
  selectedObjectiveId: string | null;
  onObjectiveSelect: (objectiveId: string | null) => void;
  onFinish: () => void;
}) {
  const task = useLiveQuery(() => db.tasks.get(taskId), [taskId]);
  if (!task) return null;

  return (
    <div className="mt-3 space-y-1 pb-2">
      <div className="text-xs font-medium text-muted-foreground mb-2">
        Objectives
      </div>
      <div className="flex flex-col gap-1">
        <Button
          variant={
            isPlacingPin && selectedObjectiveId === null ? "default" : "outline"
          }
          size="sm"
          className="w-full justify-start text-xs h-8 text-wrap"
          onClick={() => {
            onObjectiveSelect(null);
          }}
        >
          Place entire task
        </Button>
        {task.objectives.map((objective, idx) => {
          const hasPin = task.mapPositions?.[mapId ?? ""]?.some(
            (p) => p.objectiveId === objective.id
          );

          return (
            <Button
              key={idx}
              variant={
                isPlacingPin && selectedObjectiveId === objective.id
                  ? "default"
                  : "outline"
              }
              size="sm"
              className="w-full justify-start text-xs h-auto py-1 text-wrap"
              onClick={() => {
                onObjectiveSelect(objective.id);
              }}
            >
              <span className="flex-1 text-left truncate text-wrap">
                {objective.description}
              </span>
              {hasPin && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Pin
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-end">
        <Button size="sm" onClick={onFinish}>
          Finish
        </Button>
      </div>
    </div>
  );
}
