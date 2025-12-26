import QuestVisualization from "@/components/tasks/QuestVisualization";
import type { Task } from "@/lib/types/tasks";
import type { Metadata } from "next";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Task Tracker",
  description:
    "Browse and track all Escape from Tarkov tasks organized by trader and level. Filter by status, map, and Kappa requirements. Plan your task progression.",
  openGraph: {
    title: "Task Tracker | Adin's Tarkov Tracker",
    description:
      "Browse and track all Escape from Tarkov tasks organized by trader and level.",
  },
};

async function getTasks(): Promise<Task[]> {
  try {
    // Get the host from headers for server-side fetch
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    const response = await fetch(`${baseUrl}/api/tasks`, {
      next: { revalidate: 86400 }, // Revalidate every 24 hours
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.status}`);
    }

    const tasks: Task[] = await response.json();
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <div className="px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Task Tracker</h1>
        <p className="text-muted-foreground">
          Browse and track all Escape from Tarkov tasks organized by trader and
          level
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="flex items-center justify-center h-[600px] bg-card border border-border rounded-lg">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Loading task data...</p>
            <p className="text-sm text-muted-foreground">
              If this persists, there may be an issue fetching data from the
              API.
            </p>
          </div>
        </div>
      ) : (
        <QuestVisualization tasks={tasks} />
      )}
    </div>
  );
}
