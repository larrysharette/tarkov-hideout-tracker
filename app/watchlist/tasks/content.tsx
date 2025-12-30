"use client";

import { IconExternalLink, IconPlus, IconTrash } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useMemo, useState } from "react";

import { QuestDialog } from "@/components/tasks/QuestDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { SearchInput } from "@/components/ui/search-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFuzzySearch } from "@/hooks/use-fuzzy-search";
import { useTaskWatchlist } from "@/hooks/use-task-watchlist";
import { db, type TaskRecord } from "@/lib/db";
import type { Task } from "@/lib/types/tasks";

export default function WatchlistTasksContent() {
  const {
    taskWatchlist,
    isLoading,
    addTaskToWatchlist,
    removeTaskFromWatchlist,
    isTaskInWatchlist,
  } = useTaskWatchlist();
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], [] as TaskRecord[]);
  const [quickAddTask, setQuickAddTask] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Get watchlist tasks
  const watchlistTasks = useMemo((): Task[] => {
    return tasks
      .filter((task) => taskWatchlist.includes(task.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [taskWatchlist, tasks]);

  // Fuzzy search for watchlist tasks
  const {
    results: fuzzySearchResults,
    query: searchQuery,
    setQuery: setSearchQuery,
  } = useFuzzySearch(watchlistTasks, {
    keys: [{ name: "name", weight: 1 }],
    minMatchCharLength: 2,
  });

  // Convert fuzzy search results back to Task[]
  const fuzzySearchTasks = useMemo(() => {
    if (!searchQuery.trim()) return watchlistTasks;
    return fuzzySearchResults as unknown as Task[];
  }, [searchQuery, fuzzySearchResults, watchlistTasks]);

  // Filter watchlist tasks by search query
  const filteredTasks = useMemo(() => {
    return searchQuery.trim() ? fuzzySearchTasks : watchlistTasks;
  }, [watchlistTasks, fuzzySearchTasks, searchQuery]);

  const handleRemoveTask = useCallback(
    (taskId: string) => {
      void removeTaskFromWatchlist(taskId);
    },
    [removeTaskFromWatchlist]
  );

  // Create a map of task names to task data for quick lookup
  const tasksMap = useMemo(() => {
    const map = new Map<string, Task>();
    tasks.forEach((task) => {
      map.set(task.name, task);
    });
    return map;
  }, [tasks]);

  // Get task names for quick add combobox
  const taskNames = useMemo(() => {
    return tasks
      .filter((task) => !isTaskInWatchlist(task.id))
      .map((task) => task.name)
      .sort();
  }, [tasks, isTaskInWatchlist]);

  const handleQuickAdd = useCallback(() => {
    if (quickAddTask) {
      const task = tasksMap.get(quickAddTask);
      if (task) {
        void addTaskToWatchlist(task.id);
        setQuickAddTask("");
      }
    }
  }, [quickAddTask, addTaskToWatchlist, tasksMap]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Watchlist - Tasks</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalTasks = watchlistTasks.length;

  return (
    <>
      {/* Quick Add */}
      <Card>
        <CardContent className="py-1">
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div className="flex-1 w-full">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Quick Add Task
              </label>
              <Combobox
                items={taskNames}
                value={quickAddTask}
                onValueChange={(value) => setQuickAddTask(value || "")}
                limit={10}
              >
                <ComboboxInput
                  showClear
                  placeholder="Search for a task..."
                  className="w-full"
                />
                <ComboboxContent>
                  <ComboboxEmpty>No tasks found.</ComboboxEmpty>
                  <ComboboxList>
                    {(taskName) => {
                      const task = tasksMap.get(taskName);
                      return (
                        <ComboboxItem
                          key={task?.id ?? taskName}
                          value={taskName}
                        >
                          <div className="flex items-center gap-2">
                            <span>{taskName}</span>
                            {task?.trader && (
                              <Badge variant="outline" className="text-xs">
                                {task.trader.name}
                              </Badge>
                            )}
                          </div>
                        </ComboboxItem>
                      );
                    }}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <Button
              onClick={handleQuickAdd}
              disabled={!quickAddTask}
              className="w-full sm:w-auto"
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <SearchInput
        value={searchQuery}
        onValueChange={setSearchQuery}
        placeholder="Search tasks..."
        className="w-full"
      />

      {/* Summary */}
      {totalTasks > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Total Tasks: </span>
            <span className="font-medium">{totalTasks}</span>
          </div>
        </div>
      )}

      {/* Watchlist Content */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <p className="text-sm font-medium">
                  {searchQuery
                    ? "No tasks found matching your search"
                    : totalTasks === 0
                    ? "Your task watchlist is empty"
                    : "No tasks match your search"}
                </p>
                {!searchQuery && totalTasks === 0 && (
                  <p className="text-xs">
                    Add tasks to your watchlist from the Tasks page
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Table View */
        <div className="overflow-x-auto -mx-4 px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Trader</TableHead>
                <TableHead>Map</TableHead>
                <TableHead className="text-center">Wiki</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => {
                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="text-left hover:underline cursor-pointer"
                      >
                        {task.name}
                      </button>
                    </TableCell>
                    <TableCell>
                      {task.trader ? (
                        <Badge variant="outline">{task.trader.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No Trader
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.map ? (
                        <Badge variant="secondary">{task.map.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Any Location
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {task.wikiLink && (
                        <a
                          href={task.wikiLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
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
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTask(task.id);
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
          Showing {filteredTasks.length} of {totalTasks} tasks
        </p>
      )}

      {/* Quest Dialog */}
      <QuestDialog
        quest={selectedTask}
        allQuests={tasks}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        onQuestClick={setSelectedTask}
      />
    </>
  );
}
