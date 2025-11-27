# Feature Specifications

## Overview

This document provides detailed specifications for each feature in the MVP. Features are prioritized by implementation order.

---

## Product Context

### Core Value Proposition

Investors need **leading indicators** of neighborhood improvement or decline *before* it shows up in rent changes, vacancy rates, or property values. These leading indicators include:

- Permit activity (especially multifamily, major CapEx)
- New business openings
- The *type* of retail opening (desirable by higher-income earners signals gentrification)

### Two UX Modes

The application serves two distinct user workflows:

| Mode | User Intent | Entry Point | Status |
|------|-------------|-------------|--------|
| **Review** | "Tell me about this specific address" | Address search | MVP |
| **Explore** | "Find promising neighborhoods" | Map browse | Future |

**Review Mode (MVP Focus)**: Most users arrive with a property already selected. The tool serves as a **due diligence / investigation tool**—not primarily a screening tool. Users want to quickly assess: "Is this neighborhood improving or declining?"

**Explore Mode (Future)**: For investors looking for undervalued properties by identifying neighborhoods with growth potential. Signals include: multifamily improvements increasing, new retail that's typically desirable by higher-income earners (specialty coffee, wine bars, boutique fitness, organic grocery).

---

## Feature 1: Address Search & Geocoding

### User Story

> As a real estate investor, I want to enter an NYC address and see it on a map with its census tract highlighted, so I can begin analyzing the neighborhood.

### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1.1 | Text input for address search | Must |
| F1.2 | Autocomplete suggestions as user types | Should |
| F1.3 | Geocode address to lat/lng | Must |
| F1.4 | Identify and highlight census tract containing address | Must |
| F1.5 | Center map on searched address | Must |
| F1.6 | Place marker on subject property | Must |
| F1.7 | Show list of adjacent census tracts | Should |

### UI Components

