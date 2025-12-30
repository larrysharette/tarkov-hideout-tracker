"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

export default function Header({ mapName }: { mapName: string }) {
  const map = useLiveQuery(
    () => db.maps.where("normalizedName").equals(mapName).first(),
    [mapName]
  );

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/annotate">
          <Button variant="ghost" size="icon">
            <IconArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{map?.name}</h1>
          <p className="text-muted-foreground">
            Add annotations for tasks and items on this map
          </p>
        </div>
      </div>
    </div>
  );
}
