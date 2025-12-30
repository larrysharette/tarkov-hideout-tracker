"use client";

import { useLiveQuery } from "dexie-react-hooks";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { db, type InventoryRecord } from "@/lib/db";
import { type Item } from "@/lib/types/item";

interface ItemSelectorProps {
  value: string;
  onValueChange: (value: Item | null) => void;
  placeholder?: string;
  limit?: number;
  className?: string;
  showClear?: boolean;
}

/**
 * Reusable item selector combobox component
 * Displays items with icons and names in a searchable dropdown
 */
export function ItemSelector({
  value,
  onValueChange,
  placeholder = "Search for an item...",
  limit = 10,
  className = "w-full",
  showClear = true,
}: ItemSelectorProps) {
  const items = useLiveQuery(
    () => db.inventory.toArray(),
    [],
    [] as InventoryRecord[]
  );

  const itemNames = items.map((item) => ({
    value: item.name,
    label: item.name,
    iconLink: item.iconLink,
  }));
  return (
    <Combobox
      items={itemNames}
      value={value}
      onValueChange={(value) => {
        const item = items.find((i) => i.name === value);
        if (item) {
          onValueChange(item);
        } else {
          onValueChange(null);
        }
      }}
      limit={limit}
    >
      <ComboboxInput
        showClear={showClear}
        placeholder={placeholder}
        className={className}
        replaceInput={true}
      >
        {!!value ? (
          <span className="text-nowrap text-xs text-foreground px-2 mr-auto">
            {items.find((i) => i.name === value)?.name}
          </span>
        ) : undefined}
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => {
            return (
              <ComboboxItem key={item.value} value={item.value}>
                <div className="flex items-center gap-2">
                  {item?.iconLink && (
                    <img
                      src={item.iconLink}
                      alt={item.label}
                      className="w-5 h-5 object-contain"
                    />
                  )}
                  <span>{item.label}</span>
                </div>
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