```
┌─────────────────────────────────────────────────────────┐
│  🔍  Enter an NYC address...                       [x]  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 123 Main Street, Brooklyn, NY                   │   │
│  │ 123 Main Street, Manhattan, NY                  │   │
│  │ 123 Main Avenue, Queens, NY                     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Technical Implementation

1. **Search Input Component**
   - Debounced input (300ms)
   - Mapbox Geocoding API for autocomplete
   - Filter results to NYC bbox

2. **Geocoding Flow**
   ```
   User types → Debounce → Mapbox Geocoding API → Display suggestions
   User selects → Geocode result → Query census tract → Update map
   ```

3. **Census Tract Lookup**
   ```sql
   SELECT geoid, name, ST_AsGeoJSON(geometry) as geometry
   FROM census_tracts
   WHERE ST_Contains(geometry, ST_SetSRID(ST_MakePoint($lng, $lat), 4326));
   ```

### Acceptance Criteria

- [ ] Search bar is prominently displayed on map
- [ ] Autocomplete appears within 500ms of typing pause
- [ ] Selected address places a marker on map
- [ ] Census tract boundary is highlighted
- [ ] Map smoothly animates to center on address

---

## Feature 2: Interactive Map with Heatmap Layer

### User Story

> As a real estate investor, I want to see a heatmap of investment activity across NYC, so I can quickly identify hot neighborhoods.

### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F2.1 | Full-screen Mapbox map | Must |
| F2.2 | Heatmap layer showing permit density | Must |
| F2.3 | Heatmap updates based on time horizon filter | Must |
| F2.4 | Heatmap updates based on permit type filter | Must |
| F2.5 | Smooth transitions when filters change | Should |
| F2.6 | Census tract boundaries visible on hover/zoom | Should |
| F2.7 | Color scale legend | Should |

### Heatmap Configuration

```typescript
const heatmapConfig = {
  // Heatmap intensity based on permit count
  'heatmap-weight': [
    'interpolate',
    ['linear'],
    ['get', 'weight'],
    0, 0,
    10, 1
  ],
  // Color ramp: cool (low) to hot (high)
  'heatmap-color': [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0, 'rgba(0,0,0,0)',
    0.2, '#2c7bb6',
    0.4, '#abd9e9',
    0.6, '#ffffbf',
    0.8, '#fdae61',
    1, '#d7191c'
  ],
  'heatmap-radius': [
    'interpolate',
    ['linear'],
    ['zoom'],
    10, 15,
    15, 30
  ],
  'heatmap-opacity': 0.7
};
```

### Map Interactions

| Interaction | Behavior |
|-------------|----------|
| Pan/Zoom | Standard map navigation |
| Click on heatmap | Shows nearest permit details |
| Click on marker | Opens permit detail drawer |
| Hover on tract | Highlights tract boundary |
| Double-click | Zoom in on location |

### Acceptance Criteria

- [ ] Map loads within 2 seconds
- [ ] Heatmap renders with visible density variation
- [ ] Color scale clearly shows investment intensity
- [ ] Filters update heatmap within 500ms
- [ ] Map remains responsive with 10,000+ points

---

## Feature 3: Permit Type Filters

### User Story

> As a real estate investor, I want to filter the map by specific permit types, so I can focus on the investment signals most relevant to me.

### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F3.1 | Filter panel with permit type checkboxes | Must |
| F3.2 | Categories: Building, Business, Restaurant, Liquor | Must |
| F3.3 | Sub-filters within each category | Should |
| F3.4 | "Select All" / "Clear All" options | Should |
| F3.5 | Filter state persists in URL | Should |
| F3.6 | Show count per filter type | Should |

### Filter Categories

```typescript
const filterCategories = {
  building: {
    label: 'Building Permits',
    icon: '🏗️',
    subfilters: [
      { id: 'multifamily', label: 'Multifamily Housing' },
      { id: 'major-renovation', label: 'Major Renovations (Roof, HVAC)' },
      { id: 'commercial-ti', label: 'Commercial Tenant Improvements' },
      { id: 'new-construction', label: 'New Construction' }
    ]
  },
  business: {
    label: 'Business Licenses',
    icon: '🏪',
    subfilters: [
      { id: 'restaurant', label: 'Restaurants' },
      { id: 'coffee', label: 'Coffee Shops' },
      { id: 'retail', label: 'High-End Retail' },
      { id: 'fitness', label: 'Fitness / Wellness' },
      { id: 'coworking', label: 'Co-Working Spaces' },
      { id: 'grocery', label: 'Grocery Stores' }
    ]
  },
  liquor: {
    label: 'Liquor Licenses',
    icon: '🍷',
    subfilters: [
      { id: 'bar', label: 'Bars' },
      { id: 'wine-bar', label: 'Wine Bars' },
      { id: 'restaurant-liquor', label: 'Restaurant (with liquor)' }
    ]
  }
};
```

### UI Component

```
┌─────────────────────────────────┐
│  FILTERS                   [x]  │
├─────────────────────────────────┤
│  ▼ 🏗️ Building Permits    (234) │
│     ☑ Multifamily Housing  (89) │
│     ☑ Major Renovations    (67) │
│     ☐ Commercial TI        (45) │
│     ☐ New Construction     (33) │
├─────────────────────────────────┤
│  ▼ 🏪 Business Licenses   (156) │
│     ☑ Restaurants          (78) │
│     ☑ Coffee Shops         (23) │
│     ☐ High-End Retail      (31) │
│     ☐ Grocery Stores       (24) │
├─────────────────────────────────┤
│  ▶ 🍷 Liquor Licenses      (89) │
├─────────────────────────────────┤
│  [Select All]  [Clear All]      │
└─────────────────────────────────┘
```

### Acceptance Criteria

- [ ] Filter panel is accessible from map view
- [ ] Checking/unchecking filters updates map immediately
- [ ] Counts accurately reflect current data
- [ ] Filters work in combination (AND logic)
- [ ] Clear All resets to no filters (shows all)

---

## Feature 4: Time Horizon Toggle

### User Story

> As a real estate investor, I want to toggle between different time horizons (6mo, 1yr, 3yr), so I can see both recent activity and longer-term trends.

### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F4.1 | Toggle with 3 options: 6mo, 1yr, 3yr | Must |
| F4.2 | Changing toggle updates map data | Must |
| F4.3 | Changing toggle updates permit list | Must |
| F4.4 | Visual indication of selected time horizon | Must |
| F4.5 | Smooth transition when switching | Should |

### UI Component

```
┌─────────────────────────────────────────┐
│  TIME HORIZON                           │
│  ┌─────────┬─────────┬─────────┐       │
│  │   6mo   │   1yr   │   3yr   │       │
│  │  ████   │         │         │       │
│  └─────────┴─────────┴─────────┘       │
└─────────────────────────────────────────┘
```

### Technical Implementation

```typescript
type TimeHorizon = '6mo' | '1yr' | '3yr';

