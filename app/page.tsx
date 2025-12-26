import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "The ultimate Escape from Tarkov tracker for hideout upgrades, task progression, inventory management, and item watchlists. Plan your upgrade path, track quest completion, manage your inventory, and never miss a task objective. Free Tarkov hideout calculator and quest tracker.",
  openGraph: {
    title:
      "Adin's Tarkov Tracker - Complete Escape from Tarkov Progress Tracker",
    description:
      "Comprehensive Escape from Tarkov tracker for hideout upgrades, task progression, inventory management, and item watchlists. Track station levels, quest completion, and plan your upgrade path.",
  },
};

const features = [
  {
    title: "Hideout Tracker",
    description:
      "Track your hideout station levels and trader requirements. Calculate item requirements for focused upgrades and plan your upgrade path efficiently. Manage trader levels and station upgrades all in one place.",
    href: "/hideout",
    keywords: [
      "hideout upgrades",
      "station levels",
      "trader levels",
      "upgrade calculator",
      "shopping list",
    ],
  },
  {
    title: "Task Tracker",
    description:
      "Browse and track all Escape from Tarkov tasks organized by trader and level. Filter by status, map, and Kappa requirements. Plan your task progression and never miss an objective.",
    href: "/tasks",
    keywords: [
      "tarkov tasks",
      "quest tracker",
      "kappa quests",
      "task progression",
      "quest completion",
    ],
  },
  {
    title: "Inventory Tracker",
    description:
      "Track your item inventory and record raids. Keep track of what items you have collected and manage your stash efficiently. Perfect for planning hideout upgrades and task requirements.",
    href: "/inventory",
    keywords: [
      "inventory management",
      "raid recording",
      "item tracking",
      "stash management",
    ],
  },
  {
    title: "Watchlist",
    description:
      "Create a watchlist of items you need to collect. Items are automatically added with quantities when you add them from other pages. Never forget what items you're looking for.",
    href: "/watchlist",
    keywords: [
      "item watchlist",
      "shopping list",
      "item collection",
      "required items",
    ],
  },
];

export default function Page() {
  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl">
      {/* Hero Section */}
      <section className="py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          Adin's Tarkov Tracker
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          The ultimate Escape from Tarkov progress tracker. Plan your hideout
          upgrades, track quest completion, manage your inventory, and optimize
          your gameplay with powerful tracking tools.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/hideout" className={cn(buttonVariants({ size: "lg" }))}>
            Get Started
          </Link>
          <Link
            href="/tasks"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            View Tasks
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Complete Tarkov Tracking Solution
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Everything you need to track your Escape from Tarkov progress in one
          place. From hideout upgrades to quest completion, manage your entire
          Tarkov journey efficiently.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Card key={feature.href} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="flex flex-wrap gap-2">
                  {feature.keywords.map((keyword) => (
                    <li
                      key={keyword}
                      className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground"
                    >
                      {keyword}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link
                  href={feature.href}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full"
                  )}
                >
                  Explore {feature.title}
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-12 md:py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Use Adin's Tarkov Tracker?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track hideout upgrades, quest progression, inventory items, and
                watchlists all in one application. No need to switch between
                multiple tools.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Smart Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatically calculate item requirements for focused upgrades.
                Generate shopping lists based on your current progress and
                planned upgrades.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Data Portability</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Export and import your progress data. Never lose your tracking
                information and sync across devices easily.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-none space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Escape from Tarkov Hideout Tracker
            </h2>
            <p className="text-muted-foreground mb-4">
              Our hideout tracker helps you manage all your Escape from Tarkov
              hideout upgrades efficiently. Track station levels for all hideout
              modules including the Generator, Heating, Water Collector, Air
              Filtering Unit, Security, and more. Set your current trader levels
              and the tracker will automatically calculate what items you need
              for your next upgrades.
            </p>
            <p className="text-muted-foreground mb-4">
              The upgrade focus manager allows you to select specific upgrades
              you're working towards, and the system will generate a
              comprehensive shopping list with exact item quantities needed.
              This makes planning your hideout progression much easier and
              ensures you never waste time collecting unnecessary items.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 mt-8">
              Tarkov Quest and Task Tracker
            </h2>
            <p className="text-muted-foreground mb-4">
              Track all Escape from Tarkov tasks and quests organized by trader
              and level. Filter tasks by completion status, map location, and
              Kappa requirements. Our quest tracker helps you plan your task
              progression efficiently, ensuring you complete tasks in the
              optimal order and never miss important objectives.
            </p>
            <p className="text-muted-foreground mb-4">
              Whether you're working towards Kappa container or just trying to
              level up traders, our task tracker provides all the information
              you need. See which tasks unlock other tasks, track your progress,
              and plan your gameplay sessions around task objectives.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 mt-8">
              Inventory Management and Item Tracking
            </h2>
            <p className="text-muted-foreground mb-4">
              Keep track of your item inventory and record raids to maintain an
              accurate count of what you have. The inventory tracker integrates
              seamlessly with the hideout tracker and task tracker,
              automatically showing you what items you still need to collect.
            </p>
            <p className="text-muted-foreground mb-4">
              Create a watchlist of items you need for upgrades or tasks, and
              the system will track quantities automatically. This makes it easy
              to know exactly what to look for during your raids, improving your
              efficiency and reducing wasted time.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 mt-8">
              Free Tarkov Calculator and Planner
            </h2>
            <p className="text-muted-foreground mb-4">
              All features are completely free to use. No registration required,
              no hidden fees. Simply start tracking your progress and export
              your data whenever you need it. The application works entirely in
              your browser, ensuring your data stays private and secure.
            </p>
            <p className="text-muted-foreground">
              Whether you're a new player just starting your Tarkov journey or a
              veteran working towards end-game goals like Kappa container,
              Adin's Tarkov Tracker provides the tools you need to optimize your
              gameplay. Start tracking today and take your Escape from Tarkov
              progression to the next level.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Start Tracking?</CardTitle>
            <CardDescription>
              Begin tracking your Escape from Tarkov progress today. No account
              required, completely free.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/hideout"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Track Hideout
            </Link>
            <Link
              href="/tasks"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Track Tasks
            </Link>
            <Link
              href="/inventory"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Manage Inventory
            </Link>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
