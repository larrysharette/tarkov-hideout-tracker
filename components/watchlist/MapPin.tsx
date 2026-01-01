"use client";

import { IconMapPin, IconX } from "@tabler/icons-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatObjectiveType } from "@/lib/utils";

import type { Pin } from "./useMapPins";

interface MapPinProps {
  pin: Pin;
  onRemove?: (pin: Pin) => void;
  onSelectForReplacement?: (pin: Pin) => void;
  isSelectedForReplacement?: boolean;
}

export function MapPin({
  pin,
  onRemove,
  onSelectForReplacement,
  isSelectedForReplacement,
}: MapPinProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        data-pin-element
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg border-2 border-white/20",
          pin.type === "task"
            ? "bg-cyan-500 hover:bg-cyan-400"
            : "bg-background",
          isSelectedForReplacement && "ring-2 ring-yellow-400 ring-offset-2"
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (onSelectForReplacement) {
            onSelectForReplacement(pin);
          }
        }}
      >
        {pin.type === "item" ? (
          <img
            src={pin.inventory.iconLink}
            alt={pin.inventory.name || ""}
            className="w-4 h-4 object-contain"
          />
        ) : (
          <IconMapPin className="w-4 h-4 text-white" />
        )}
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xl p-0 bg-background text-foreground border shadow-xl"
      >
        <div className="px-3 py-2 text-xs">
          {pin.type === "task" ? (
            <div className="space-y-1">
              <div className="font-semibold text-foreground">{pin.name}</div>
              {pin.objectiveId &&
                pin.objectiveType &&
                pin.objectiveDescription && (
                  <div className="text-muted-foreground">
                    {formatObjectiveType(pin.objectiveType)} -{" "}
                    {pin.objectiveDescription}
                  </div>
                )}
              <div className="mt-2 flex flex-col gap-1">
                {onSelectForReplacement && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectForReplacement(pin);
                    }}
                    className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs"
                    title="Replace pin position"
                  >
                    <IconMapPin className="w-3 h-3" />
                    Replace pin
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void onRemove(pin);
                    }}
                    className="text-destructive hover:text-destructive/80 flex items-center gap-1 text-xs"
                    title="Remove pin"
                  >
                    <IconX className="w-3 h-3" />
                    Remove pin
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {pin.inventory.iconLink && (
                <img
                  src={pin.inventory.iconLink}
                  alt={pin.inventory.name || ""}
                  className="w-5 h-5 object-contain"
                />
              )}
              <div className="flex-1">
                <div className="font-medium text-foreground">
                  {pin.inventory.name}
                </div>
                <div className="mt-1 flex flex-col gap-1">
                  {onSelectForReplacement && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectForReplacement(pin);
                      }}
                      className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs"
                      title="Replace pin position"
                    >
                      <IconMapPin className="w-3 h-3" />
                      Replace pin
                    </button>
                  )}
                  {onRemove && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void onRemove(pin);
                      }}
                      className="text-destructive hover:text-destructive/80 flex items-center gap-1 text-xs"
                      title="Remove pin"
                    >
                      <IconX className="w-3 h-3" />
                      Remove pin
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
