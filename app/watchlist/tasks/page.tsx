import { type Metadata } from "next";

import WatchlistTasksContent from "./content";

export const metadata: Metadata = {
  title: "Watchlist - Tasks",
  description:
    "Track tasks you need to complete. Add tasks to your watchlist to keep track of them.",
  openGraph: {
    title: "Watchlist - Tasks | Adin's Tarkov Tracker",
    description:
      "Track tasks you need to complete. Add tasks to your watchlist to keep track of them.",
  },
  alternates: {
    canonical: "/watchlist/tasks",
  },
};

export default function WatchlistTasksPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Watchlist - Tasks</h1>
          <p className="text-muted-foreground">
            Track tasks you need to complete. Add tasks to your watchlist to
            keep track of them.
          </p>
        </div>

        <WatchlistTasksContent />
      </div>
    </div>
  );
}
