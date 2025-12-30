"use client";

import {
  IconExternalLink,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ItemHoverCard } from "@/components/ui/item-hover-card";
import { ItemSelector } from "@/components/ui/item-selector";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFuzzySearch } from "@/hooks/use-fuzzy-search";
import { useInventory } from "@/hooks/use-inventory";
import { db, type InventoryRecord } from "@/lib/db/index";

type FilterType =
  | "all"
  | "usedInTasks"
  | "usedInCrafts"
  | "canBeCrafted"
  | "collectorItem";

const CURRENCY_ITEMS = ["Roubles", "Euros", "Dollars", "USD", "US Dollars"];

const FILTER_OPTIONS = [
  { value: "all" as FilterType, label: "All Items" },
  { value: "usedInTasks" as FilterType, label: "Used in Tasks" },
  { value: "usedInCrafts" as FilterType, label: "Used in Crafts" },
  { value: "canBeCrafted" as FilterType, label: "Can Be Crafted" },
  { value: "collectorItem" as FilterType, label: "Collector Item" },
];

export function InventoryView() {
  const {
    inventory,
    currencies,
    isLoading,
    setInventoryQuantity,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    updateCurrencies,
  } = useInventory();

  // Query all items from Dexie for item metadata (icons, etc.)
  const allItems = useLiveQuery(
    () =>
      db.inventory
        .where("name")
        .noneOf(CURRENCY_ITEMS)
        .and((item) => item.quantityOwned > 0)
        .toArray(),
    [],
    [] as InventoryRecord[]
  );

  const [filterType, setFilterType] = useState<FilterType>("all");
  const [quickAddItem, setQuickAddItem] = useState<string>("");
  const [quickAddQuantity, setQuickAddQuantity] = useState<number>(1);

  // Fuzzy search for inventory items
  const {
    results: fuzzySearchResults,
    query: searchQuery,
    setQuery: setSearchQuery,
  } = useFuzzySearch(allItems, {
    keys: [{ name: "name", weight: 1 }],
    minMatchCharLength: 2,
  });

  // Filter inventory items by search query and filter type
  const filteredItems = useMemo(() => {
    // Start with fuzzy search results if searching, otherwise use all items
    let items = searchQuery.trim() ? fuzzySearchResults : allItems;

    // Apply filter type
    switch (filterType) {
      case "usedInTasks":
        items = items.filter(
          (item) => item.usedInTasks && item.usedInTasks.length > 0
        );
        break;
      case "usedInCrafts":
        items = items.filter(
          (item) => item.craftsUsing && item.craftsUsing.length > 0
        );
        break;
      case "canBeCrafted":
        items = items.filter(
          (item) => item.craftsFor && item.craftsFor.length > 0
        );
        break;
      case "collectorItem":
        items = items.filter((item) => {
          return item.usedInTasks?.some((task) => task.name === "Collector");
        });
        break;
      case "all":
      default:
        // No filter
        break;
    }

    return items;
  }, [allItems, fuzzySearchResults, searchQuery, filterType]);

  const handleQuantityChange = useCallback(
    (itemName: string, newQuantity: number) => {
      void setInventoryQuantity(itemName, Math.max(0, newQuantity));
    },
    [setInventoryQuantity]
  );

  const handleRemoveItem = useCallback(
    (itemName: string) => {
      void setInventoryQuantity(itemName, 0);
    },
    [setInventoryQuantity]
  );

  const handleQuickAdd = useCallback(() => {
    if (quickAddItem) {
      const currentQuantity = inventory[quickAddItem] || 0;
      void setInventoryQuantity(
        quickAddItem,
        currentQuantity + quickAddQuantity
      );
      setQuickAddItem("");
      setQuickAddQuantity(1);
    }
  }, [quickAddItem, quickAddQuantity, inventory, setInventoryQuantity]);

  const handleAddToWatchlist = useCallback(
    (itemName: string, quantity = 1) => {
      void addToWatchlist(itemName, quantity);
    },
    [addToWatchlist]
  );

  const handleAddCraftRequirementsToWatchlist = useCallback(
    (craft: {
      requiredItems: Array<{ item: { name: string }; count: number }>;
    }) => {
      craft.requiredItems.forEach((req) => {
        void addToWatchlist(req.item.name, req.count);
      });
    },
    [addToWatchlist]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inventory</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const totalItems = allItems.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your item inventory and record raids
          </p>
        </div>
      </div>

      {/* Currency */}
      <Card className="py-4">
        <CardContent className="p-0 px-4">
          <h2 className="text-lg font-semibold mb-4">Currency</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Roubles
              </label>
              <Input
                type="number"
                min="0"
                value={currencies.roubles || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10) || 0;
                  void updateCurrencies(value, 0, 0);
                }}
                className="text-right font-medium"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Euros
              </label>
              <Input
                type="number"
                min="0"
                value={currencies.euros || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10) || 0;
                  void updateCurrencies(0, value, 0);
                }}
                className="text-right font-medium"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Dollars
              </label>
              <Input
                type="number"
                min="0"
                value={currencies.dollars || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10) || 0;
                  void updateCurrencies(0, 0, value);
                }}
                className="text-right font-medium"
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Add */}
      <Card>
        <CardContent className="py-1">
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div className="flex-1 w-full">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Quick Add Item
              </label>
              <ItemSelector
                value={quickAddItem}
                onValueChange={(value) => setQuickAddItem(value?.name || "")}
                placeholder="Search for an item..."
              />
            </div>
            <div className="w-full sm:w-24">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Quantity
              </label>
              <Input
                type="number"
                min="1"
                value={quickAddQuantity || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10) || 1;
                  setQuickAddQuantity(Math.max(1, value));
                }}
                className="text-right font-medium"
                placeholder="1"
              />
            </div>
            <Button
              onClick={handleQuickAdd}
              disabled={!quickAddItem}
              className="w-full sm:w-auto"
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Search items..."
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(value) => setFilterType(value!)}
          items={FILTER_OPTIONS}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Inventory Grid */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <p className="text-sm font-medium">
                  {searchQuery
                    ? "No items found matching your search"
                    : totalItems === 0
                    ? "Your inventory is empty"
                    : "No items match your search"}
                </p>
                {!searchQuery && totalItems === 0 && (
                  <p className="text-xs">
                    Use the "Record Raid" button to add items to your inventory
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((inventoryItem) => {
            const hasInfo =
              (inventoryItem.usedInTasks?.length ?? 0) > 0 ||
              (inventoryItem.craftsFor?.length ?? 0) > 0 ||
              (inventoryItem.craftsUsing?.length ?? 0) > 0;

            const iconElement = inventoryItem.iconLink ? (
              <div className="shrink-0 cursor-pointer">
                <img
                  src={inventoryItem.iconLink}
                  alt={inventoryItem.name}
                  className="w-12 h-12 object-contain"
                />
              </div>
            ) : (
              <div className="shrink-0 w-12 h-12 bg-muted rounded flex items-center justify-center cursor-pointer">
                <span className="text-xs text-muted-foreground">?</span>
              </div>
            );

            const cardContent = (
              <Card className="hover:bg-muted/50 h-full transition-colors p-0">
                <CardContent suppressHydrationWarning className="py-1 px-2">
                  <div className="flex items-start gap-3">
                    {/* Item Icon - wrapped in HoverCardTrigger if hasInfo */}
                    <ItemHoverCard
                      itemName={inventoryItem.name}
                      itemData={inventoryItem}
                      iconElement={iconElement}
                      onAddCraftRequirementsToWatchlist={
                        handleAddCraftRequirementsToWatchlist
                      }
                    />

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm leading-tight line-clamp-2 flex-1">
                          {inventoryItem.name}
                        </h3>
                        {inventoryItem.wikiLink && (
                          <a
                            href={inventoryItem.wikiLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                            title="Open wiki"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="icon">
                              <IconExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>

                      {/* Quantity Input */}
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={inventoryItem.quantityOwned || ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10) || 0;
                            handleQuantityChange(inventoryItem.name, value);
                          }}
                          className="h-8 text-sm font-medium text-right px-2 w-20"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant={
                                inventoryItem.isWatchlisted
                                  ? "default"
                                  : "outline"
                              }
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isInWatchlist(inventoryItem.name)) {
                                  void removeFromWatchlist(inventoryItem.name);
                                } else {
                                  handleAddToWatchlist(
                                    inventoryItem.name,
                                    inventoryItem.quantityOwned || 1
                                  );
                                }
                              }}
                              title={
                                isInWatchlist(inventoryItem.name)
                                  ? "Remove from watchlist"
                                  : "Add to watchlist"
                              }
                            >
                              {isInWatchlist(inventoryItem.name) ? (
                                <IconEye className="h-4 w-4" />
                              ) : (
                                <IconEyeOff className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isInWatchlist(inventoryItem.name)
                              ? "Remove from watchlist"
                              : "Add to watchlist"}
                          </TooltipContent>
                        </Tooltip>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(inventoryItem.name);
                          }}
                          title="Remove item"
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Item metadata badges */}
                      {hasInfo && (
                        <div className="flex flex-wrap gap-1">
                          {(inventoryItem.usedInTasks?.length ?? 0) > 0 && (
                            <Badge
                              variant="default"
                              className="text-[10px] px-1 py-0 h-4"
                            >
                              {inventoryItem.usedInTasks?.length ?? 0} task
                              {(inventoryItem.usedInTasks?.length ?? 0) !== 1
                                ? "s"
                                : ""}
                            </Badge>
                          )}
                          {(inventoryItem.craftsFor?.length ?? 0) > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1 py-0 h-4"
                            >
                              Craftable
                            </Badge>
                          )}
                          {(inventoryItem.craftsUsing?.length ?? 0) > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1 py-0 h-4"
                            >
                              Used in craft
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );

            return <div key={inventoryItem.name}>{cardContent}</div>;
          })}
        </div>
      )}

      {/* Results count */}
      {searchQuery && (
        <p className="text-muted-foreground text-sm">
          Showing {filteredItems.length} of {totalItems} items
        </p>
      )}
    </div>
  );
}
