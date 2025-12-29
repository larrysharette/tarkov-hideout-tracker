import { WatchlistView } from "@/components/watchlist/WatchlistView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watchlist - Items",
  description: "Track items you need to collect",
  openGraph: {
    title: "Watchlist - Items | Adin's Tarkov Tracker",
    description: "Track items you need to collect",
  },
};

export default function WatchlistItemsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Watchlist - Items</h1>
          <p className="text-muted-foreground">
            Track items you need to collect. Items are automatically added with
            quantities when you add them from other pages.
          </p>
        </div>
        <WatchlistView />
      </div>
    </div>
  );
}
