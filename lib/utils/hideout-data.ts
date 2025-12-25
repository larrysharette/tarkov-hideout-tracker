import type {
  GraphQLHideoutResponse,
  GraphQLStation,
  Station,
  StationLevel,
  TransformedHideoutData,
} from "@/lib/types/hideout";

/**
 * Transform raw GraphQL response into normalized structure
 */
export function transformGraphQLData(
  response: GraphQLHideoutResponse & {
    data: { hideoutStations: GraphQLStation[] };
  }
): TransformedHideoutData {
  const stations: Station[] = [];
  const stationLevelsMap = new Map<string, StationLevel>();

  for (const graphqlStation of response.data.hideoutStations) {
    const station: Station = {
      id: graphqlStation.id,
      name: graphqlStation.name,
      levels: [],
      imageLink: graphqlStation.imageLink,
    };

    for (const graphqlLevel of graphqlStation.levels) {
      const stationLevel: StationLevel = {
        stationId: graphqlStation.id,
        stationName: graphqlStation.name,
        level: graphqlLevel.level,
        itemRequirements: graphqlLevel.itemRequirements.map((req) => ({
          itemName: req.item.name,
          count: req.count,
        })),
        traderRequirements: graphqlLevel.traderRequirements.map((req) => ({
          traderName: req.trader.name,
          level: req.level,
        })),
        stationRequirements: graphqlLevel.stationLevelRequirements.map(
          (req) => ({
            stationId: req.station.id,
            stationName: req.station.name,
            level: req.level,
          })
        ),
      };

      station.levels.push(stationLevel);
      const key = getUpgradeKey(graphqlStation.id, graphqlLevel.level);
      stationLevelsMap.set(key, stationLevel);
    }

    stations.push(station);
  }

  return {
    stations,
    stationLevelsMap,
  };
}

/**
 * Generate unique key for station-level combination
 */
export function getUpgradeKey(stationId: string, level: number): string {
  return `${stationId}-${level}`;
}

/**
 * Parse upgrade key back into stationId and level
 */
export function parseUpgradeKey(key: string): {
  stationId: string;
  level: number;
} {
  const [stationId, levelStr] = key.split("-");
  return {
    stationId,
    level: parseInt(levelStr, 10),
  };
}

/**
 * Extract all unique items from hideout data
 */
export function getAllUniqueItems(data: TransformedHideoutData): Set<string> {
  const items = new Set<string>();

  for (const station of data.stations) {
    for (const level of station.levels) {
      for (const itemReq of level.itemRequirements) {
        items.add(itemReq.itemName);
      }
    }
  }

  return items;
}

/**
 * Get all station levels as a flat array
 */
export function getAllStationLevels(
  data: TransformedHideoutData
): StationLevel[] {
  const levels: StationLevel[] = [];

  for (const station of data.stations) {
    levels.push(...station.levels);
  }

  return levels;
}
