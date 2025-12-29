export interface GraphQLItemsResponse {
  data?: {
    items: Array<{
      id: string;
      name: string;
      iconLink: string;
      wikiLink: string;
      usedInTasks: Array<{
        id: string;
        name: string;
      }>;
      craftsFor: Array<{
        id: string;
        station: {
          name: string;
        };
        requiredItems: Array<{
          item: {
            id: string;
            name: string;
            iconLink: string;
          };
          count: number;
        }>;
      }>;
      craftsUsing: Array<{
        id: string;
        station: {
          name: string;
        };
        rewardItems: Array<{
          count: number;
          item: {
            name: string;
            id: string;
          };
        }>;
      }>;
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
  wikiLink: string;
  usedInTasks: Array<{
    id: string;
    name: string;
  }>;
  craftsFor: Array<{
    id: string;
    station: {
      name: string;
    };
    requiredItems: Array<{
      item: {
        id: string;
        name: string;
        iconLink: string;
      };
      count: number;
    }>;
  }>;
  craftsUsing: Array<{
    id: string;
    station: {
      name: string;
    };
    rewardItems: Array<{
      count: number;
      item: {
        name: string;
        id: string;
      };
    }>;
  }>;
}
