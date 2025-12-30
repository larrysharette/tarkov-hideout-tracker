import { NextResponse } from "next/server";

import { type Map } from "@/lib/types/maps";

// Revalidate every 24 hours (86400 seconds)
export const revalidate = 86400;

const GRAPHQL_ENDPOINT = "https://api.tarkov.dev/graphql";

const MAPS_QUERY = `
  query {
    maps {
      id
      name
      wiki
      normalizedName
    }
  }
`;

export interface GraphQLTasksResponse {
  data?: {
    maps: Map[];
  };
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
}

export async function GET() {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: MAPS_QUERY,
      }),
      next: {
        revalidate: revalidate,
      },
    });

    if (!response.ok) {
      throw new Error(`GraphQL API responded with status: ${response.status}`);
    }

    const data: GraphQLTasksResponse = await response.json();

    // Check for GraphQL errors
    if (data.errors && data.errors.length > 0) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    // Check if data exists
    if (!data.data?.maps) {
      throw new Error("No tasks data received from API");
    }

    return NextResponse.json(data.data.maps, {
      status: 200,
      headers: {
        "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate=86400`,
      },
    });
  } catch (error) {
    console.error("Error fetching tasks data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch tasks data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
