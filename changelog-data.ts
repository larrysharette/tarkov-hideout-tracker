interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const changelogEntries: ChangelogEntry[] = [
  {
    version: "0.1.3",
    date: "2025-12-29",
    changes: [
      "Added task watchlist functionality - tasks can now be added to watchlist separately from items",
      "Refactored watchlist into overview page with map filtering and dedicated items/tasks pages",
      "Added map images for all Tarkov maps displayed in watchlist overview",
      "Enhanced Record Raid Dialog with task selection and completion tracking",
      "Improved Record Raid Dialog summary view showing hideout progress and task completion",
      "Updated navigation import/export buttons to icon-only and moved the Record Raid button there",
      "Improved cache management when I publish new versions of the app",
    ],
  },
  {
    version: "0.1.2",
    date: "2025-12-28",
    changes: [
      "Added Lightkeeper requirement support for tasks",
      "Enhanced task filtering with requirement filter (All/Kappa/Lightkeeper)",
      "Added 'Mark Prerequisites Complete' button to bulk mark prerequisite tasks as completed",
      "Improved task visualization to hide empty level rows",
      "Added player level input to the task visualization",
      "Added a filter to only show tasks that meet the player level requirement",
      "Added a progress indicator to the task visualization for Kappa and Lightkeeper requirements",
      "Improved the player level input",
      "Fixed verbage that used to say Quests to Tasks",
      "Fixed scrolling issue in the task visualization",
      "Added the data by tarkov.dev link to the navigation. Should have been there the whole time.",
      "Updated the home page to be more directly informative and less marketing-y. It was vibe coded so I didn't have to think too much about it and frankly, it was ass.",
      "Improved the Record Raid Dialog to be more condensed and easier to use. Pressing Tab or Enter on the last item will auto add a new item.",
      "Fixed the task dialog to show the required keys correctly",
    ],
  },
  {
    version: "0.1.1",
    date: "2025-12-27",
    changes: [
      "Added mobile navigation drawer for better mobile experience",
      "Added fuzzy search functionality with SearchInput component",
      "Added debounce hook for optimized search performance",
      "Enhanced task visualization with search and filtering capabilities",
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
      "Task and task progression tracking",
      "Inventory management",
      "Item watchlist functionality",
      "Export/import data functionality",
    ],
  },
];

export const APP_VERSION = changelogEntries[0].version ?? "0.1.0";
export const BUILD_DATE = process.env.NEXT_PUBLIC_BUILD_DATE || "";
