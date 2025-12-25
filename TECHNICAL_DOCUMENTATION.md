# Tarkov Hideout Tracker - Technical Documentation

## Overview

This document outlines the technical implementation plan for the Escape from Tarkov Hideout Item Tracker. The application will help players track hideout upgrade requirements, manage inventory, and plan their upgrade path.

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: @tabler/icons-react
- **Data Fetching**: Next.js Route Handlers with GraphQL

## Architecture Overview

### Data Flow

```
GraphQL API → Route Handler (cached) → Data Transformation → Client Components → State Management → UI
```

## Phase 1: Data Fetching & Transformation

### 1.1 GraphQL API Route Handler

**File**: `app/api/hideout/route.ts`

**Responsibilities**:
- Fetch data from `https://api.tarkov.dev/graphql`
- Cache response with 24-hour revalidation
- Transform raw GraphQL response into normalized structure

**Implementation Details**:
- Use Next.js `revalidate` option set to 86400 seconds (24 hours)
- Handle GraphQL query execution
- Error handling and retry logic
- Type-safe response handling

**GraphQL Query**:
```graphql
{
  hideoutStations {
    id
    name
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
```

### 1.2 Data Transformation

**Transformed Data Structure**:

```typescript
// Normalized structure for easier querying
interface TransformedHideoutData {
  stations: Station[];
  items: Map<string, ItemRequirement>; // Key: item name
  stationLevels: Map<string, StationLevel>; // Key: stationId-level
}

interface Station {
  id: string;
  name: string;
  levels: StationLevel[];
}

interface StationLevel {
  stationId: string;
  stationName: string;
  level: number;
  itemRequirements: ItemRequirement[];
  traderRequirements: TraderRequirement[];
  stationRequirements: StationRequirement[];
}

interface ItemRequirement {
  itemName: string;
  count: number;
}

interface TraderRequirement {
  traderName: string;
  level: number;
}

interface StationRequirement {
  stationId: string;
  stationName: string;
  level: number;
}
```

**Transformation Goals**:
- Flatten nested structures for easier access
- Create lookup maps for O(1) item queries
- Normalize station level references
- Enable efficient filtering and aggregation

## Phase 2: Type Definitions

### 2.1 Core Types

**File**: `lib/types/hideout.ts`

**Type Definitions**:
- Raw GraphQL response types
- Transformed data types
- User state types (inventory, hideout levels, focus selections)
- UI state types (filters, selections)

### 2.2 User State Types

```typescript
interface UserHideoutState {
  stationLevels: Map<string, number>; // stationId -> current level
  inventory: Map<string, number>; // itemName -> quantity owned
  focusedUpgrades: Set<string>; // stationId-level combinations
}

interface ItemSummary {
  itemName: string;
  requiredNow: number; // For focused upgrades
  willNeed: number; // For future upgrades
  totalRequired: number; // All upgrades
  owned: number;
  remaining: number; // calculated: requiredNow - owned
}
```

## Phase 3: State Management

### 3.1 Storage Strategy

**Approach**: Use React Context + LocalStorage for persistence

**File**: `contexts/HideoutContext.tsx`

**State Structure**:
- Hideout data (from API)
- User hideout levels
- User inventory
- Focused upgrades
- Filter state

**Persistence**:
- Save user state to localStorage on changes
- Load from localStorage on mount
- Sync with server data

### 3.2 State Actions

```typescript
interface HideoutActions {
  setStationLevel(stationId: string, level: number): void;
  setInventoryQuantity(itemName: string, quantity: number): void;
  toggleFocusedUpgrade(stationId: string, level: number): void;
  clearFocusedUpgrades(): void;
  resetInventory(): void;
  resetHideoutLevels(): void;
}
```

## Phase 4: Core Features Implementation

### 4.1 Feature: Hideout Level Selection

**Component**: `components/hideout/StationLevelSelector.tsx`

**Functionality**:
- Display all stations with level selectors
- Allow user to set current level for each station
- Visual indication of max level per station
- Persist selections

**UI Elements**:
- Dropdown/Select for each station
- Group stations by category (if applicable)
- Show station requirements visually

### 4.2 Feature: Inventory Management

**Component**: `components/hideout/InventoryInput.tsx`

**Functionality**:
- Input field for each unique item
- Real-time quantity updates
- Bulk import/export (future enhancement)
- Validation (non-negative numbers)

