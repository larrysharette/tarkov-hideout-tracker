import { type Metadata } from "next";

import { InventoryView } from "@/components/inventory/InventoryView";

export const metadata: Metadata = {
  title: "Inventory Tracker",
  description: "Track your item inventory and record raids",
  openGraph: {
    title: "Inventory Tracker | Adin's Tarkov Tracker",
    description: "Track your item inventory and record raids",
  },
  alternates: {
    canonical: "/inventory",
  },
};

export default function InventoryPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <InventoryView />
    </div>
  );
}
