"use client";

import { IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ItemSelector } from "@/components/ui/item-selector";

import type { RaidItem } from "./types";

interface RaidItemRowProps {
  raidItem: RaidItem;
  isLastItem: boolean;
  canRemove: boolean;
  onUpdate: (id: string, updates: Partial<RaidItem>) => void;
  onRemove: (id: string) => void;
  onAddItem: () => void;
  getComboboxRef: (id: string) => (el: HTMLDivElement | null) => void;
}

export function RaidItemRow({
  raidItem,
  isLastItem,
  canRemove,
  onUpdate,
  onRemove,
  onAddItem,
  getComboboxRef,
}: RaidItemRowProps) {
  console.log("raidItem", raidItem);
  return (
    <div className="flex gap-2 items-start bg-background">
      <div
        className="flex flex-1 flex-col md:flex-row gap-2 items-center"
        ref={getComboboxRef(raidItem.id)}
      >
        <ItemSelector
          value={raidItem.item?.id || ""}
          onValueChange={(value) => {
            console.log("value", value);
            void onUpdate(raidItem.id, { item: value || null });
          }}
          placeholder="Search for an item..."
        />

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
