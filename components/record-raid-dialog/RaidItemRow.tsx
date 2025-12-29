"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { IconX } from "@tabler/icons-react";
import type { Item } from "@/app/api/items/route";
import type { RaidItem } from "./types";

interface RaidItemRowProps {
  raidItem: RaidItem;
  index: number;
  items: Item[];
  itemNames: string[];
  isLastItem: boolean;
  canRemove: boolean;
  onUpdate: (id: string, updates: Partial<RaidItem>) => void;
  onRemove: (id: string) => void;
  onAddItem: () => void;
  getComboboxRef: (id: string) => (el: HTMLDivElement | null) => void;
}

export function RaidItemRow({
  raidItem,
  index,
  items,
  itemNames,
  isLastItem,
  canRemove,
  onUpdate,
  onRemove,
  onAddItem,
  getComboboxRef,
}: RaidItemRowProps) {
  return (
    <div className="flex gap-2 items-start bg-background">
      <div
        className="flex flex-1 flex-col md:flex-row gap-2 items-center"
        ref={getComboboxRef(raidItem.id)}
      >
        <Combobox
          items={itemNames}
          value={raidItem.item?.name || ""}
          onValueChange={(value) => {
            const selectedItem = items.find((item) => item.name === value);
            onUpdate(raidItem.id, { item: selectedItem || null });
          }}
          limit={10}
        >
          <ComboboxInput
            showClear
            placeholder="Search for an item..."
            className="w-full"
          />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(itemName) => {
                const item = items.find((i) => i.name === itemName);
                return (
                  <ComboboxItem key={item?.id ?? itemName} value={itemName}>
                    <div className="flex items-center gap-2">
                      {item?.iconLink && (
                        <img
                          src={item.iconLink}
                          alt={itemName}
                          className="w-5 h-5 object-contain"
                        />
                      )}
                      <span>{itemName}</span>
                    </div>
                  </ComboboxItem>
                );
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <Input
          type="number"
          min="0"
          placeholder="Quantity"
          value={raidItem.quantity || ""}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10) || 0;
            onUpdate(raidItem.id, { quantity: value });
          }}
          onKeyDown={(e) => {
            if (isLastItem && (e.key === "Tab" || e.key === "Enter")) {
              e.preventDefault();
              onAddItem();
            }
          }}
          className="w-full md:max-w-20"
        />
      </div>

      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(raidItem.id)}
        >
          <IconX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

