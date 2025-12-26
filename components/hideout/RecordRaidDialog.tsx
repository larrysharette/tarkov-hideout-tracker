"use client";

import { useState, useEffect, useCallback } from "react";
import { useHideout } from "@/contexts/HideoutContext";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { IconPlus, IconX } from "@tabler/icons-react";
import type { Item } from "@/app/api/items/route";

interface RaidItem {
  id: string;
  item: Item | null;
  quantity: number;
}

export function RecordRaidDialog() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [raidItems, setRaidItems] = useState<RaidItem[]>([
    { id: crypto.randomUUID(), item: null, quantity: 0 },
  ]);
  const { setInventoryQuantity, userState } = useHideout();

  // Fetch items from API
  useEffect(() => {
    if (open) {
      setIsLoadingItems(true);
      fetch("/api/items")
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch items");
          }
          return res.json();
        })
        .then((data: Item[]) => {
          setItems(data);
        })
        .catch((error) => {
          console.error("Error fetching items:", error);
        })
        .finally(() => {
          setIsLoadingItems(false);
        });
    }
  }, [open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setRaidItems([{ id: crypto.randomUUID(), item: null, quantity: 0 }]);
    }
  }, [open]);

  const addItem = useCallback(() => {
    setRaidItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), item: null, quantity: 0 },
    ]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setRaidItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<RaidItem>) => {
    setRaidItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const handleSubmit = useCallback(() => {
    // Update inventory for each item
    raidItems.forEach((raidItem) => {
      if (raidItem.item && raidItem.quantity > 0) {
        const currentQuantity = userState.inventory[raidItem.item.name] || 0;
        setInventoryQuantity(
          raidItem.item.name,
          currentQuantity + raidItem.quantity
        );
      }
    });

    // Close dialog and reset form
    setOpen(false);
  }, [raidItems, setInventoryQuantity, userState.inventory]);

  // Get all item names for Combobox (it handles filtering internally)
  const itemNames = items.map((item) => item.name);

  const hasValidItems = raidItems.some(
    (raidItem) => raidItem.item && raidItem.quantity > 0
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button>Record Raid</Button>} />
      <AlertDialogContent
        size="default"
        className="max-h-[90vh] flex flex-col max-w-2xl!"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Record Raid</AlertDialogTitle>
          <AlertDialogDescription>
            Record items collected from your raid. Add items and quantities to
            update your inventory.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {isLoadingItems ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading items...
            </div>
          ) : (
            raidItems.map((raidItem, index) => (
              <div
                key={raidItem.id}
                className="flex gap-2  items-start p-3 border rounded-lg bg-background"
              >
                <div className="flex flex-1 flex-col md:flex-row gap-2 items-center">
                  <Combobox
                    items={itemNames}
                    value={raidItem.item?.name || ""}
                    onValueChange={(value) => {
                      const selectedItem = items.find(
                        (item) => item.name === value
                      );
                      updateItem(raidItem.id, { item: selectedItem || null });
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
                            <ComboboxItem
                              key={item?.id ?? itemName}
                              value={itemName}
                            >
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
                      updateItem(raidItem.id, { quantity: value });
                    }}
                    className="w-full md:max-w-20"
                  />
                </div>

                {raidItems.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(raidItem.id)}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={addItem}
            className="flex items-center gap-2"
          >
            <IconPlus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!hasValidItems}>
            Record Raid
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
