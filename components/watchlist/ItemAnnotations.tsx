"use client";

import {
  IconEye,
  IconEyeOff,
  IconMapPin,
  IconTrash,
} from "@tabler/icons-react";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFuzzySearch } from "@/hooks/use-fuzzy-search";

import type { ItemPin } from "./useMapPins";

interface ItemAnnotationsProps {
  itemPins: ItemPin[];
  visiblePinIds: Set<string>;
  onTogglePin: (pinId: string) => void;
  onSelectItem?: (itemId: string) => void;
  onRemove?: (itemId: string) => void;
}

export function ItemAnnotations({
  itemPins,
  visiblePinIds,
  onTogglePin,
  onSelectItem,
  onRemove,
}: ItemAnnotationsProps) {
  // Fuzzy search for item pins
  const {
    results: filteredItemPins,
    query: itemSearch,
    setQuery: setItemSearch,
  } = useFuzzySearch(itemPins, {
    keys: [{ name: "name", weight: 1 }],
    minMatchCharLength: 2,
  });

  return (
    <div className="flex flex-col gap-2 flex-1 min-h-0">
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Items ({filteredItemPins.length})
        </label>
        <Input
          type="text"
          placeholder="Search items..."
          value={itemSearch}
          onChange={(e) => setItemSearch(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {filteredItemPins.length === 0 ? (
            <div className="text-xs text-muted-foreground py-2 text-center">
              {itemSearch ? "No items found" : "No item annotations"}
            </div>
          ) : (
            filteredItemPins.map((pin) => {
              const isVisible = visiblePinIds.has(pin.id);
              return (
                <div
                  key={pin.id}
                  className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {pin.inventory.iconLink && (
                      <img
                        src={pin.inventory.iconLink}
                        alt={pin.inventory.name || ""}
                        className="w-4 h-4 object-contain shrink-0"
                      />
                    )}
                    <div className="text-xs truncate flex-1 min-w-0 text-left">
                      {pin.inventory.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onTogglePin(pin.id)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {isVisible ? (
                        <IconEye className="h-3 w-3" />
                      ) : (
                        <IconEyeOff className="h-3 w-3 opacity-50" />
                      )}
                    </button>
                    {onSelectItem && (
                      <button
                        onClick={() => onSelectItem(pin.id)}
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                        title="Replace pin position"
                      >
                        <IconMapPin className="h-3 w-3" />
                        Pin
                      </button>
                    )}
                    {onRemove && (
                      <button
                        onClick={() => onRemove(pin.id)}
                        className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1"
                      >
                        <IconTrash className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
