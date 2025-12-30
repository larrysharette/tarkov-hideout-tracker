import { type Metadata } from "next";

import Content from "./content";
import Header from "./header";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mapName: string }>;
}): Promise<Metadata> {
  const { mapName } = await params;

  const denormalizedMapName = mapName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `Annotate ${denormalizedMapName}`,
    description: `Add annotations for tasks and items on ${denormalizedMapName}`,
    openGraph: {
      title: `Annotate ${denormalizedMapName} | Adin's Tarkov Tracker`,
      description: `Add annotations for tasks and items on ${denormalizedMapName}`,
    },
    alternates: {
      canonical: `/annotate/${mapName}`,
    },
  };
}

export default async function AnnotateMapPage({
  params,
}: {
  params: Promise<{
    mapName: string;
  }>;
}) {
  const { mapName } = await params;

  return (
    <div className="p-4 md:p-6">
      <div className="space-y-4">
        {/* Header */}
        <Header mapName={mapName} />

        {/* Map Container and Sidebar */}
        <Content mapName={mapName} />
      </div>
    </div>
  );
}
