import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { changelogEntries } from "@/changelog-data";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Version history and updates for Adin's Tarkov Tracker",
  openGraph: {
    title: "Changelog | Adin's Tarkov Tracker",
    description: "Version history and updates for Adin's Tarkov Tracker",
  },
};

export default function ChangelogPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Changelog</h1>
        <p className="text-muted-foreground">
          Version history and updates for Adin's Tarkov Tracker
        </p>
      </div>

      <div className="space-y-4 max-w-4xl">
        {changelogEntries.map((entry) => (
          <Card key={entry.version} className="p-6 w-full">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold">v{entry.version}</h2>
              <span className="text-sm text-muted-foreground">
                {new Date(entry.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {entry.changes.map((change, index) => (
                <li key={index}>{change}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
