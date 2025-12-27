import { NextResponse } from "next/server";

// Revalidate every 24 hours (86400 seconds)
export const revalidate = 86400;

const GRAPHQL_ENDPOINT = "https://api.tarkov.dev/graphql";

const TASKS_QUERY = `
  query {
    tasks {
      id
      wikiLink
      name
      neededKeys {
        keys {
          id
          imageLink
          name
        }
      }
      kappaRequired
      lightkeeperRequired
      minPlayerLevel
      trader {
        id
        name
        imageLink
      }
      taskRequirements {
        task {
          map {
            id
            name
          }
          name
          id
          minPlayerLevel
        }
      }
      taskImageLink
      map {
        id
        name
      }
      objectives {
        description
        type
      }
    }
  }
`;

export interface TaskKey {
  id: string;
  imageLink: string;
  name: string;
}

export interface TaskMap {
  id: string;
  name: string;
}

export interface TaskTrader {
  id: string;
  name: string;
  imageLink: string;
}

export interface TaskRequirement {
  task: {
    map: TaskMap | null;
    name: string;
    id: string;
    minPlayerLevel: number | null;
  };
}

export interface TaskObjective {
  description: string;
  type: string;
}

export interface Task {
  id: string;
  wikiLink: string;
  name: string;
  neededKeys: {
    keys: TaskKey[];
  };
  kappaRequired: boolean;
  lightkeeperRequired: boolean;
  minPlayerLevel: number | null;
  trader: TaskTrader | null;
  taskRequirements: TaskRequirement[];
  taskImageLink: string | null;
  map: TaskMap | null;
  objectives: TaskObjective[];
}

export interface GraphQLTasksResponse {
  data?: {
    tasks: Task[];
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
        query: TASKS_QUERY,
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
    if (!data.data || !data.data.tasks) {
      throw new Error("No tasks data received from API");
    }

    return NextResponse.json(data.data.tasks, {
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
