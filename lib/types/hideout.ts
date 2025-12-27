// Raw GraphQL Response Types
export interface GraphQLHideoutResponse {
  data?: {
    hideoutStations: GraphQLStation[];
  };
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
}

export interface GraphQLStation {
  id: string;
  name: string;
  levels: GraphQLStationLevel[];
  imageLink: string;
}

export interface GraphQLStationLevel {
  level: number;
  itemRequirements: GraphQLItemRequirement[];
  traderRequirements: GraphQLTraderRequirement[];
  stationLevelRequirements: GraphQLStationLevelRequirement[];
}

export interface GraphQLItemRequirement {
  count: number;
  item: {
    name: string;
  };
}

export interface GraphQLTraderRequirement {
  level: number;
  trader: {
    name: string;
  };
}

export interface GraphQLStationLevelRequirement {
  level: number;
  station: {
    name: string;
    id: string;
  };
}

// Trader GraphQL Types
export interface GraphQLTradersResponse {
  data?: {
    traders: GraphQLTrader[];
  };
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
}

export interface GraphQLTrader {
  id: string;
  name: string;
  imageLink: string;
  levels: GraphQLTraderLevel[];
}

export interface GraphQLTraderLevel {
  level: number;
  id: string;
}

// Transformed Data Types
export interface Station {
  id: string;
  name: string;
  levels: StationLevel[];
  imageLink: string;
}

export interface StationLevel {
  stationId: string;
  stationName: string;
  level: number;
  itemRequirements: ItemRequirement[];
  traderRequirements: TraderRequirement[];
  stationRequirements: StationRequirement[];
}

export interface ItemRequirement {
  itemName: string;
  count: number;
}

export interface TraderRequirement {
  traderName: string;
  level: number;
}

export interface StationRequirement {
  stationId: string;
  stationName: string;
  level: number;
}

export interface Trader {
  id: string;
  name: string;
  maxLevel: number;
  imageLink: string;
}

export interface TransformedHideoutData {
  stations: Station[];
  stationLevelsMap: Map<string, StationLevel>; // Key: "stationId-level"
}

export interface TransformedTradersData {
  traders: Trader[];
}

// User State Types
export interface UserHideoutState {
  stationLevels: Record<string, number>; // stationId -> current level (using Record for JSON serialization)
  inventory: Record<string, number>; // itemName -> quantity owned
  focusedUpgrades: string[]; // Array of "stationId-level" keys (using array for JSON serialization)
  traderLevels?: Record<string, number>; // traderName -> level (optional for now)
  completedQuests?: string[]; // Array of quest IDs that are completed
  watchlist?: Record<string, number>; // itemName -> quantity needed (optional for backward compatibility)
  playerLevel?: number; // Player's current level (optional for backward compatibility)
}

export interface ItemSummary {
  itemName: string;
  requiredNow: number; // For focused upgrades
  willNeed: number; // For future upgrades
  totalRequired: number; // All upgrades
  owned: number;
  remaining: number; // calculated: max(0, requiredNow - owned)
}

// UI State Types
export interface FilterState {
  showAvailableOnly: boolean;
  searchQuery: string;
}

// Context Types
export interface HideoutContextValue {
  // Data
  hideoutData: TransformedHideoutData | null;
  tradersData: TransformedTradersData | null;
  isLoading: boolean;
  error: string | null;

  // User State
  userState: UserHideoutState;

  // Actions
  setStationLevel: (stationId: string, level: number) => void;
  setInventoryQuantity: (itemName: string, quantity: number) => void;
  toggleFocusedUpgrade: (stationId: string, level: number) => void;
  clearFocusedUpgrades: () => void;
  resetInventory: () => void;
  resetHideoutLevels: () => void;
  setTraderLevel: (traderName: string, level: number) => void;
  setPlayerLevel: (level: number) => void;
  purchaseUpgrade: (upgrade: StationLevel) => void;
  toggleQuestCompletion: (questId: string) => void;
  markQuestsAsCompleted: (questIds: string[]) => void;
  addToWatchlist: (itemName: string, quantity: number) => void;
  setWatchlistQuantity: (itemName: string, quantity: number) => void;
  removeFromWatchlist: (itemName: string) => void;
  isInWatchlist: (itemName: string) => boolean;

  // Computed
  getItemSummary: () => ItemSummary[];
  getAvailableUpgrades: () => StationLevel[];
  getFocusedUpgrades: () => StationLevel[];
}
