import type { Metadata } from "next";

import { QuestHeader } from "@/components/tasks/QuestHeader";
import QuestVisualization from "@/components/tasks/QuestVisualization";

export const metadata: Metadata = {
  title: "Task Tracker",
  description:
    "Browse and track all Escape from Tarkov tasks organized by trader and level. Filter by status, map, and Kappa requirements. Plan your task progression.",
  openGraph: {
    title: "Task Tracker | Adin's Tarkov Tracker",
    description:
      "Browse and track all Escape from Tarkov tasks organized by trader and level.",
  },
  alternates: {
    canonical: "/tasks",
  },
};

export default async function TasksPage() {
  return (
    <div className="px-4 md:px-6 py-6">
      <QuestHeader />
      <QuestVisualization />
    </div>
  );
}