function getDateCutoff(horizon: TimeHorizon): Date {
  const now = new Date();
  switch (horizon) {
    case '6mo':
      return new Date(now.setMonth(now.getMonth() - 6));
    case '1yr':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case '3yr':
      return new Date(now.setFullYear(now.getFullYear() - 3));
  }
}
```

### Acceptance Criteria

- [ ] Toggle is clearly visible and accessible
- [ ] Selected state is visually distinct
- [ ] Map updates within 500ms of toggle change
- [ ] Permit counts reflect correct time window

---

## Feature 5: Census Tract Expansion

### User Story

> As a real estate investor, I want to expand my view to include adjacent census tracts, so I can understand activity in the broader neighborhood.

### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F5.1 | Show adjacent tracts when subject tract is selected | Must |
| F5.2 | Toggle to include/exclude adjacent tracts in data | Must |
| F5.3 | Visually differentiate subject tract from adjacent | Must |
| F5.4 | Show list of adjacent tracts with basic stats | Should |
| F5.5 | Click adjacent tract to make it the new subject | Should |

### Adjacent Tract Identification

```sql
-- Find tracts that share a boundary with the subject tract
SELECT 
  ct.geoid,
  ct.name,
  ST_AsGeoJSON(ct.geometry) as geometry
FROM census_tracts ct
WHERE ST_Touches(ct.geometry, (
  SELECT geometry FROM census_tracts WHERE geoid = $subjectGeoid
))
AND ct.geoid != $subjectGeoid;
```

### UI Component

```
┌─────────────────────────────────────────┐
│  📍 Census Tract 47.01                  │
│     Brooklyn, Kings County              │
│                                         │
│  ☑ Include adjacent tracts              │
│                                         │
│  Adjacent:                              │
│  • Tract 47.02 (12 permits)            │
│  • Tract 46.00 (8 permits)             │
│  • Tract 48.01 (15 permits)            │
└─────────────────────────────────────────┘
```

### Visual Styling

| Element | Style |
|---------|-------|
| Subject tract | Solid border, filled with accent color at 30% opacity |
| Adjacent tracts | Dashed border, filled with neutral at 15% opacity |
| Hover state | Increase opacity, show tract label |

### Acceptance Criteria

- [ ] Adjacent tracts are correctly identified
- [ ] Toggle smoothly updates map and data
- [ ] Visual distinction is clear and accessible
- [ ] Performance is acceptable with multiple tracts

---

## Feature 6: Permit Markers & Detail Drawer

### User Story

> As a real estate investor, I want to click on individual permits to see details including type, cost, address, and distance from my subject property.

### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F6.1 | Clustered markers for permits at low zoom | Must |
| F6.2 | Individual markers visible at high zoom | Must |
| F6.3 | Click marker to open detail drawer | Must |
| F6.4 | Show permit type, description, cost, date | Must |
| F6.5 | Show distance from subject property | Must |
| F6.6 | Different marker colors by permit category | Should |
| F6.7 | List view of all permits in selected area | Should |

### Marker Clustering

```typescript
const clusterConfig = {
  source: 'permits',
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50,
  clusterProperties: {
    sum: ['+', ['get', 'estimatedCost']]
  }
};
```

### Detail Drawer Content

```
┌─────────────────────────────────────────────────────────┐
│                                                    [x]  │
│  🏗️ BUILDING PERMIT                                    │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  DOB-2024-001234                                        │
│  Alteration Type 1                                      │
│                                                         │
│  📍 456 Oak Avenue, Brooklyn, NY 11201                  │
│     0.3 miles from subject property                     │
│                                                         │
│  📝 Description                                         │
│     Installation of new HVAC system and                 │
│     replacement of roof on 6-story residential          │
│     building (24 units)                                 │
│                                                         │
│  💰 Estimated Cost                                      │
│     $450,000                                            │
│                                                         │
│  📅 Filed: March 15, 2024                               │
│     Issued: April 2, 2024                               │
│                                                         │
│  🏢 Owner                                               │
│     Oak Avenue Properties LLC                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### List View

