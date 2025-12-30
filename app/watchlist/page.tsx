import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import Content from "./content";
import MapSelector from "./map-selector";

export const metadata: Metadata = {
  title: "Watchlist",
  description: "View your watchlist tasks and items filtered by map.",
  openGraph: {
    title: "Watchlist | Adin's Tarkov Tracker",
    description: "View your watchlist tasks and items filtered by map.",
  },
  alternates: {
    canonical: "/watchlist",
  },
};

export default function WatchlistOverviewPage() {
  return (
    <>
      <div className="hidden">
        {[
          "customs",
          "reserve",
          "factory",
          "shoreline",
          "interchange",
          "woods",
          "ground_zero",
          "labs",
          "lighthouse",
          "streets_of_tarkov",
        ].map((map) => (
          <Image
            key={map}
            src={`/maps/${map}.webp`}
            alt={map}
            width={1200}
            height={800}
            className="hidden"
          />
        ))}
      </div>
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
            <Suspense fallback={<div>Loading...</div>}>
              <MapSelector />
            </Suspense>
          </div>

          {/* Main Content - Responsive Layout */}
          <Content />
        </div>
      </div>
    </>
  );
}
