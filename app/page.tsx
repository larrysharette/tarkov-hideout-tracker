import type { Metadata } from "next";
import Image from "next/image";

import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Adin's Tarkov Tracker",
  description:
    "Escape from Tarkov tracker: plan hideout upgrades, track tasks, manage inventory & watchlists. Free, easy, and no login required.",
  openGraph: {
    title: "Adin's Tarkov Tracker",
    description:
      "Escape from Tarkov tracker: plan hideout upgrades, track tasks, manage inventory & watchlists. Free, easy, and no login required.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl">
      <section className="py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          Adin's Tarkov Tracker
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Track your hideout upgrades, tasks, inventory, and watchlist all in
          one place.
        </p>
      </section>

      <section className="py-12 md:py-16 space-y-16">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Task Tracker
            </h2>
            <ul className="text-left max-w-2xl mx-auto space-y-2 text-muted-foreground list-disc list-inside">
              <li>Browse all tasks organized by trader</li>
              <li>Tasks organized by trader and level</li>
              <li>
                Filter by completion status, map, and Kappa/Lightkeeper
                requirements
              </li>
              <li>Filter by player level</li>
              <li>See Kappa/Lightkeeper progress at a glance</li>
              <li>
                Bulk mark tasks as complete based on which tasks you are
                currently on
              </li>
              <li>View task details, requirements, and progress</li>
              <li>Quickly jump to the wiki page for any task</li>
            </ul>
          </div>
          <div>
            <div className="rounded-lg border overflow-hidden relative">
              <Image
                src="/task_screen.webp"
                alt="Task tracker screen"
                width={1200}
                height={900}
                className="w-auto h-full"
              />
              <Image
                src="/task_dialog.webp"
                alt="Task dialog showing task details"
                width={1200}
                height={800}
                className="w-[30%] h-auto absolute bottom-0 right-0 z-10 border-2 border-stone-800"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              You can view task details, requirements, and mark your progress.
              Tasks are organized by trader and level.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Hideout Upgrades
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">
                Upgrade Focus
              </h3>
              <ul className="text-left max-w-2xl mx-auto space-y-2 text-muted-foreground list-disc list-inside">
                <li>
                  Select specific upgrades you're working on and get a shopping
                  list of exactly what you need
                </li>
                <li>
                  See a summary of all items needed across your selected
                  upgrades
                </li>
                <li>
                  Click the purchase button to auto level your station and
                  remove the items from your inventory
                </li>
                <li>
                  Quickly see how close you are to finishing your upgrades
                </li>
                <li>
                  Filter upgrades to quickly see what you want to focus on
                </li>
              </ul>
            </div>
            <div>
              <div className="rounded-lg border overflow-hidden">
                <Image
                  src="/upgrade_focus.webp"
                  alt="Hideout upgrade focus manager"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Select specific upgrades you're working on and get a shopping
                list of exactly what you need.
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <div className="rounded-lg border overflow-hidden">
                <Image
                  src="/item_summary.webp"
                  alt="Item summary table"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                The summary shows how many of each item you need, what you have,
                and what's still missing.
              </p>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">
                Item Summary
              </h3>
              <ul className="text-left max-w-2xl mx-auto space-y-2 text-muted-foreground list-disc list-inside">
                <li>
                  See a summary of all items needed across your selected
                  upgrades
                </li>
                <li>
                  Focused upgrades are listed first, followed by future upgrades
                </li>
                <li>
                  Quantities are calculated based on your current inventory
                </li>
                <li>
                  The summary shows how many of each item you need right now,
                  what you have, and what you will need in the future
                </li>
                <li>
                  Quickly add items to your watchlist to track your progress
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Inventory Tracking
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">
                Inventory Management
              </h3>
              <ul className="text-left max-w-2xl mx-auto space-y-2 text-muted-foreground list-disc list-inside">
                <li>
                  Keep track of items in your stash that are needed for tasks
                  and hideout upgrades
                </li>
                <li>Add items manually or record them after raids</li>
                <li>
                  Your inventory syncs with hideout upgrades and tasks to show
                  what you still need
                </li>
                <li>
                  Add items to your watchlist so you know what you need to
                  collect
                </li>
                <li>
                  Quickly add crafting items to your watchlist from the
                  inventory view. This way you know what items you need to craft
                  things like the Electric Motor 🙃
                </li>
              </ul>
            </div>
            <div>
              <div className="rounded-lg border overflow-hidden">
                <Image
                  src="/inventory.webp"
                  alt="Inventory tracking screen"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Keep track of items in your stash that are needed for tasks and
                hideout upgrades
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <div className="rounded-lg border overflow-hidden">
                <Image
                  src="/record_raid.webp"
                  alt="Record raid dialog"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Quickly add items from your raid to keep your inventory up to
                date.
              </p>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">
                Record Raids
              </h3>
              <ul className="text-left max-w-2xl mx-auto space-y-2 text-muted-foreground list-disc list-inside">
                <li>
                  After each raid, record what items you found. This updates
                  your inventory automatically
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Watchlist</h2>
          <p className="text-muted-foreground mb-6">
            A basic watchlist of items that you want to keep track of. The
            in-game favorite list is great but it's nice to know how MANY of the
            item we still need. This helps with that.
          </p>
          <div className="rounded-lg border overflow-hidden">
            <Image
              src="/watchlist.webp"
              alt="Watchlist screen"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Your watchlist shows quantities needed and what you already have
            collected.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 space-y-8 max-w-[80ch] mx-auto">
        <h2 className="text-2xl font-bold mb-4">Other things</h2>
        <ul className="text-left max-w-2xl space-y-2 text-muted-foreground list-disc list-inside">
          <li>This app requires no login and is completely free to use</li>
          <li>
            All data is stored locally to your browser and is not shared with
            anyone
          </li>
          <li>
            You can export your data as a yaml file and import it later if you
            want to move to a different browser or device
          </li>
        </ul>

        <Separator />

        <div className="max-w-[80ch] mx-auto">
          <h3 className="text-xl md:text-2xl font-bold mb-4">
            Why I made this
          </h3>
          <p className="text-sm text-muted-foreground mt-4">
            Yes, this app is mostly vibe coded. I've been working as a
            programmer for over 10 years and I try to keep my free time away
            from programming as much as possible these days. However, in this
            particular case most of the online trackers I found didn't have the
            functionality I was looking for, or their UI over designed and hard
            to use. I'm not a designer and honestly I just want to play the game
            so I vibe coded the majority of this app to fit my needs. If that's
            not your jam, totally understand and hope you find something else
            that works for you.
            <br />
            <br />
            I want to keep this app simple to use, focus on what is actually
            helpful, make it as friendly as possible to all different device
            sizes, and free to use. Unless this app becomes popular and I need
            to pay for hosting costs, I will keep it ad free. Honestly, I really
            doubt it would ever get to that.
            <br />
            <br />
            If you find this app useful, consider sharing it with your friends.
            <br />
            <br />
            Big shoutout to{" "}
            <a
              href="https://tarkov.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600"
            >
              tarkov.dev
            </a>{" "}
            ❤️ for providing the data for this app for free. I legit wouldn't
            have been able to make this app so easily without them.
          </p>
        </div>
      </section>
    </div>
  );
}
