"use client";

import { IconLock, IconLockOpen } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { useFuzzySearch } from "@/hooks/use-fuzzy-search";
import { usePlayerInfo } from "@/hooks/use-player-info";
import { useQuest } from "@/hooks/use-quest";
import { db } from "@/lib/db/index";
import { type TaskRecord } from "@/lib/db/types";
import type { Task } from "@/lib/types/tasks";

import { SearchInput } from "../ui/search-input";
import { QuestCard } from "./QuestCard";
import { QuestDialog } from "./QuestDialog";

type QuestStatus = "all" | "uncompleted" | "completed" | "locked" | "available";
type RequirementFilter = "all" | "kappa" | "lightkeeper";
type QuestFilter = {
  requirement: RequirementFilter;
  status: QuestStatus;
  mapId: string | null;
  searchQuery: string;
};

export default function QuestVisualization() {
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], [] as TaskRecord[]);
  const { isQuestCompleted } = useQuest();
  const { playerLevel, setPlayerLevel } = usePlayerInfo();
  const [selectedQuest, setSelectedQuest] = useState<Task | null>(null);
  const [filter, setFilter] = useState<Omit<QuestFilter, "searchQuery">>({
    requirement: "all",
    status: "available",
    mapId: null,
  });
  const [showLockedByLevel, setShowLockedByLevel] = useState<boolean>(false);

  // Fuzzy search using the searchable tasks
  const {
    results: fuzzySearchTasks,
    query: searchQuery,
    setQuery: setSearchQuery,
  } = useFuzzySearch(tasks, {
    keys: [
      { name: "name", weight: 1 },
      { name: "trader", weight: 1 },
      { name: "map", weight: 1 },
      { name: "objectives", weight: 1 },
    ],
    minMatchCharLength: 2,
  });

  // Get all unique traders with their image links
  const traders = useMemo(() => {
    const traderMap = new Map<
      string,
      { name: string; imageLink: string | null }
    >();
    tasks.forEach((task) => {
      if (task.trader) {
        if (!traderMap.has(task.trader.name)) {
          traderMap.set(task.trader.name, {
            name: task.trader.name,
            imageLink: task.trader.imageLink || null,
          });
        }
      } else {
        if (!traderMap.has("No Trader")) {
          traderMap.set("No Trader", {
            name: "No Trader",
            imageLink: null,
          });
        }
      }
    });
    return Array.from(traderMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [tasks]);

  // Get all unique levels (include 0 for quests without level requirement)
  const levels = useMemo(() => {
    const levelSet = new Set<number>();
    tasks.forEach((task) => {
      levelSet.add(task.minPlayerLevel || 0);
    });
    return Array.from(levelSet).sort((a, b) => a - b);
  }, [tasks]);

  // Get all unique maps
  const maps = useMemo(() => {
    const mapSet = new Map<string, string>(); // id -> name
    tasks.forEach((task) => {
      if (task.map) {
        mapSet.set(task.map.id, task.map.name);
      }
    });
    return Array.from(mapSet.entries()).sort((a, b) =>
      a[1].localeCompare(b[1])
    );
  }, [tasks]);

  // Check if player meets level requirement for a task
  const meetsLevelRequirement = useCallback(
    (task: Task): boolean => {
      if (!task.minPlayerLevel) return true; // No level requirement
      return playerLevel >= task.minPlayerLevel;
    },
    [playerLevel]
  );

  // Check if a quest is locked (requirements not met - includes level and task prerequisites)
  const isQuestLocked = useCallback(
    (task: Task): boolean => {
      // Check level requirement
      if (!meetsLevelRequirement(task)) return true;

      // Check task prerequisites
      if (task.taskRequirements.length === 0) return false;
      return !task.taskRequirements.every((req) =>
        isQuestCompleted(req.task.id)
      );
    },
    [isQuestCompleted, meetsLevelRequirement]
  );

  // Filter tasks based on current filters (applied after fuzzy search)
  const filteredTasks = useMemo(() => {
    // Start with fuzzy search results if searching, otherwise use all tasks
    let filtered = searchQuery.trim() ? fuzzySearchTasks : tasks;

    // Requirement filter (Kappa or Lightkeeper)
    if (filter.requirement === "kappa") {
      filtered = filtered.filter((t: Task) => t.kappaRequired);
    } else if (filter.requirement === "lightkeeper") {
      filtered = filtered.filter((t: Task) => t.lightkeeperRequired);
    }

    // Level requirement filter (default: show only unlocked by level)
    if (!showLockedByLevel) {
      filtered = filtered.filter((t: Task) => meetsLevelRequirement(t));
    }

    // Status filter
    if (filter.status === "completed") {
      filtered = filtered.filter((t: Task) => isQuestCompleted(t.id));
    } else if (filter.status === "uncompleted") {
      filtered = filtered.filter((t: Task) => !isQuestCompleted(t.id));
    } else if (filter.status === "locked") {
      filtered = filtered.filter((t: Task) => isQuestLocked(t));
    } else if (filter.status === "available") {
      filtered = filtered.filter(
        (t: Task) => !isQuestLocked(t) && !isQuestCompleted(t.id)
      );
    }

    // Map filter
    if (filter.mapId) {
      filtered = filtered.filter((t: Task) => t.map?.id === filter.mapId);
    }

    return filtered;
  }, [
    searchQuery,
    fuzzySearchTasks,
    tasks,
    filter,
    isQuestCompleted,
    isQuestLocked,
    meetsLevelRequirement,
    showLockedByLevel,
  ]);

  // Get quests for a specific trader and level
  const getQuestsForCell = useCallback(
    (traderName: string, level: number): Task[] => {
      return filteredTasks.filter((task) => {
        const taskTraderName = task.trader?.name || "No Trader";
        const taskLevel = task.minPlayerLevel || 0;
        return taskTraderName === traderName && taskLevel === level;
      });
    },
    [filteredTasks]
  );

  // Filter traders to only show columns that have at least one task
  const visibleTraders = useMemo(() => {
    return traders.filter((trader) => {
      // Check if this trader has any tasks in filteredTasks
      return filteredTasks.some((task) => {
        const taskTraderName = task.trader?.name || "No Trader";
        return taskTraderName === trader.name;
      });
    });
  }, [traders, filteredTasks]);

  // Filter levels to only show rows that have at least one task
  const visibleLevels = useMemo(() => {
    return levels.filter((level) => {
      // Check if any trader has tasks for this level
      return visibleTraders.some((trader) => {
        const cellQuests = getQuestsForCell(trader.name, level);
        return cellQuests.length > 0;
      });
    });
  }, [levels, visibleTraders, getQuestsForCell]);

  // Helper function to get status label
  const getStatusLabel = (status: QuestStatus): string => {
    switch (status) {
      case "all":
        return "All Tasks";
      case "uncompleted":
        return "Uncompleted";
      case "completed":
        return "Completed";
      case "locked":
        return "Locked";
      case "available":
        return "Available";
      default:
        return "All Tasks";
    }
  };

  // Helper function to get map label
  const getMapLabel = (mapId: string | null): string => {
    if (!mapId) return "All Maps";
    const map = maps.find(([id]) => id === mapId);
    return map ? map[1] : "All Maps";
  };

  // Helper function to get requirement filter label
  const getRequirementLabel = (value: RequirementFilter): string => {
    switch (value) {
      case "all":
        return "All Tasks";
      case "kappa":
        return "Kappa Required";
      case "lightkeeper":
        return "Lightkeeper Required";
      default:
        return "All Tasks";
    }
  };

  return (
    <div className="w-full">
      {/* Filters */}
      {/* Mobile Filters - Menubar */}
      <div className="md:hidden mb-4 space-y-3">
        {/* Search Filter */}
        <div>
          <Label htmlFor="search-mobile" className="mb-2 block text-sm">
            Search Tasks
          </Label>
          <SearchInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Search by name, trader, map, or objective..."
            showClearButton
          />
        </div>

        {/* Player Level Input */}
        <div>
          <Label htmlFor="player-level-mobile" className="mb-2 block text-sm">
            Player Level
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="player-level-mobile"
              type="number"
              min="1"
              max="100"
              value={playerLevel || ""}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  void setPlayerLevel(1);
                } else {
                  const numValue = parseInt(value, 10);
                  if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
                    void setPlayerLevel(numValue);
                  }
                }
              }}
              placeholder="Enter your level"
              className="flex-1"
            />
            <Toggle
              pressed={showLockedByLevel}
              onPressedChange={setShowLockedByLevel}
              aria-label="Show locked by level"
              title={
                showLockedByLevel
                  ? "Show all tasks"
                  : "Show only unlocked tasks"
              }
            >
              {showLockedByLevel ? (
                <IconLock className="h-4 w-4" />
              ) : (
                <IconLockOpen className="h-4 w-4" />
              )}
            </Toggle>
          </div>
        </div>

        {/* Menubar Filters */}
        <Menubar className="w-full justify-start">
          <MenubarMenu>
            <MenubarTrigger className="text-xs">
              Status: {getStatusLabel(filter.status)}
            </MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup
                value={filter.status}
                onValueChange={(value: QuestStatus) =>
                  setFilter((prev) => ({ ...prev, status: value }))
                }
              >
                <MenubarRadioItem value="all">All Tasks</MenubarRadioItem>
                <MenubarRadioItem value="uncompleted">
                  Uncompleted
                </MenubarRadioItem>
                <MenubarRadioItem value="completed">Completed</MenubarRadioItem>
                <MenubarRadioItem value="locked">Locked</MenubarRadioItem>
                <MenubarRadioItem value="available">Available</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="text-xs">
              Map: {getMapLabel(filter.mapId)}
            </MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup
                value={filter.mapId || "all"}
                onValueChange={(value) =>
                  setFilter((prev) => ({
                    ...prev,
                    mapId: value === "all" ? null : value,
                  }))
                }
              >
                <MenubarRadioItem value="all">All Maps</MenubarRadioItem>
                {maps.map(([id, name]) => (
                  <MenubarRadioItem key={id} value={id}>
                    {name}
                  </MenubarRadioItem>
                ))}
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="text-xs">
              Requirement: {getRequirementLabel(filter.requirement)}
            </MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup
                value={filter.requirement}
                onValueChange={(value: RequirementFilter) =>
                  setFilter((prev) => ({ ...prev, requirement: value }))
                }
              >
                <MenubarRadioItem value="all">All Tasks</MenubarRadioItem>
                <MenubarRadioItem value="kappa">
                  Kappa Required
                </MenubarRadioItem>
                <MenubarRadioItem value="lightkeeper">
                  Lightkeeper Required
                </MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      {/* Desktop Filters - Card */}
      <Card className="hidden md:block p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search Filter */}
          <div className="flex-1 w-full md:w-auto">
            <Label htmlFor="search" className="mb-2 block">
              Search Tasks
            </Label>
            <SearchInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Search by name, trader, map, or objective..."
            />
          </div>

          {/* Player Level Input */}
          <div className="w-full md:w-auto">
            <Label htmlFor="player-level" className="mb-2 block">
              Player Level
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="player-level"
                type="number"
                min="1"
                max="100"
                value={playerLevel || ""}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    void setPlayerLevel(1);
                  } else {
                    const numValue = parseInt(value, 10);
                    if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
                      void setPlayerLevel(numValue);
                    }
                  }
                }}
                placeholder="Enter your level"
                className="w-full md:w-24"
              />
              <Toggle
                pressed={showLockedByLevel}
                onPressedChange={setShowLockedByLevel}
                aria-label="Show locked by level"
                title={
                  showLockedByLevel
                    ? "Show all tasks"
                    : "Show only unlocked tasks"
                }
              >
                {showLockedByLevel ? (
                  <IconLock className="h-4 w-4" />
                ) : (
                  <IconLockOpen className="h-4 w-4" />
                )}
              </Toggle>
            </div>
          </div>

          {/* Requirement Filter */}
          <div className="w-full md:w-auto">
            <Label className="mb-2 block">Requirement</Label>
            <Select
              value={filter.requirement}
              onValueChange={(value: RequirementFilter | null) =>
                setFilter((prev) => ({ ...prev, requirement: value ?? "all" }))
              }
              items={[
                { value: "all", label: "All Tasks" },
                { value: "kappa", label: "Kappa Required" },
                { value: "lightkeeper", label: "Lightkeeper Required" },
              ]}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="kappa">Kappa Required</SelectItem>
                <SelectItem value="lightkeeper">
                  Lightkeeper Required
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-auto">
            <Label className="mb-2 block">Status</Label>
            <Select
              value={filter.status}
              onValueChange={(value: QuestStatus | null) =>
                setFilter((prev) => ({ ...prev, status: value ?? "all" }))
              }
              items={[
                { value: "all", label: "All Tasks" },
                { value: "uncompleted", label: "Uncompleted" },
                { value: "completed", label: "Completed" },
                { value: "locked", label: "Locked" },
                { value: "available", label: "Available" },
              ]}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="uncompleted">Uncompleted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
                <SelectItem value="available">Available</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Map Filter */}
          <div className="w-full md:w-auto">
            <Label className="mb-2 block">Map</Label>
            <Select
              value={filter.mapId || "all"}
              onValueChange={(value) =>
                setFilter((prev) => ({
                  ...prev,
                  mapId: value === "all" ? null : value,
                }))
              }
              items={[
                { value: "all", label: "All Maps" },
                ...maps.map(([id, name]) => ({ value: id, label: name })),
              ]}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Maps</SelectItem>
                {maps.map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Search Results Grid - Show when searching */}
      {searchQuery.trim().length > 0 ? (
        <div className="mt-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Found {fuzzySearchTasks.length} quest
              {fuzzySearchTasks.length !== 1 ? "s" : ""}
            </p>
          </div>
          {fuzzySearchTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {fuzzySearchTasks.map((quest: Task) => {
                const isLocked = isQuestLocked(quest);
                return (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    isLocked={isLocked}
                    onClick={() => setSelectedQuest(quest)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] bg-card border border-border rounded-lg">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">No quests found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Grid Table - Show when not searching */
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100svh-300px)]">
          <div className="inline-block min-w-full">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-20">
                <tr>
                  <th className="border border-border p-2 bg-muted/50 sticky left-0 z-30">
                    Level / Trader
                  </th>
                  {visibleTraders.map((trader) => (
                    <th
                      key={trader.name}
                      className="border border-border p-2 bg-muted/50 min-w-[200px]"
                    >
                      <div className="flex flex-col items-center gap-2">
                        {trader.imageLink && (
                          <img
                            src={trader.imageLink}
                            alt={trader.name}
                            className="w-8 h-8 object-contain"
                          />
                        )}
                        <span className="text-sm font-medium">
                          {trader.name}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleLevels.map((level) => (
                  <tr key={level}>
                    <td className="border border-border p-2 bg-muted/50 sticky left-0 z-10 font-semibold">
                      {level === 0 ? "No Level" : `Level ${level}`}
                    </td>
                    {visibleTraders.map((trader) => {
                      const cellQuests = getQuestsForCell(trader.name, level);
                      return (
                        <td
                          key={`${trader.name}-${level}`}
                          className="border border-border p-2 align-top"
                        >
                          <div className="space-y-2">
                            {cellQuests.map((quest) => {
                              const isLocked = isQuestLocked(quest);
                              return (
                                <QuestCard
                                  key={quest.id}
                                  quest={quest}
                                  isLocked={isLocked}
                                  onClick={() => setSelectedQuest(quest)}
                                />
                              );
                            })}
                            {cellQuests.length === 0 && (
                              <div className="text-xs text-muted-foreground text-center py-4">
                                —
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quest Info Dialog */}
      <QuestDialog
        quest={selectedQuest}
        allQuests={tasks}
        open={!!selectedQuest}
        onOpenChange={(open) => !open && setSelectedQuest(null)}
        onQuestClick={setSelectedQuest}
      />
    </div>
  );
}
