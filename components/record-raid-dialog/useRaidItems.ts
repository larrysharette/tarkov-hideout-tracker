import { useState, useCallback, useRef, useEffect } from "react";
import type { RaidItem } from "./types";

const INITIAL_RAID_ITEMS: RaidItem[] = [
  { id: crypto.randomUUID(), item: null, quantity: 1 },
  { id: crypto.randomUUID(), item: null, quantity: 1 },
  { id: crypto.randomUUID(), item: null, quantity: 1 },
];

export function useRaidItems(resetTrigger: boolean) {
  const [raidItems, setRaidItems] = useState<RaidItem[]>(INITIAL_RAID_ITEMS);
  const comboboxRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const lastAddedItemId = useRef<string | null>(null);

  // Reset form when trigger changes
  useEffect(() => {
    if (resetTrigger) {
      setRaidItems(INITIAL_RAID_ITEMS);
      lastAddedItemId.current = null;
      comboboxRefs.current.clear();
    }
  }, [resetTrigger]);

  // Focus newly added Combobox
  useEffect(() => {
    if (lastAddedItemId.current) {
      const itemId = lastAddedItemId.current;
      const timeoutId = setTimeout(() => {
        const inputElement = comboboxRefs.current.get(itemId);
        if (inputElement) {
          inputElement.focus();
        }
        lastAddedItemId.current = null;
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [raidItems]);

  const addItem = useCallback(() => {
    const newId = crypto.randomUUID();
    lastAddedItemId.current = newId;
    setRaidItems((prev) => [...prev, { id: newId, item: null, quantity: 1 }]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setRaidItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<RaidItem>) => {
    setRaidItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const getComboboxRef = useCallback((id: string) => {
    return (el: HTMLDivElement | null) => {
      if (el) {
        const input = el.querySelector(
          'input[data-slot="input-group-control"]'
        ) as HTMLInputElement;
        if (input) {
          comboboxRefs.current.set(id, input);
        }
      } else {
        comboboxRefs.current.delete(id);
      }
    };
  }, []);

  return {
    raidItems,
    addItem,
    removeItem,
    updateItem,
    getComboboxRef,
  };
}

