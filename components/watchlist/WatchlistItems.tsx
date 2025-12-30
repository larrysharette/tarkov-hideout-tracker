"use client";

import { IconExternalLink } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { ItemHoverCard } from "@/components/ui/item-hover-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Item } from "@/lib/types/item";

interface WatchlistItem {
  name: string;
  quantity: number;
  itemData?: Item;
}

interface WatchlistItemsProps {
  items: WatchlistItem[];
  inventory: Record<string, number>;
}

function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

export function WatchlistItems({ items, inventory }: WatchlistItemsProps) {
  if (items.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No items in watchlist</p>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Items</h2>
      <div className="overflow-x-auto -mx-2 px-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 h-7"></TableHead>
              <TableHead className="h-7 text-xs">Item Name</TableHead>
              <TableHead className="text-right h-7 text-xs">Owned</TableHead>
              <TableHead className="text-right h-7 text-xs">Need</TableHead>
              <TableHead className="w-10 h-7"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((watchlistItem) => {
              const iconElement = watchlistItem.itemData?.iconLink ? (
                <div className="shrink-0 cursor-pointer">
                  <img
                    src={watchlistItem.itemData.iconLink}
                    alt={watchlistItem.name}
                    className="w-6 h-6 object-contain"
                  />
                </div>
              ) : (
                <div className="shrink-0 w-6 h-6 bg-muted rounded flex items-center justify-center cursor-pointer">
                  <span className="text-xs text-muted-foreground">?</span>
                </div>
              );

              const inventoryQuantity = inventory[watchlistItem.name] || 0;

              return (
                <TableRow key={watchlistItem.name}>
                  <TableCell className="py-1.5">
                    <ItemHoverCard
                      itemName={watchlistItem.name}
                      itemData={watchlistItem.itemData}
                      iconElement={iconElement}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-xs py-1.5">
                    {watchlistItem.name}
                  </TableCell>
                  <TableCell className="text-right text-xs py-1.5">
                    {formatNumber(inventoryQuantity)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-xs py-1.5">
                    {formatNumber(watchlistItem.quantity)}
                  </TableCell>
                  <TableCell className="py-1.5">
                    {watchlistItem.itemData?.wikiLink && (
                      <a
                        href={watchlistItem.itemData.wikiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        title="Open wiki"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <IconExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
