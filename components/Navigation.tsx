"use client";

import { IconDownload, IconMenu, IconUpload } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect,useState } from "react";

import { APP_VERSION, BUILD_DATE } from "@/changelog-data";
import { ExportDialog } from "@/components/ExportDialog";
import { ImportDialog } from "@/components/ImportDialog";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { RecordRaidDialog } from "./record-raid-dialog/RecordRaidDialog";
import { ButtonGroup } from "./ui/button-group";

const navigationItems = [
  { href: "/hideout", label: "Hideout" },
  { href: "/tasks", label: "Tasks" },
  { href: "/inventory", label: "Inventory" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/annotate", label: "Annotate" },
];

export function Navigation() {
  const pathname = usePathname();
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    if (BUILD_DATE) {
      try {
        const buildDate = new Date(BUILD_DATE);
        if (!isNaN(buildDate.getTime())) {
          setLastUpdated(formatDistanceToNow(buildDate, { addSuffix: true }));
        }
      } catch {
        // Ignore errors
      }
    }
  }, []);

  return (
    <>
      <nav className="border-b border-border bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex h-14 items-center gap-2">
            {/* Mobile menu drawer */}
            <Drawer
              open={mobileMenuOpen}
              onOpenChange={setMobileMenuOpen}
              direction="left"
            >
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden p-2"
                  aria-label="Open menu"
                >
                  <IconMenu className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-full w-3/4 sm:max-w-sm">
                <DrawerHeader>
                  <DrawerTitle>Menu</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-1 px-4 flex-1 overflow-y-auto">
                  <nav className="flex flex-col gap-1">
                    {navigationItems.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href === "/annotate" &&
                          pathname.startsWith("/annotate"));
                      return (
                        <DrawerClose key={item.href} asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "px-4 py-3 text-base font-medium rounded-md transition-colors",
                              isActive
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                          >
                            {item.label}
                          </Link>
                        </DrawerClose>
                      );
                    })}
                    <Separator className="my-2" />
                    <DrawerClose asChild>
                      <Link
                        href="/changelog"
                        className="px-4 py-3 text-base font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      >
                        Changelog
                      </Link>
                    </DrawerClose>
                  </nav>
                </div>
                <DrawerFooter className="gap-2">
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setImportOpen(true);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Import
                    </Button>
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setExportOpen(true);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Export
                    </Button>
                  </div>
                  {lastUpdated && (
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      v{APP_VERSION} • Updated {lastUpdated}
                    </div>
                  )}
                  <a
                    href="https://tarkov.dev/api/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground text-center hover:text-foreground transition-colors"
                  >
                    Data by tarkov.dev
                  </a>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            {/* Logo/Title */}
            <Link
              href="/"
              className="text-base md:text-lg font-semibold text-foreground hover:text-foreground/80 transition-colors truncate"
            >
              <span className="hidden sm:inline">Adin's Tarkov Tracker</span>
              <span className="sm:hidden">Adin's Tarkov Tracker</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 flex-1">
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/annotate" &&
                    pathname.startsWith("/annotate"));
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

            {/* Right side actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Version info - desktop only */}
              <div className="hidden lg:flex items-center gap-2">
                <Link href="/changelog">
                  <span className="text-xs text-muted-foreground">
                    v{APP_VERSION}
                    {lastUpdated && ` • Updated ${lastUpdated}`}
                  </span>
                </Link>
                <a
                  href="https://tarkov.dev/api/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Data by tarkov.dev
                </a>
              </div>

              {/* Import/Export buttons */}
              <div className="md:flex items-center gap-1 md:gap-2 hidden">
                <ButtonGroup>
                  <Button
                    onClick={() => setImportOpen(true)}
                    variant="outline"
                    size="icon"
                    title="Import"
                  >
                    <IconDownload />
                  </Button>
                  <Button
                    onClick={() => setExportOpen(true)}
                    variant="outline"
                    size="icon"
                    title="Export"
                  >
                    <IconUpload />
                  </Button>
                </ButtonGroup>
              </div>
              <RecordRaidDialog />
            </div>
          </div>
        </div>
      </nav>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </>
  );
}
