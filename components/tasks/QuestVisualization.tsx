"use client";

import { useMemo, useState, useCallback } from "react";
import type { Task } from "@/lib/types/tasks";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuest } from "@/contexts/QuestContext";
import { QuestCard } from "./QuestCard";
import { QuestDialog } from "./QuestDialog";

interface QuestVisualizationProps {
  tasks: Task[];
}

type QuestStatus = "all" | "uncompleted" | "completed" | "locked";
type QuestFilter = {
  kappaOnly: boolean;
  status: QuestStatus;
  mapId: string | null;
  searchQuery: string;
};

export default function QuestVisualization({ tasks }: QuestVisualizationProps) {
  const { isQuestCompleted } = useQuest();
  const [selectedQuest, setSelectedQuest] = useState<Task | null>(null);
  const [filter, setFilter] = useState<QuestFilter>({
    kappaOnly: false,
    status: "all",
    mapId: null,
    searchQuery: "",
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

  // Check if a quest is locked (requirements not met)
  const isQuestLocked = useCallback(
    (task: Task): boolean => {
      if (task.taskRequirements.length === 0) return false;
      return !task.taskRequirements.every((req) =>
        isQuestCompleted(req.task.id)
      );
    },
    [isQuestCompleted]
  );

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Search filter
    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.trader?.name.toLowerCase().includes(query) ||
          t.map?.name.toLowerCase().includes(query) ||
          t.objectives.some((obj) =>
            obj.description.toLowerCase().includes(query)
          )
      );
    }

    // Kappa filter
    if (filter.kappaOnly) {
      filtered = filtered.filter((t) => t.kappaRequired);
    }

    // Status filter
    if (filter.status === "completed") {
      filtered = filtered.filter((t) => isQuestCompleted(t.id));
    } else if (filter.status === "uncompleted") {
      filtered = filtered.filter((t) => !isQuestCompleted(t.id));
    } else if (filter.status === "locked") {
      filtered = filtered.filter((t) => isQuestLocked(t));
    }

    // Map filter
    if (filter.mapId) {
      filtered = filtered.filter((t) => t.map?.id === filter.mapId);
    }

    return filtered;
  }, [tasks, filter, isQuestCompleted, isQuestLocked]);

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

  return (
    <div className="w-full">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search Filter */}
          <div className="flex-1 w-full md:w-auto">
            <Label htmlFor="search" className="mb-2 block">
              Search Quests
            </Label>
            <Input
              id="search"
              type="text"
              placeholder="Search by name, trader, map, or objective..."
              value={filter.searchQuery}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              className="w-full"
            />
          </div>

          {/* Kappa Only Filter */}
          <div className="flex items-center space-x-2">
            <Switch
              id="kappa-only"
              checked={filter.kappaOnly}
              onCheckedChange={(checked) =>
                setFilter((prev) => ({ ...prev, kappaOnly: checked }))
              }
            />
            <Label htmlFor="kappa-only" className="cursor-pointer">
              Kappa Required Only
            </Label>
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
                { value: "all", label: "All Quests" },
                { value: "uncompleted", label: "Uncompleted" },
                { value: "completed", label: "Completed" },
                { value: "locked", label: "Locked" },
              ]}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quests</SelectItem>
                <SelectItem value="uncompleted">Uncompleted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
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

      {/* Grid */}
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)]">
        <div className="inline-block min-w-full">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="border border-border p-2 bg-muted/50 sticky left-0 z-30">
                  Level / Trader
                </th>
                {traders.map((trader) => (
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
                      <span className="text-sm font-medium">{trader.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {levels.map((level) => (
                <tr key={level}>
                  <td className="border border-border p-2 bg-muted/50 sticky left-0 z-10 font-semibold">
                    {level === 0 ? "No Level" : `Level ${level}`}
                  </td>
                  {traders.map((trader) => {
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
