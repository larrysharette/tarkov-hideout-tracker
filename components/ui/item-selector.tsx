"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

interface ItemWithIcon {
  name: string;
  iconLink?: string;
  id?: string;
}

interface ItemSelectorProps {
  items: ItemWithIcon[];
  itemNames: string[];
  value: string;
  onValueChange: (value: string | null) => void;
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
  items,
  itemNames,
  value,
  onValueChange,
  placeholder = "Search for an item...",
  limit = 10,
  className = "w-full",
  showClear = true,
}: ItemSelectorProps) {
  return (
    <Combobox
      items={itemNames}
      value={value}
      onValueChange={onValueChange}
      limit={limit}
    >
      <ComboboxInput
        showClear={showClear}
        placeholder={placeholder}
        className={className}
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
  );
}

