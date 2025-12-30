import { NextResponse } from "next/server";

import type {
  GraphQLTrader,
  GraphQLTradersResponse,
  TransformedTradersData,
} from "@/lib/types/hideout";

// Revalidate every 24 hours (86400 seconds)
export const revalidate = 86400;

const GRAPHQL_ENDPOINT = "https://api.tarkov.dev/graphql";

const TRADERS_QUERY = `
  query {
    traders {
      id
      name
      levels {
        level
        id
      }
      imageLink
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
        query: TRADERS_QUERY,
      }),
      next: {
        revalidate: revalidate,
      },
    });

    if (!response.ok) {
      throw new Error(`GraphQL API responded with status: ${response.status}`);
    }

    const data: GraphQLTradersResponse = await response.json();

    // Check for GraphQL errors
    if (data.errors && data.errors.length > 0) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    // Check if data exists
    if (!data.data?.traders) {
      throw new Error("No traders data received from API");
    }

    // Filter to only include specific traders
    const allowedTraders = [
      "Prapor",
      "Therapist",
      "Skier",
      "Peacekeeper",
      "Mechanic",
      "Ragman",
      "Jaeger",
    ];

    // Transform the data
    const transformedData: TransformedTradersData = {
      traders: data.data.traders
        .filter((trader: GraphQLTrader) => allowedTraders.includes(trader.name))
        .map((trader: GraphQLTrader) => {
          // Get imageLink from the first level (or first available level)
          const imageLink = trader.imageLink;

          return {
            id: trader.id,
            name: trader.name,
            maxLevel: Math.max(...trader.levels.map((l) => l.level), 0),
            imageLink,
          };
        }),
    };

    return NextResponse.json(transformedData, {
      status: 200,
      headers: {
        "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate}`,
      },
    });
  } catch (error) {
    console.error("Error fetching traders data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch traders data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
