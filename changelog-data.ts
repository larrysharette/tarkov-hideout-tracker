interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const changelogEntries: ChangelogEntry[] = [
  {
    version: "0.1.2",
    date: "2025-12-28",
    changes: [
      "Added Lightkeeper requirement support for quests",
      "Enhanced quest filtering with requirement filter (All/Kappa/Lightkeeper)",
      "Added 'Mark Prerequisites Complete' button to bulk mark prerequisite quests as completed",
      "Improved quest visualization to hide empty level rows",
    ],
  },
  {
    version: "0.1.1",
    date: "2025-12-27",
    changes: [
      "Added mobile navigation drawer for better mobile experience",
      "Added fuzzy search functionality with SearchInput component",
      "Added debounce hook for optimized search performance",
      "Enhanced quest visualization with search and filtering capabilities",
      "Improved inventory, watchlist, and hideout views with search integration",
      "Added drawer UI component for mobile-friendly interactions",
      "Added on click to the item icons to open the item info panel for better mobile experience",
    ],
  },
  {
    version: "0.1.0",
    date: "2025-12-26",
    changes: [
      "Initial release",
      "Hideout upgrade tracking",
      "Task and quest progression tracking",
      "Inventory management",
      "Item watchlist functionality",
      "Export/import data functionality",
    ],
  },
];

export const APP_VERSION = changelogEntries[0].version ?? "0.1.0";
export const BUILD_DATE = process.env.NEXT_PUBLIC_BUILD_DATE || "";
