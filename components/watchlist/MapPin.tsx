"use client";

import { IconMapPin, IconX } from "@tabler/icons-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { Pin } from "./useMapPins";

interface MapPinProps {
  pin: Pin;
  onRemove?: (pin: Pin) => void;
}

export function MapPin({ pin, onRemove }: MapPinProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        data-pin-element
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg border-2 border-white/20",
          pin.type === "task"
            ? "bg-cyan-500 hover:bg-cyan-400"
            : "bg-orange-500 hover:bg-orange-400"
        )}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <IconMapPin className="w-4 h-4 text-white" />
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xl p-0 bg-background text-foreground border shadow-xl"
      >
        <div className="px-3 py-2 text-xs">
          {pin.type === "task" ? (
            <div className="space-y-1">
              <div className="font-semibold text-foreground">
                {pin.taskName}
              </div>
              {pin.objectiveId &&
                pin.objectiveType &&
                pin.objectiveDescription && (
                  <div className="text-muted-foreground">
                    {pin.objectiveType} - {pin.objectiveDescription}
                  </div>
                )}
              {onRemove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void onRemove(pin);
                  }}
                  className="mt-2 text-destructive hover:text-destructive/80 flex items-center gap-1 text-xs"
                  title="Remove pin"
                >
                  <IconX className="w-3 h-3" />
                  Remove pin
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {pin.itemIconLink && (
                <img
                  src={pin.itemIconLink}
                  alt={pin.itemName || ""}
                  className="w-5 h-5 object-contain"
                />
              )}
              <div className="flex-1">
                <div className="font-medium text-foreground">
                  {pin.itemName}
                </div>
                {onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void onRemove(pin);
                    }}
                    className="mt-1 text-destructive hover:text-destructive/80 flex items-center gap-1 text-xs"
                    title="Remove pin"
                  >
                    <IconX className="w-3 h-3" />
                    Remove pin
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
