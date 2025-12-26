"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { IconExternalLink, IconEye } from "@tabler/icons-react";
import type { Item } from "@/app/api/items/route";

interface ItemHoverCardProps {
  itemName: string;
  itemData?: Item;
  iconElement: React.ReactNode;
  onAddCraftRequirementsToWatchlist?: (craft: {
    requiredItems: Array<{ item: { name: string }; count: number }>;
  }) => void;
}

export function ItemHoverCard({
  itemName,
  itemData,
  iconElement,
  onAddCraftRequirementsToWatchlist,
}: ItemHoverCardProps) {
  const hasInfo =
    (itemData?.usedInTasks?.length ?? 0) > 0 ||
    (itemData?.craftsFor?.length ?? 0) > 0 ||
    (itemData?.craftsUsing?.length ?? 0) > 0;

  if (!hasInfo) {
    return <>{iconElement}</>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger suppressHydrationWarning>
        {iconElement}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">{itemName}</h4>
            {itemData?.wikiLink && (
              <a
                href={itemData.wikiLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                View on Wiki
                <IconExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Tasks */}
          {itemData?.usedInTasks && itemData.usedInTasks.length > 0 && (
            <div>
              <h5 className="font-medium text-xs mb-1.5 text-muted-foreground">
                Used in Tasks ({itemData.usedInTasks.length})
              </h5>
              <div className="space-y-1">
                {itemData.usedInTasks.map((task) => (
                  <div
                    key={task.id}
                    className="text-xs bg-muted/50 rounded px-2 py-1"
                  >
                    {task.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crafts Using (items that can be crafted using this item) */}
          {itemData?.craftsUsing && itemData.craftsUsing.length > 0 && (
            <div>
              <h5 className="font-medium text-xs mb-1.5 text-muted-foreground">
                Used to Craft ({itemData.craftsUsing.length})
              </h5>
              <div className="space-y-2">
                {itemData.craftsUsing.map((craft) => (
                  <div
                    key={craft.id}
                    className="text-xs bg-muted/50 rounded px-2 py-1"
                  >
                    <div className="font-medium">
                      {craft.rewardItems
                        .map((reward) => `${reward.count}x ${reward.item.name}`)
                        .join(", ")}
                    </div>
                    <div className="text-muted-foreground text-[10px] mt-0.5">
                      {craft.station.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crafts For (items that can be crafted to get this item) */}
          {itemData?.craftsFor && itemData.craftsFor.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h5 className="font-medium text-xs text-muted-foreground">
                  Can Be Crafted ({itemData.craftsFor.length})
                </h5>
              </div>
              <div className="space-y-2">
                {itemData.craftsFor.map((craft) => (
                  <div
                    key={craft.id}
                    className="text-xs bg-muted/50 rounded px-2 py-1"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-medium">Requires:</div>
                      {onAddCraftRequirementsToWatchlist && (
                        <Tooltip>
                          <TooltipTrigger>
                            <div
                              role="button"
                              className="h-5 w-5 cursor-pointer p-0.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddCraftRequirementsToWatchlist?.(craft);
                              }}
                            >
                              <IconEye className="h-3.5 w-3.5" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-background text-foreground">
                            Add all crafting requirements to watchlist
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {craft.requiredItems.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {req.item.iconLink && (
                            <img
                              src={req.item.iconLink}
                              alt={req.item.name}
                              className="w-4 h-4 object-contain"
                            />
                          )}
                          <span>
                            {req.count}x {req.item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="text-muted-foreground text-[10px] mt-1">
                      {craft.station.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