**UI Elements**:
- Table with item name and quantity input
- Search/filter for items
- Quick actions (clear all, set all to zero)

### 4.3 Feature: Item Summary Table

**Component**: `components/hideout/ItemSummaryTable.tsx`

**Functionality**:
- Display aggregated item requirements
- Show "Required Now" vs "Will Need"
- Calculate remaining items needed
- Sortable columns
- Filterable by item name

**Columns**:
- Item Name
- Required Now (for focused upgrades)
- Will Need (for future upgrades)
- Total Required
- Owned
- Remaining (Required Now - Owned)

**Calculations**:
- **Required Now**: Sum of item requirements for focused upgrades
- **Will Need**: Sum of item requirements for non-focused upgrades user can access
- **Remaining**: Required Now - Owned (clamped to 0 minimum)

### 4.4 Feature: Upgrade Focus Management

**Component**: `components/hideout/UpgradeFocusManager.tsx`

**Functionality**:
- List all available upgrades
- Toggle focus on specific upgrades
- Visual indication of focused vs unfocused
- Bulk select/deselect

**UI Elements**:
- Checkbox list of upgrades
- Group by station
- Show upgrade requirements inline
- Filter by availability

### 4.5 Feature: Upgrade Filtering

**Component**: `components/hideout/UpgradeFilter.tsx`

**Functionality**:
- Filter upgrades by availability
- Show only upgrades user can currently build
- Consider:
  - Station level requirements
  - Trader loyalty level requirements
- Toggle between "Available" and "All"

**Filter Logic**:
```typescript
function isUpgradeAvailable(
  upgrade: StationLevel,
  userState: UserHideoutState
): boolean {
  // Check station requirements
  for (const req of upgrade.stationRequirements) {
    const userLevel = userState.stationLevels.get(req.stationId) || 0;
    if (userLevel < req.level) return false;
  }
  
  // Check trader requirements (if we have trader data)
  // Note: Trader requirements need user trader levels - may need separate state
  
  return true;
}
```

**Note**: Trader loyalty levels may need to be added to user state if not available from API.

## Phase 5: Component Architecture

### 5.1 Main Page Layout

**File**: `app/page.tsx`

**Structure**:
```
<HideoutProvider>
  <div className="container">
    <Header />
    <StationLevelSelector />
    <UpgradeFocusManager />
    <UpgradeFilter />
    <InventoryInput />
    <ItemSummaryTable />
  </div>
</HideoutProvider>
```

### 5.2 Component Hierarchy

```
HideoutTracker (page)
├── HideoutProvider (context)
│   ├── StationLevelSelector
│   ├── UpgradeFocusManager
│   │   └── UpgradeCard (for each upgrade)
│   ├── UpgradeFilter
│   ├── InventoryInput
│   │   └── ItemInputRow (for each item)
│   └── ItemSummaryTable
│       └── ItemSummaryRow (for each item)
```

## Phase 6: Utility Functions

### 6.1 Calculation Utilities

**File**: `lib/utils/hideout-calculations.ts`

**Functions**:
- `calculateItemRequirements()`: Aggregate item requirements
- `calculateRemainingItems()`: Calculate what's left to gather
- `getAvailableUpgrades()`: Filter upgrades by requirements
- `getFocusedUpgrades()`: Get upgrades user is focusing on
- `aggregateItemCounts()`: Sum item counts across upgrades

### 6.2 Data Utilities

**File**: `lib/utils/hideout-data.ts`

**Functions**:
- `transformGraphQLData()`: Transform API response
- `normalizeStationLevels()`: Create lookup maps
- `getAllUniqueItems()`: Extract unique items from data
- `getUpgradeKey()`: Generate unique key for station-level combo

## Phase 7: Implementation Phases

### Phase 7.1: Foundation (Week 1)
1. ✅ Set up GraphQL route handler with caching
2. ✅ Implement data transformation
3. ✅ Create type definitions
4. ✅ Set up React Context for state management
5. ✅ Implement localStorage persistence

### Phase 7.2: Core UI (Week 2)
1. ✅ Build StationLevelSelector component
2. ✅ Build InventoryInput component
3. ✅ Build basic ItemSummaryTable
4. ✅ Wire up state management

### Phase 7.3: Advanced Features (Week 3)
1. ✅ Implement UpgradeFocusManager
2. ✅ Add "Required Now" vs "Will Need" calculations
3. ✅ Implement UpgradeFilter
4. ✅ Add availability checking logic

