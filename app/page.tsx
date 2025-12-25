import { HideoutProvider } from "@/contexts/HideoutContext";
import { TraderLevelSelector } from "@/components/hideout/TraderLevelSelector";
import { StationLevelSelector } from "@/components/hideout/StationLevelSelector";
import { UpgradeFocusManager } from "@/components/hideout/UpgradeFocusManager";
import { ItemSummaryTable } from "@/components/hideout/ItemSummaryTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Page() {
  return (
    <HideoutProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Tarkov Hideout Tracker</h1>
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
      </div>
    </HideoutProvider>
  );
}
