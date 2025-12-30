"use client";

import { IconExternalLink, IconWorld } from "@tabler/icons-react";
import { useCallback } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/types/tasks";

interface WatchlistTasksProps {
  tasks: Task[];
}

export function WatchlistTasks({ tasks }: WatchlistTasksProps) {
  const handleOpenAllWikis = useCallback(() => {
    tasks.forEach((task) => {
      if (task.wikiLink) {
        window.open(task.wikiLink, "_blank", "noopener,noreferrer");
      }
    });
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No tasks in watchlist
      </p>
    );
  }

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenAllWikis}
          className="gap-2 h-7 text-xs"
        >
          <IconWorld className="h-3 w-3" />
          Open All Wikis
        </Button>
      </div>
      <Accordion multiple className="w-full">
        {tasks.map((task) => (
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
                    <p className="font-medium mb-1">Objectives:</p>
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
    </div>
  );
}

