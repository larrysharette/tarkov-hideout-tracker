"use client";

import {
  IconExternalLink,
  IconLayoutGrid,
  IconPlus,
  IconTable,
  IconTrash,
  IconTrashX,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useFuzzySearch } from "@/hooks/use-fuzzy-search";
import { useInventory } from "@/hooks/use-inventory";
import { db } from "@/lib/db/index";
import { type InventoryRecord } from "@/lib/db/types";

function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

export function WatchlistView() {
  const {
    isLoading,
    addToWatchlist,
    setWatchlistQuantity,
    removeFromWatchlist,
    inventory,
  } = useInventory();

  // Query all items from Dexie for item metadata
  const watchlistItems = useLiveQuery(
    () => db.inventory.where("quantityNeeded").above(0).toArray(),
    [],
    [] as InventoryRecord[]
  );

  const [quickAddItem, setQuickAddItem] = useState<string>("");
  const [quickAddQuantity, setQuickAddQuantity] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Fuzzy search for watchlist items
  const {
    results: fuzzySearchResults,
    query: searchQuery,
    setQuery: setSearchQuery,
  } = useFuzzySearch(watchlistItems, {
    keys: [{ name: "name", weight: 1 }],
    minMatchCharLength: 2,
  });

  // Filter watchlist items by search query
  const filteredItems = useMemo(() => {
    // Start with fuzzy search results if searching, otherwise use all items
    return searchQuery.trim() ? fuzzySearchResults : watchlistItems;
  }, [watchlistItems, fuzzySearchResults, searchQuery]);

  const handleQuantityChange = useCallback(
    (itemName: string, newQuantity: number) => {
      void setWatchlistQuantity(itemName, newQuantity);
    },
    [setWatchlistQuantity]
  );

  const handleRemoveItem = useCallback(
    (itemName: string) => {
      void removeFromWatchlist(itemName);
    },
    [removeFromWatchlist]
  );

  const handleQuickAdd = useCallback(async () => {
    if (quickAddItem) {
      try {
        await addToWatchlist(quickAddItem, quickAddQuantity);
        setQuickAddItem("");
        setQuickAddQuantity(1);
      } catch (err) {
        console.error("Error adding item to watchlist:", err);
        // Optionally show user feedback here
      }
    }
  }, [quickAddItem, quickAddQuantity, addToWatchlist]);

  const handleRemoveAllCompleted = useCallback(() => {
    const completedItems = watchlistItems.filter((item) => {
      const inventoryQuantity = inventory[item.name] || 0;
      return inventoryQuantity >= item.quantityNeeded;
    });

    completedItems.forEach((item) => {
      void removeFromWatchlist(item.name);
    });
  }, [watchlistItems, inventory, removeFromWatchlist]);

  // Calculate completed items count
  const completedItemsCount = useMemo(() => {
    return watchlistItems.filter((item) => {
      const inventoryQuantity = inventory[item.name] || 0;
      return inventoryQuantity >= item.quantityNeeded;
    }).length;
  }, [watchlistItems, inventory]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Watchlist</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const totalItems = watchlistItems.length;
  const totalQuantity = watchlistItems.reduce(
    (sum, item) => sum + item.quantityNeeded,
    0
  );

  return (
    <>
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

      {/* Search and View Toggle */}
      <div className="flex gap-2">
        <SearchInput
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="Search items..."
          className="flex-1"
        />
        <ToggleGroup
          value={[viewMode]}
          onValueChange={(value: string | string[]) => {
            const selectedValue = Array.isArray(value) ? value[0] : value;
            if (selectedValue === "grid" || selectedValue === "table") {
              setViewMode(selectedValue);
            }
          }}
          variant="outline"
          size="default"
          spacing={0}
        >
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <IconLayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <IconTable className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Summary */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Items: </span>
              <span className="font-medium">{formatNumber(totalItems)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Quantity: </span>
              <span className="font-medium">{formatNumber(totalQuantity)}</span>
            </div>
            {completedItemsCount > 0 && (
              <div>
                <span className="text-muted-foreground">Completed: </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatNumber(completedItemsCount)}
                </span>
              </div>
            )}
          </div>
          {completedItemsCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveAllCompleted}
              className="gap-2"
            >
              <IconTrashX className="h-4 w-4" />
              Remove All Completed
            </Button>
          )}
        </div>
      )}

      {/* Watchlist Content */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <p className="text-sm font-medium">
                  {searchQuery
                    ? "No items found matching your search"
                    : totalItems === 0
                    ? "Your watchlist is empty"
                    : "No items match your search"}
                </p>
                {!searchQuery && totalItems === 0 && (
                  <p className="text-xs">
                    Add items to your watchlist from the Hideout or Inventory
                    pages
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((watchlistItem) => {
            const iconElement = watchlistItem.iconLink ? (
              <div className="shrink-0 cursor-pointer">
                <img
                  src={watchlistItem.iconLink}
                  alt={watchlistItem.name}
                  className="w-12 h-12 object-contain"
                />
              </div>
            ) : (
              <div className="shrink-0 w-12 h-12 bg-muted rounded flex items-center justify-center cursor-pointer">
                <span className="text-xs text-muted-foreground">?</span>
              </div>
            );

            const inventoryQuantity = inventory[watchlistItem.name] || 0;
            const remaining = Math.max(
              0,
              watchlistItem.quantityNeeded - inventoryQuantity
            );

            return (
              <Card
                key={watchlistItem.name}
                className="hover:bg-muted/50 h-full transition-colors p-0"
              >
                <CardContent suppressHydrationWarning className="py-1 px-2">
                  <div className="flex items-start gap-3">
                    {/* Item Icon */}
                    <ItemHoverCard
                      itemName={watchlistItem.name}
                      itemData={watchlistItem}
                      iconElement={iconElement}
                    />

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm leading-tight line-clamp-2 flex-1">
                          {watchlistItem.name}
                        </h3>
                        {watchlistItem.wikiLink && (
                          <a
                            href={watchlistItem.wikiLink}
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

                      {/* Quantity Info */}
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Needed:</span>
                          <span className="font-medium">
                            {formatNumber(watchlistItem.quantityNeeded)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Owned:</span>
                          <span className="font-medium">
                            {formatNumber(watchlistItem.quantityOwned)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">
                            Remaining:
                          </span>
                          <Badge
                            variant={
                              remaining > 0 ? "destructive" : "secondary"
                            }
                            className="text-[10px] px-1 py-0 h-4 font-medium"
                          >
                            {formatNumber(remaining)}
                          </Badge>
                        </div>
                      </div>

                      {/* Quantity Input */}
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={watchlistItem.quantityNeeded || ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10) || 0;
                            handleQuantityChange(watchlistItem.name, value);
                          }}
                          className="h-8 text-sm font-medium text-right px-2 w-20"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(watchlistItem.name);
                          }}
                          title="Remove from watchlist"
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto -mx-4 px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead className="text-right">Needed</TableHead>
                <TableHead className="text-right">Owned</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((watchlistItem) => {
                const iconElement = watchlistItem.iconLink ? (
                  <div className="shrink-0 cursor-pointer">
                    <img
                      src={watchlistItem.iconLink}
                      alt={watchlistItem.name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 w-8 h-8 bg-muted rounded flex items-center justify-center cursor-pointer">
                    <span className="text-xs text-muted-foreground">?</span>
                  </div>
                );

                const inventoryQuantity = inventory[watchlistItem.name] || 0;
                const remaining = Math.max(
                  0,
                  watchlistItem.quantityNeeded - inventoryQuantity
                );

                return (
                  <TableRow key={watchlistItem.name}>
                    <TableCell>
                      <ItemHoverCard
                        itemName={watchlistItem.name}
                        itemData={watchlistItem}
                        iconElement={iconElement}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="wrap-break-word">
                          {watchlistItem.name}
                        </span>
                        {watchlistItem.wikiLink && (
                          <a
                            href={watchlistItem.wikiLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                            title="Open wiki"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <IconExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(watchlistItem.quantityNeeded)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(watchlistItem.quantityOwned)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={remaining > 0 ? "destructive" : "secondary"}
                        className="font-medium"
                      >
                        {formatNumber(remaining)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min="0"
                        value={watchlistItem.quantityNeeded || ""}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10) || 0;
                          handleQuantityChange(watchlistItem.name, value);
                        }}
                        className="w-20 text-right font-medium"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(watchlistItem.name);
                        }}
                        title="Remove from watchlist"
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Results count */}
      {searchQuery && (
        <p className="text-muted-foreground text-sm">
          Showing {filteredItems.length} of {totalItems} items
        </p>
      )}
    </>
  );
}
