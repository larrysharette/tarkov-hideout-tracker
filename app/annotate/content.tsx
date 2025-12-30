"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db, type MapRecord } from "@/lib/db";

export default function AnnotateContent() {
  const allMaps = useLiveQuery(() => db.maps.toArray(), [], [] as MapRecord[]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {allMaps
        .filter(
          (m) =>
            !m.name.includes("21") &&
            !m.name.includes("Night Factory") &&
            !m.name.includes("Tutorial")
        )
        .map((map) => (
          <Card key={map.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-stone-900/50">
                <Image
                  src={map.imageLink}
                  alt={map.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-3">{map.name}</h3>
                <Link href={`/annotate/${map.normalizedName}`}>
                  <Button className="w-full" variant="default">
                    Annotate
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
