"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useHideout } from "@/contexts/HideoutContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IconExternalLink, IconWorld } from "@tabler/icons-react";
import type { Task } from "@/lib/types/tasks";
import type { Item } from "@/app/api/items/route";
import { toSnakeCase } from "@/lib/utils";
import { ItemHoverCard } from "@/components/ui/item-hover-card";
import { addVersionToApiUrl } from "@/lib/utils/version";
import Image from "next/image";
import Link from "next/link";

function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

interface WatchlistItem {
  name: string;
  quantity: number;
  itemData?: Item;
}

export default function WatchlistOverviewPage() {
  const { isLoading, error, userState } = useHideout();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedMap, setSelectedMap] = useState<string | null>(null);

  // Fetch tasks and items from API
  useEffect(() => {
    setIsLoadingData(true);
    Promise.all([
      fetch(addVersionToApiUrl("/api/tasks")),
      fetch(addVersionToApiUrl("/api/items")),
    ])
      .then(async ([tasksRes, itemsRes]) => {
        if (!tasksRes.ok) throw new Error("Failed to fetch tasks");
        if (!itemsRes.ok) throw new Error("Failed to fetch items");
        const tasksData: Task[] = await tasksRes.json();
        const itemsData: Item[] = await itemsRes.json();
        setTasks(tasksData);
        setItems(itemsData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setIsLoadingData(false);
      });
  }, []);

  // Get all unique maps from tasks
  const availableMaps = useMemo(() => {
    const mapSet = new Map<string, string>(); // id -> name
    tasks.forEach((task) => {
      if (task.map) {
        mapSet.set(task.map.id, task.map.name);
      }
    });
    return Array.from(mapSet.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([id, name]) => ({ id, name }));
  }, [tasks]);

  // Get watchlist tasks
  const watchlistTasks = useMemo((): Task[] => {
    const taskWatchlist = userState.taskWatchlist || [];
    return tasks.filter((task) => taskWatchlist.includes(task.id));
  }, [userState.taskWatchlist, tasks]);

  // Filter tasks by selected map
  const filteredTasks = useMemo(() => {
    // If no map selected, show all watchlist tasks
    if (!selectedMap || selectedMap === "all") {
      return watchlistTasks;
    }

    const selectedMapData = availableMaps.find((m) => m.id === selectedMap);
    if (!selectedMapData) {
      return watchlistTasks;
    }

    return watchlistTasks.filter((task) => {
      // If task.map is null, it means any location - include it
      if (!task.map) {
        return true;
      }

      // If task.map matches selected map, include it
      if (
        task.map.id === selectedMap ||
        task.map.name.toLowerCase() === selectedMapData.name.toLowerCase()
      ) {
        return true;
      }

      // Check if any objective description contains the map name
      const mapName = selectedMapData.name.toLowerCase();
      const hasMapInObjective = task.objectives.some((objective) =>
        objective.description.toLowerCase().includes(mapName)
      );

      return hasMapInObjective;
    });
  }, [watchlistTasks, selectedMap, availableMaps]);

  // Get watchlist items
  const watchlistItems = useMemo((): WatchlistItem[] => {
    const itemsMap = new Map<string, Item>();
    items.forEach((item) => {
      itemsMap.set(item.name, item);
    });

    return Object.entries(userState.watchlist || {})
      .filter(([name, quantity]) => quantity > 0)
      .map(([name, quantity]) => ({
        name,
        quantity,
        itemData: itemsMap.get(name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [userState.watchlist, items]);

  // Filter items by selected map (for now, show all items - can be enhanced later)
  const filteredItems = useMemo(() => {
    return watchlistItems;
  }, [watchlistItems]);

  // Handle opening all task wiki pages
  const handleOpenAllWikis = useCallback(() => {
    filteredTasks.forEach((task) => {
      if (task.wikiLink) {
        window.open(task.wikiLink, "_blank", "noopener,noreferrer");
      }
    });
  }, [filteredTasks]);

  // Get map image path
  const mapImagePath = useMemo(() => {
    if (!selectedMap) return null;
    const map = availableMaps.find((m) => m.id === selectedMap);
    if (!map) return null;
    return `/maps/${toSnakeCase(map.name).replace("_21", "")}.webp`;
  }, [selectedMap, availableMaps]);

  if (isLoading || isLoadingData) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Watchlist Overview</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Watchlist Overview</h1>
            <p className="text-destructive text-sm">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Watchlist Overview</h1>
            <p className="text-muted-foreground mb-2">
              View your watchlist tasks and items filtered by map.
            </p>
            <div className="flex gap-2 text-sm">
              <Link
                href="/watchlist/items"
                className="text-primary hover:underline"
              >
                Manage Items
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link
                href="/watchlist/tasks"
                className="text-primary hover:underline"
              >
                Manage Tasks
              </Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="text-sm font-medium">Select Map:</label>
            <Select
              value={selectedMap || "all"}
              onValueChange={(value) => {
                setSelectedMap(value === "all" ? null : value);
              }}
            >
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue>
                  {selectedMap
                    ? availableMaps.find((m) => m.id === selectedMap)?.name ||
                      "Select a map"
                    : "All Maps"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Maps</SelectItem>
                {availableMaps
                  .filter((v) => !v.name.includes("21"))
                  .map((map) => (
                    <SelectItem key={map.id} value={map.id}>
                      {map.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-2">
          {/* Left Column - Map Image */}
          <div className="order-2 lg:order-1">
            {mapImagePath ? (
              <div className="relative w-full h-[calc(100svh-15rem)] bg-stone-900/50">
                <Image
                  src={mapImagePath}
                  alt={
                    availableMaps.find((m) => m.id === selectedMap)?.name ||
                    "Map"
                  }
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Select a map to view the map image</p>
              </div>
            )}
          </div>

          {/* Right Column - Tasks and Items */}
          <div className="order-1 lg:order-2">
            <Card className="h-[calc(100svh-15rem)] overflow-y-auto">
              <CardContent className="py-2">
                {/* Tasks Section */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">Tasks</h2>
                    {filteredTasks.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenAllWikis}
                        className="gap-2 h-7 text-xs"
                      >
                        <IconWorld className="h-3 w-3" />
                        Open All Wikis
                      </Button>
                    )}
                  </div>
                  {filteredTasks.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {selectedMap
                        ? "No tasks in watchlist for this map"
                        : "No tasks in watchlist"}
                    </p>
                  ) : (
                    <Accordion multiple className="w-full">
                      {filteredTasks.map((task) => (
                        <AccordionItem key={task.id} value={task.id}>
                          <AccordionTrigger className="text-xs py-1.5">
                            <div className="flex items-center gap-2 flex-1 text-left">
                              <span className="font-medium">{task.name}</span>
                              {task.trader && (
                                <Badge variant="outline" className="text-xs">
                                  {task.trader.name}
                                </Badge>
                              )}
                              {task.map && (
                                <Badge variant="secondary" className="text-xs">
                                  {task.map.name}
                                </Badge>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-1.5 text-xs text-muted-foreground">
                              {task.objectives.length > 0 && (
                                <div>
                                  <p className="font-medium mb-1">
                                    Objectives:
                                  </p>
                                  <ul className="list-disc list-inside space-y-0.5">
                                    {task.objectives.map((objective, idx) => (
                                      <li key={idx}>{objective.description}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {task.wikiLink && (
                                <div>
                                  <a
                                    href={task.wikiLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                  >
                                    <IconExternalLink className="h-3 w-3" />
                                    View Wiki
                                  </a>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </div>

                {/* Separator */}
                {(filteredTasks.length > 0 || filteredItems.length > 0) && (
                  <div className="border-t my-2" />
                )}

                {/* Items Section */}
                <div>
                  <h2 className="text-lg font-semibold mb-2">Items</h2>
                  {filteredItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No items in watchlist
                    </p>
                  ) : (
                    <div className="overflow-x-auto -mx-2 px-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10 h-7"></TableHead>
                            <TableHead className="h-7 text-xs">
                              Item Name
                            </TableHead>
                            <TableHead className="text-right h-7 text-xs">
                              Owned
                            </TableHead>
                            <TableHead className="text-right h-7 text-xs">
                              Need
                            </TableHead>
                            <TableHead className="w-10 h-7"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredItems.map((watchlistItem) => {
                            const iconElement = watchlistItem.itemData
                              ?.iconLink ? (
                              <div className="shrink-0 cursor-pointer">
                                <img
                                  src={watchlistItem.itemData.iconLink}
                                  alt={watchlistItem.name}
                                  className="w-6 h-6 object-contain"
                                />
                              </div>
                            ) : (
                              <div className="shrink-0 w-6 h-6 bg-muted rounded flex items-center justify-center cursor-pointer">
                                <span className="text-xs text-muted-foreground">
                                  ?
                                </span>
                              </div>
                            );

                            const inventoryQuantity =
                              userState.inventory[watchlistItem.name] || 0;

                            return (
                              <TableRow key={watchlistItem.name}>
                                <TableCell className="py-1.5">
                                  <ItemHoverCard
                                    itemName={watchlistItem.name}
                                    itemData={watchlistItem.itemData}
                                    iconElement={iconElement}
                                  />
                                </TableCell>
                                <TableCell className="font-medium text-xs py-1.5">
                                  {watchlistItem.name}
                                </TableCell>
                                <TableCell className="text-right text-xs py-1.5">
                                  {formatNumber(inventoryQuantity)}
                                </TableCell>
                                <TableCell className="text-right font-medium text-xs py-1.5">
                                  {formatNumber(watchlistItem.quantity)}
                                </TableCell>
                                <TableCell className="py-1.5">
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
                                        className="h-5 w-5"
                                      >
                                        <IconExternalLink className="h-3 w-3" />
                                      </Button>
                                    </a>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
