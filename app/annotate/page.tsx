import { type Metadata } from "next";

import AnnotateContent from "./content";

export const metadata: Metadata = {
  title: "Annotate Maps",
  description: "Select a map to add annotations for tasks and items.",
  openGraph: {
    title: "Annotate Maps | Adin's Tarkov Tracker",
    description: "Select a map to add annotations for tasks and items.",
  },
  alternates: {
    canonical: "/annotate",
  },
};

export default function AnnotatePage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Annotate Maps</h1>
          <p className="text-muted-foreground">
            Select a map to add annotations for tasks and items.
          </p>
        </div>

        <AnnotateContent />
      </div>
    </div>
  );
}