```
┌─────────────────────────────────────────────────────────┐
│  PERMITS IN AREA (45)                    Sort: Distance │
├─────────────────────────────────────────────────────────┤
│  🏗️ 456 Oak Ave           0.3 mi    $450K    Mar 2024  │
│     HVAC + Roof replacement                             │
├─────────────────────────────────────────────────────────┤
│  🏪 789 Elm St            0.4 mi      -      Jan 2024  │
│     Blue Bottle Coffee (new)                            │
├─────────────────────────────────────────────────────────┤
│  🏗️ 321 Pine Rd           0.5 mi    $1.2M    Feb 2024  │
│     New 12-unit residential building                    │
├─────────────────────────────────────────────────────────┤
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

### Acceptance Criteria

- [ ] Markers cluster smoothly as zoom changes
- [ ] Clicking marker opens drawer with correct data
- [ ] Distance calculation is accurate
- [ ] Drawer can be closed by clicking outside or X
- [ ] List view is sortable and scrollable

---

## Feature 7: Neighborhood Score

### User Story

> As a real estate investor, I want to see a simple score indicating the investment momentum of a census tract, so I can quickly compare areas.

### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F7.1 | Display numeric score (0-100) for selected tract | Must |
| F7.2 | Score based on permit density and business activity | Must |
| F7.3 | Score updates with time horizon changes | Must |
| F7.4 | Brief explanation of what drives the score | Should |
| F7.5 | Comparison to city-wide average | Should |

### Scoring Algorithm (v1)

```typescript
interface TractMetrics {
  permitCount: number;
  permitDensity: number;      // permits per sq km
  totalPermitValue: number;
  businessCount: number;
  highEndBusinessCount: number;
}

function calculateScore(metrics: TractMetrics, cityAvg: TractMetrics): number {
  // Normalize each metric to 0-100 based on city percentiles
  const permitScore = normalize(metrics.permitDensity, cityAvg.permitDensity);
  const valueScore = normalize(metrics.totalPermitValue, cityAvg.totalPermitValue);
  const businessScore = normalize(metrics.highEndBusinessCount, cityAvg.highEndBusinessCount);
  
  // Weighted combination
  const weights = { permit: 0.4, value: 0.3, business: 0.3 };
  
  return Math.round(
    permitScore * weights.permit +
    valueScore * weights.value +
    businessScore * weights.business
  );
}

function normalize(value: number, average: number): number {
  // Simple normalization: score of 50 = average
  // Cap at 100
  return Math.min(100, (value / average) * 50);
}
```

### UI Display

```
┌─────────────────────────────────────────┐
│  NEIGHBORHOOD SCORE                     │
│                                         │
│           ┌─────┐                       │
│           │ 72  │  Above Average        │
│           └─────┘                       │
│                                         │
│  ████████████████████░░░░░░░░ 72/100   │
│                                         │
│  📊 What's driving this score:          │
│     • High permit density (+15)         │
│     • 3 new coffee shops (+8)           │
│     • $2.1M in renovation permits (+12) │
│                                         │
│  vs. NYC Average: 50                    │
└─────────────────────────────────────────┘
```

### Acceptance Criteria

- [ ] Score displays prominently after address search
- [ ] Score recalculates when time horizon changes
- [ ] Score breakdown explains contributing factors
- [ ] Comparison to average provides context