### Phase 7.4: Polish & Enhancement (Week 4)
1. ✅ Add search/filter to tables
2. ✅ Improve visual design
3. ✅ Add loading states
4. ✅ Error handling
5. ✅ Responsive design
6. ✅ Performance optimization

## Phase 8: Data Flow Example

### Example: User Sets Station Level

1. User selects level 2 for "Workbench" station
2. `StationLevelSelector` calls `setStationLevel("workbench-id", 2)`
3. Context updates state: `stationLevels.set("workbench-id", 2)`
4. State saved to localStorage
5. `ItemSummaryTable` recalculates:
   - Checks which upgrades are now available
   - Updates "Will Need" column
   - Recalculates remaining items
6. UI re-renders with updated data

### Example: User Focuses Upgrade

1. User checks "Workbench Level 3" in UpgradeFocusManager
2. Context adds "workbench-id-3" to `focusedUpgrades` Set
3. `ItemSummaryTable` recalculates:
   - Sums item requirements for focused upgrades → "Required Now"
   - Sums item requirements for non-focused → "Will Need"
   - Calculates remaining = Required Now - Owned
4. UI updates to show focused vs future needs

## Phase 9: Edge Cases & Considerations

### 9.1 Data Consistency
- Handle API data changes gracefully
- Version user state if data structure changes
- Provide migration path for stored data

### 9.2 Performance
- Memoize expensive calculations
- Virtualize long lists if needed
- Debounce input changes
- Optimize re-renders with React.memo

### 9.3 User Experience
- Loading states during data fetch
- Error states for API failures
- Empty states for no data
- Confirmation dialogs for destructive actions
- Undo/redo functionality (future)

### 9.4 Missing Data
- Handle missing trader levels (may need user input)
- Handle items without names
- Handle stations without levels
- Graceful degradation

## Phase 10: Testing Strategy

### 10.1 Unit Tests
- Calculation utilities
- Data transformation functions
- Filter logic

### 10.2 Integration Tests
- State management flow
- Component interactions
- Data persistence

### 10.3 E2E Tests (Future)
- Complete user workflows
- Data persistence across sessions

## Phase 11: Future Enhancements

1. **Trader Level Tracking**: Add UI for tracking trader loyalty levels
2. **Multiple Profiles**: Support multiple character profiles
3. **Export/Import**: Export state as JSON, import from file
4. **Progress Tracking**: Track completion percentage
5. **Item Images**: Display item images from API
6. **Search**: Advanced search across all data
7. **Sorting**: Multiple sort options for tables
8. **Dark Mode**: Theme support
9. **Mobile App**: React Native version
10. **Sharing**: Share hideout state with friends

## Phase 12: File Structure

```
app/
├── api/
│   └── hideout/
│       └── route.ts              # GraphQL API handler
├── page.tsx                       # Main page
└── layout.tsx

components/
├── hideout/
│   ├── StationLevelSelector.tsx
│   ├── UpgradeFocusManager.tsx
│   ├── UpgradeCard.tsx
│   ├── UpgradeFilter.tsx
│   ├── InventoryInput.tsx
│   ├── ItemInputRow.tsx
│   ├── ItemSummaryTable.tsx
│   └── ItemSummaryRow.tsx
└── ui/                            # Existing shadcn components

contexts/
└── HideoutContext.tsx             # State management

lib/
├── types/
│   └── hideout.ts                 # Type definitions
└── utils/
    ├── hideout-calculations.ts    # Calculation utilities
    └── hideout-data.ts            # Data transformation utilities
```

## Phase 13: API Integration Details

### 13.1 GraphQL Client Setup

**Considerations**:
- No authentication required (public API)
- Handle CORS if needed
- Rate limiting awareness
- Error handling for network failures

### 13.2 Caching Strategy

**Next.js Route Handler**:
```typescript
export const revalidate = 86400; // 24 hours
```

**Benefits**:
- Reduces API calls
- Faster page loads
- Cost reduction
- Handles API downtime gracefully

### 13.3 Error Handling

**Scenarios**:
- Network failure → Show error message, use cached data if available
- API changes → Version check, migration
- Invalid data → Validation, fallback values
- Timeout → Retry logic

## Conclusion

This document provides a comprehensive roadmap for implementing the Tarkov Hideout Tracker. The implementation should follow the phases sequentially, with each phase building upon the previous one. Regular testing and user feedback should guide refinements throughout development.

