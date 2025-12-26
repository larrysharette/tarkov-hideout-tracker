"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useHideout } from "@/contexts/HideoutContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { ItemHoverCard } from "@/components/ui/item-hover-card";
import {
  IconSearch,
  IconX,
  IconExternalLink,
  IconTrash,
  IconPlus,
  IconLayoutGrid,
  IconTable,
  IconTrashX,
} from "@tabler/icons-react";
import type { Item } from "@/app/api/items/route";

function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

interface WatchlistItem {
  name: string;
  quantity: number;
  itemData?: Item;
}

export function WatchlistView() {
  const {
    isLoading,
    error,
    userState,
    addToWatchlist,
    setWatchlistQuantity,
    removeFromWatchlist,
  } = useHideout();
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [quickAddItem, setQuickAddItem] = useState<string>("");
  const [quickAddQuantity, setQuickAddQuantity] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Fetch items from API for icons
  useEffect(() => {
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
  }, []);

  // Create a map of item names to item data for quick lookup
  const itemsMap = useMemo(() => {
    const map = new Map<string, Item>();
    items.forEach((item) => {
      map.set(item.name, item);
    });
    return map;
  }, [items]);

  // Get watchlist items with item data
  const watchlistItems = useMemo((): WatchlistItem[] => {
    return Object.entries(userState.watchlist || {})
      .filter(([name, quantity]) => quantity > 0)
      .map(([name, quantity]) => ({
        name,
        quantity,
        itemData: itemsMap.get(name),
      }))
      .sort((a, b) => {
        // Sort by name alphabetically
        return a.name.localeCompare(b.name);
      });
  }, [userState.watchlist, itemsMap]);

  // Filter watchlist items by search query
  const filteredItems = useMemo(() => {
    let items = watchlistItems;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(query));
    }

    return items;
  }, [watchlistItems, searchQuery]);

  const handleQuantityChange = useCallback(
    (itemName: string, newQuantity: number) => {
      setWatchlistQuantity(itemName, newQuantity);
    },
    [setWatchlistQuantity]
  );

  const handleRemoveItem = useCallback(
    (itemName: string) => {
      removeFromWatchlist(itemName);
    },
    [removeFromWatchlist]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleQuickAdd = useCallback(() => {
    if (quickAddItem) {
      addToWatchlist(quickAddItem, quickAddQuantity);
      setQuickAddItem("");
      setQuickAddQuantity(1);
    }
  }, [quickAddItem, quickAddQuantity, addToWatchlist]);

  const handleRemoveAllCompleted = useCallback(() => {
    const completedItems = watchlistItems.filter((item) => {
      const inventoryQuantity = userState.inventory[item.name] || 0;
      return inventoryQuantity >= item.quantity;
    });

    completedItems.forEach((item) => {
      removeFromWatchlist(item.name);
    });
  }, [watchlistItems, userState.inventory, removeFromWatchlist]);

  // Calculate completed items count
  const completedItemsCount = useMemo(() => {
    return watchlistItems.filter((item) => {
      const inventoryQuantity = userState.inventory[item.name] || 0;
      return inventoryQuantity >= item.quantity;
    }).length;
  }, [watchlistItems, userState.inventory]);

  // Get item names for quick add combobox
  const itemNames = useMemo(() => {
    return items.map((item) => item.name).sort();
  }, [items]);

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

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Watchlist</h1>
          <p className="text-destructive text-sm">Error: {error}</p>
        </div>
      </div>
    );
  }

  const totalItems = watchlistItems.length;
  const totalQuantity = watchlistItems.reduce(
    (sum, item) => sum + item.quantity,
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
              <Combobox
                items={itemNames}
                value={quickAddItem}
                onValueChange={(value) => setQuickAddItem(value || "")}
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
        <InputGroup className="flex-1">
          <InputGroupAddon align="inline-start">
            <IconSearch className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                variant="ghost"
                size="icon-xs"
                onClick={clearSearch}
                type="button"
              >
                <IconX className="h-4 w-4" />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
        <ToggleGroup
          value={[viewMode]}
          onValueChange={(value: any) => {
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
            const iconElement = watchlistItem.itemData?.iconLink ? (
              <div className="shrink-0 cursor-pointer">
                <img
                  src={watchlistItem.itemData.iconLink}
                  alt={watchlistItem.name}
                  className="w-12 h-12 object-contain"
                />
              </div>
            ) : (
              <div className="shrink-0 w-12 h-12 bg-muted rounded flex items-center justify-center cursor-pointer">
                <span className="text-xs text-muted-foreground">?</span>
              </div>
            );

            const inventoryQuantity =
              userState.inventory[watchlistItem.name] || 0;
            const remaining = Math.max(
              0,
              watchlistItem.quantity - inventoryQuantity
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
                      itemData={watchlistItem.itemData}
                      iconElement={iconElement}
                    />

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm leading-tight line-clamp-2 flex-1">
                          {watchlistItem.name}
                        </h3>
                        {watchlistItem.itemData?.wikiLink && (
                          <a
                            href={watchlistItem.itemData.wikiLink}
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
                            {formatNumber(watchlistItem.quantity)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Owned:</span>
                          <span className="font-medium">
                            {formatNumber(inventoryQuantity)}
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
                          value={watchlistItem.quantity || ""}
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
                const iconElement = watchlistItem.itemData?.iconLink ? (
                  <div className="shrink-0 cursor-pointer">
                    <img
                      src={watchlistItem.itemData.iconLink}
                      alt={watchlistItem.name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 w-8 h-8 bg-muted rounded flex items-center justify-center cursor-pointer">
                    <span className="text-xs text-muted-foreground">?</span>
                  </div>
                );

                const inventoryQuantity =
                  userState.inventory[watchlistItem.name] || 0;
                const remaining = Math.max(
                  0,
                  watchlistItem.quantity - inventoryQuantity
                );

                return (
                  <TableRow key={watchlistItem.name}>
                    <TableCell>
                      <ItemHoverCard
                        itemName={watchlistItem.name}
                        itemData={watchlistItem.itemData}
                        iconElement={iconElement}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="wrap-break-word">
                          {watchlistItem.name}
                        </span>
                        {watchlistItem.itemData?.wikiLink && (
                          <a
                            href={watchlistItem.itemData.wikiLink}
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
                      {formatNumber(watchlistItem.quantity)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(inventoryQuantity)}
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
                        value={watchlistItem.quantity || ""}
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
