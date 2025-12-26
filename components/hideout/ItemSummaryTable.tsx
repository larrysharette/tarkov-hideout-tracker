"use client";

import { useMemo, useState, useCallback } from "react";
import { useHideout } from "@/contexts/HideoutContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  IconChevronUp,
  IconChevronDown,
  IconSelector,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ItemSummary } from "@/lib/types/hideout";
import { RecordRaidDialog } from "./RecordRaidDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SortField = keyof ItemSummary;
type SortDirection = "asc" | "desc" | null;
type FilterType = "all" | "stillNeed" | "completed" | "overRequirements";

const FILTER_ITEMS = [
  { value: "all" as FilterType, label: "All" },
  { value: "stillNeed" as FilterType, label: "Still Need" },
  { value: "completed" as FilterType, label: "Completed" },
  { value: "overRequirements" as FilterType, label: "Over Requirements" },
];

function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

export function ItemSummaryTable() {
  const {
    isLoading,
    error,
    getItemSummary,
    setInventoryQuantity,
    hideoutData,
    userState,
    getAvailableUpgrades,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  } = useHideout();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const itemSummary = getItemSummary();

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        if (sortDirection === "asc") {
          setSortDirection("desc");
        } else if (sortDirection === "desc") {
          setSortField(null);
          setSortDirection(null);
        } else {
          setSortDirection("asc");
        }
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField, sortDirection]
  );

  const filteredSummary = useMemo(() => {
    let items = itemSummary;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) =>
        item.itemName.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      items = [...items].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const comparison =
          typeof aVal === "string"
            ? aVal.localeCompare(bVal as string)
            : (aVal as number) - (bVal as number);
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return items;
  }, [itemSummary, searchQuery, sortField, sortDirection]);

  // Get items required by available upgrades
  const availableItemNames = useMemo(() => {
    if (!hideoutData || !showAvailableOnly) {
      return null; // Return null when filter is off or data not loaded
    }

    const availableUpgrades = getAvailableUpgrades();
    const itemSet = new Set<string>();

    for (const upgrade of availableUpgrades) {
      for (const itemReq of upgrade.itemRequirements) {
        itemSet.add(itemReq.itemName);
      }
    }

    return itemSet;
  }, [hideoutData, userState, showAvailableOnly, getAvailableUpgrades]);

  // Apply filter based on filterType and showAvailableOnly
  const visibleItems = useMemo(() => {
    let items = filteredSummary;

    // Apply showAvailableOnly filter first - only show items from available upgrades
    if (showAvailableOnly && availableItemNames) {
      items = items.filter((item) => availableItemNames.has(item.itemName));
    }

    // Then apply the base filter (items with requirements or owned items)
    items = items.filter((item) => item.totalRequired > 0 || item.owned > 0);

    // Apply filterType filter
    switch (filterType) {
      case "stillNeed":
        items = items.filter((item) => item.owned < item.totalRequired);
        break;
      case "completed":
        items = items.filter((item) => item.owned >= item.totalRequired);
        break;
      case "overRequirements":
        items = items.filter((item) => item.owned > item.totalRequired);
        break;
      case "all":
      default:
        // No additional filtering
        break;
    }

    return items;
  }, [filteredSummary, filterType, showAvailableOnly, availableItemNames]);

  const SortButton = useCallback(
    ({ field, children }: { field: SortField; children: React.ReactNode }) => {
      const isActive = sortField === field;
      const icon = isActive ? (
        sortDirection === "asc" ? (
          <IconChevronUp className="size-3" />
        ) : (
          <IconChevronDown className="size-3" />
        )
      ) : (
        <IconSelector className="size-3 opacity-50" />
      );

      return (
        <Button
          variant="ghost"
          size="xs"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => handleSort(field)}
        >
          <span className="flex items-center gap-1">
            {children}
            {icon}
          </span>
        </Button>
      );
    },
    [sortField, sortDirection, handleSort]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Item Summary</h2>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Item Summary</h2>
          <p className="text-destructive text-sm">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Item Summary</h2>
          <p className="text-muted-foreground text-sm">
            Overview of items needed for hideout upgrades
          </p>
        </div>
        <RecordRaidDialog />
      </div>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <Input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value as FilterType)}
              items={FILTER_ITEMS}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILTER_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showAvailableOnly ? "default" : "outline"}
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              className="flex-1 md:flex-initial"
            >
              {showAvailableOnly ? "Show All" : "Available Only"}
            </Button>
          </div>
        </div>

        {/* Mobile Card View - shown on mobile, hidden on md and up */}
        <div className="block md:hidden space-y-0.5">
          {visibleItems.length === 0 ? (
            <div className="text-center py-4">
              <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
                <p className="text-sm font-medium">
                  {searchQuery ? "No items found" : "No items to display"}
                </p>
                {!searchQuery && (
                  <p className="text-xs">
                    Set your hideout levels and focus upgrades to see
                    requirements.
                  </p>
                )}
              </div>
            </div>
          ) : (
            visibleItems.map((item) => {
              const isFocused = item.requiredNow > 0;
              const remainingForDisplay = isFocused
                ? Math.max(0, item.requiredNow - item.owned)
                : Math.max(0, item.totalRequired - item.owned);

              let displayStatus: React.ReactNode;
              if (remainingForDisplay > 0) {
                displayStatus = (
                  <Badge
                    variant="destructive"
                    className="font-medium text-[10px] px-1 py-0 h-4"
                  >
                    {formatNumber(remainingForDisplay)}
                  </Badge>
                );
              } else if (isFocused) {
                if (item.owned > item.totalRequired) {
                  displayStatus = (
                    <Badge
                      variant="secondary"
                      className="font-medium text-[10px] px-1 py-0 h-4"
                    >
                      +{formatNumber(item.owned - item.totalRequired)} over
                    </Badge>
                  );
                } else if (
                  item.owned >= item.requiredNow &&
                  item.owned < item.totalRequired
                ) {
                  displayStatus = (
                    <Badge
                      variant="secondary"
                      className="font-medium text-[10px] px-1 py-0 h-4"
                    >
                      Complete
                    </Badge>
                  );
                } else if (item.requiredNow > 0) {
                  displayStatus = (
                    <Badge
                      variant="secondary"
                      className="font-medium text-[10px] px-1 py-0 h-4"
                    >
                      Complete
                    </Badge>
                  );
                } else {
                  displayStatus = (
                    <span className="text-muted-foreground text-[10px]">-</span>
                  );
                }
              } else {
                if (item.owned > item.totalRequired && item.totalRequired > 0) {
                  displayStatus = (
                    <Badge
                      variant="secondary"
                      className="font-medium text-[10px] px-1 py-0 h-4"
                    >
                      +{formatNumber(item.owned - item.totalRequired)} over
                    </Badge>
                  );
                } else if (item.totalRequired > 0) {
                  displayStatus = (
                    <Badge
                      variant="secondary"
                      className="font-medium text-[10px] px-1 py-0 h-4"
                    >
                      Complete
                    </Badge>
                  );
                } else {
                  displayStatus = (
                    <span className="text-muted-foreground text-[10px]">-</span>
                  );
                }
              }

              const isWatched = isInWatchlist(item.itemName);

              return (
                <Card
                  key={item.itemName}
                  size="sm"
                  className={cn(
                    "py-1",
                    isFocused && "ring-1 ring-primary/30 bg-primary/5"
                  )}
                >
                  <CardContent className="px-2 py-1 space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 shrink-0"
                          onClick={() => {
                            if (isWatched) {
                              removeFromWatchlist(item.itemName);
                            } else {
                              const quantityToAdd = Math.max(
                                1,
                                item.requiredNow > 0
                                  ? item.requiredNow - item.owned
                                  : item.totalRequired - item.owned
                              );
                              addToWatchlist(item.itemName, quantityToAdd);
                            }
                          }}
                          title={
                            isWatched
                              ? "Remove from watchlist"
                              : "Add to watchlist"
                          }
                        >
                          {isWatched ? (
                            <IconEye className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <IconEyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </Button>
                        <span className="font-medium text-xs leading-tight flex-1 min-w-0 truncate">
                          {item.itemName}
                        </span>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        value={item.owned || ""}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10) || 0;
                          setInventoryQuantity(item.itemName, value);
                        }}
                        placeholder="0"
                        className="w-14 h-6 text-xs text-right font-medium px-1.5"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-[10px]">
                      <div>
                        <div className="text-muted-foreground text-[9px] leading-none">
                          Req Now
                        </div>
                        <div className="mt-0.5">
                          {item.requiredNow > 0 ? (
                            <Badge
                              variant="default"
                              className="font-medium text-[9px] px-0.5 py-0 h-3.5"
                            >
                              {formatNumber(item.requiredNow)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">
                              0
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-[9px] leading-none">
                          Will Need
                        </div>
                        <div className="mt-0.5 text-[10px]">
                          {item.willNeed > 0 ? (
                            <span className="text-muted-foreground font-medium">
                              {formatNumber(item.willNeed)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-[9px] leading-none">
                          Total
                        </div>
                        <div className="mt-0.5 font-medium text-[10px]">
                          {formatNumber(item.totalRequired)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-[9px] leading-none">
                          Remaining
                        </div>
                        <div className="mt-0.5">{displayStatus}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Desktop Table View - hidden on mobile, shown on md and up */}
        <div className="hidden md:block overflow-x-auto -mx-4 px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>
                  <SortButton field="itemName">Item Name</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex justify-end">
                    <SortButton field="requiredNow">Required Now</SortButton>
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex justify-end">
                    <SortButton field="willNeed">Will Need</SortButton>
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex justify-end">
                    <SortButton field="totalRequired">
                      Total Required
                    </SortButton>
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex justify-end">
                    <SortButton field="owned">Owned</SortButton>
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex justify-end">
                    <SortButton field="remaining">Remaining</SortButton>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <p className="text-sm font-medium">
                        {searchQuery ? "No items found" : "No items to display"}
                      </p>
                      {!searchQuery && (
                        <p className="text-xs">
                          Set your hideout levels and focus upgrades to see
                          requirements.
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                visibleItems.map((item) => {
                  const isFocused = item.requiredNow > 0;
                  const isWatched = isInWatchlist(item.itemName);
                  // For focused items: remaining based on requiredNow
                  // For non-focused items: remaining based on totalRequired
                  const remainingForDisplay = isFocused
                    ? Math.max(0, item.requiredNow - item.owned)
                    : Math.max(0, item.totalRequired - item.owned);

                  // For focused items: show "Complete" if owned >= requiredNow but < totalRequired
                  // Otherwise show over amount only if owned >= totalRequired
                  let displayStatus: React.ReactNode;
                  if (remainingForDisplay > 0) {
                    displayStatus = (
                      <Badge variant="destructive" className="font-medium">
                        {formatNumber(remainingForDisplay)}
                      </Badge>
                    );
                  } else if (isFocused) {
                    // Focused item logic
                    if (item.owned > item.totalRequired) {
                      // Over or equal to total required (including exactly equal = "+0 over")
                      displayStatus = (
                        <Badge variant="secondary" className="font-medium">
                          +{formatNumber(item.owned - item.totalRequired)} over
                        </Badge>
                      );
                    } else if (
                      item.owned >= item.requiredNow &&
                      item.owned < item.totalRequired
                    ) {
                      // Complete for focused, but still need more for future
                      displayStatus = (
                        <Badge variant="secondary" className="font-medium">
                          Complete
                        </Badge>
                      );
                    } else if (item.requiredNow > 0) {
                      displayStatus = (
                        <Badge variant="secondary" className="font-medium">
                          Complete
                        </Badge>
                      );
                    } else {
                      displayStatus = (
                        <span className="text-muted-foreground">-</span>
                      );
                    }
                  } else {
                    // Non-focused item logic
                    if (
                      item.owned > item.totalRequired &&
                      item.totalRequired > 0
                    ) {
                      displayStatus = (
                        <Badge variant="secondary" className="font-medium">
                          +{formatNumber(item.owned - item.totalRequired)} over
                        </Badge>
                      );
                    } else if (item.totalRequired > 0) {
                      displayStatus = (
                        <Badge variant="secondary" className="font-medium">
                          Complete
                        </Badge>
                      );
                    } else {
                      displayStatus = (
                        <span className="text-muted-foreground">-</span>
                      );
                    }
                  }

                  return (
                    <TableRow
                      key={item.itemName}
                      className={cn(
                        "hover:bg-muted/50",
                        isFocused && "bg-primary/5 ring-1 ring-primary/20"
                      )}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            if (isWatched) {
                              removeFromWatchlist(item.itemName);
                            } else {
                              const quantityToAdd = Math.max(
                                1,
                                remainingForDisplay > 0
                                  ? remainingForDisplay
                                  : 1
                              );
                              addToWatchlist(item.itemName, quantityToAdd);
                            }
                          }}
                          title={
                            isWatched
                              ? "Remove from watchlist"
                              : "Add to watchlist"
                          }
                        >
                          {isWatched ? (
                            <IconEye className="h-4 w-4 text-primary" />
                          ) : (
                            <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        <span className="wrap-break-word">{item.itemName}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.requiredNow > 0 ? (
                          <Badge variant="default" className="font-medium">
                            {formatNumber(item.requiredNow)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.willNeed > 0 ? (
                          <span className="text-muted-foreground font-medium">
                            {formatNumber(item.willNeed)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">
                          {formatNumber(item.totalRequired)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min="0"
                          value={item.owned || ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10) || 0;
                            setInventoryQuantity(item.itemName, value);
                          }}
                          placeholder="0"
                          className="w-20 text-right font-medium"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {displayStatus}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {searchQuery && (
          <p className="text-muted-foreground text-sm">
            Showing {visibleItems.length} of {itemSummary.length} items
          </p>
        )}
      </div>
    </div>
  );
}
