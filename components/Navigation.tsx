"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ExportDialog } from "@/components/ExportDialog";
import { ImportDialog } from "@/components/ImportDialog";

const navigationItems = [
  { href: "/", label: "Hideout" },
  { href: "/inventory", label: "Inventory" },
  { href: "/tasks", label: "Tasks" },
  { href: "/watchlist", label: "Watchlist" },
];

export function Navigation() {
  const pathname = usePathname();
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <nav className="border-b border-border bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex h-14 items-center gap-1">
            <Link
              href="/"
              className="mr-6 text-lg font-semibold text-foreground hover:text-foreground/80 transition-colors"
            >
              Adin's Tarkov Tracker
            </Link>
            <div className="flex items-center gap-1 flex-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                onClick={() => setImportOpen(true)}
                variant="outline"
                size="sm"
              >
                Import
              </Button>
              <Button
                onClick={() => setExportOpen(true)}
                variant="outline"
                size="sm"
              >
                Export
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </>
  );
}
