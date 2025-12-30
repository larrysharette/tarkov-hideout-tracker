import Content from "./content";
import Header from "./header";

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
