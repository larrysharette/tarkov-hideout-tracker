import { NextResponse } from "next/server";

import type {
  GraphQLHideoutResponse,
  GraphQLStation,
} from "@/lib/types/hideout";
import { transformGraphQLData } from "@/lib/utils/hideout-data";

// Revalidate every 24 hours (86400 seconds)
export const revalidate = 86400;

const GRAPHQL_ENDPOINT = "https://api.tarkov.dev/graphql";

const HIDEOUT_QUERY = `
  query {
    hideoutStations {
      id
      name
      imageLink
      levels {
        itemRequirements {
          count
          item {
            name
          }
        }
        level
        traderRequirements {
          level
          trader {
            name
          }
        }
        stationLevelRequirements {
          level
          station {
            name
            id
          }
        }
      }
    }
  }
`;

export async function GET() {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: HIDEOUT_QUERY,
      }),
      // Add cache control
      next: {
        revalidate: revalidate,
      },
    });

    if (!response.ok) {
      throw new Error(`GraphQL API responded with status: ${response.status}`);
    }

    const data: GraphQLHideoutResponse = await response.json();

    // Check for GraphQL errors
    if (data.errors && data.errors.length > 0) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    // Check if data exists
    if (!data.data?.hideoutStations) {
      throw new Error("No hideout data received from API");
    }

    // Transform the data
    const transformedData = transformGraphQLData(
      data as GraphQLHideoutResponse & {
        data: { hideoutStations: GraphQLStation[] };
      }
    );

    // Convert Map to object for JSON serialization
    const serializableData = {
      stations: transformedData.stations,
      stationLevelsMap: Object.fromEntries(transformedData.stationLevelsMap),
    };

    return NextResponse.json(serializableData, {
      status: 200,
      headers: {
        "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate=86400`,
      },
    });
  } catch (error) {
    console.error("Error fetching hideout data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch hideout data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
