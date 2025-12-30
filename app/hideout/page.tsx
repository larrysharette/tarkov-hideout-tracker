import type { Metadata } from "next";

import { ItemSummaryTable } from "@/components/hideout/ItemSummaryTable";
import { StationLevelSelector } from "@/components/hideout/StationLevelSelector";
import { TraderLevelSelector } from "@/components/hideout/TraderLevelSelector";
import { UpgradeFocusManager } from "@/components/hideout/UpgradeFocusManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Hideout",
  description:
    "Track your Escape from Tarkov hideout upgrade requirements and inventory.",
  openGraph: {
    title: "Hideout | Adin's Tarkov Tracker",
    description:
      "Track your Escape from Tarkov hideout upgrade requirements. Calculate item requirements for focused upgrades and future needs.",
  },
  alternates: {
    canonical: "/hideout",
  },
};

export default function Page() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Hideout</h1>
        <p className="text-muted-foreground">
          Track your hideout upgrade requirements and inventory
        </p>
      </div>

      <Tabs defaultValue="current-levels" className="w-full">
        <TabsList>
          <TabsTrigger value="current-levels">Current Levels</TabsTrigger>
          <TabsTrigger value="shopping-list">Shopping List</TabsTrigger>
        </TabsList>
        <TabsContent value="current-levels" className="mt-6 space-y-6">
          <TraderLevelSelector />
          <StationLevelSelector />
        </TabsContent>
        <TabsContent value="shopping-list" className="mt-6 space-y-6">
          <UpgradeFocusManager />
          <ItemSummaryTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
