import { NextResponse } from "next/server";

// Revalidate every 24 hours (86400 seconds)
export const revalidate = 86400;

const GRAPHQL_ENDPOINT = "https://api.tarkov.dev/graphql";

const ITEMS_QUERY = `
  query {
    items(types: [barter, meds], limit: 1000) {
      id
      name
      iconLink
    }
  }
`;

export interface GraphQLItemsResponse {
  data?: {
    items: Array<{
      id: string;
      name: string;
      iconLink: string;
    }>;
  };
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
}

export interface Item {
  id: string;
  name: string;
  iconLink: string;
}

export async function GET() {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: ITEMS_QUERY,
      }),
      next: {
        revalidate: revalidate,
      },
    });

    if (!response.ok) {
      throw new Error(`GraphQL API responded with status: ${response.status}`);
    }

    const data: GraphQLItemsResponse = await response.json();

    // Check for GraphQL errors
    if (data.errors && data.errors.length > 0) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    // Check if data exists
    if (!data.data || !data.data.items) {
      throw new Error("No items data received from API");
    }

    return NextResponse.json(
      data.data.items.reduce((acc, item) => {
        if (item.name.includes("Dogtag")) {
          return acc;
        }
        if (acc.find((i) => i.id === item.id)) {
          return acc;
        }
        acc.push(item);
        return acc;
      }, [] as Item[]),
      {
        status: 200,
        headers: {
          "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate=86400`,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching items data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch items data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
