# Implementation Roadmap

Step-by-step guide for building CapEx Scout MVP.

---

## Phase 0: Project Setup

### 0.1 Initialize Project

```bash
# Create Next.js project
npx create-next-app@latest capex-scout --typescript --tailwind --app --src-dir

# Install core dependencies
npm install mapbox-gl @types/mapbox-gl recharts zustand @tanstack/react-query drizzle-orm postgres
npm install -D drizzle-kit
```

### 0.2 Create shell.nix

```nix
{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  buildInputs = with pkgs; [ nodejs_20 nodePackages.npm postgresql_15 ];
  shellHook = ''echo "CapEx Scout dev environment ready"'';
}
```

### 0.3 Create docker-compose.yml

```yaml
version: '3.8'
services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_USER: capex
      POSTGRES_PASSWORD: capex_dev
      POSTGRES_DB: capex_scout
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```

### 0.4 Environment Setup

Create `.env.local`:
```
DATABASE_URL=postgresql://capex:capex_dev@localhost:5432/capex_scout
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
NYC_OPEN_DATA_APP_TOKEN=xxx
```

---

## Phase 1: Database & Data Pipeline

### 1.1 Database Schema

Create `src/lib/db/schema.ts` with tables:
- `census_tracts` - NYC tract boundaries with PostGIS geometry
- `permits` - DOB building permits
- `businesses` - DCA business licenses
- `liquor_licenses` - SLA liquor licenses
- `tract_scores` - Pre-computed neighborhood scores

### 1.2 Load Census Tracts

Script: `scripts/seed/census-tracts.ts`
1. Download NYC census tract shapefile from Census TIGER
2. Filter to NYC counties (36005, 36047, 36061, 36081, 36085)
3. Convert to GeoJSON
4. Insert into PostGIS

### 1.3 DOB Permits ETL

Script: `scripts/etl/dob-permits.ts`
1. Fetch from Socrata API: `https://data.cityofnewyork.us/resource/ipu4-2vj7.json`
2. Filter last 3 years
3. Transform and classify permit types
4. Geocode missing coordinates (Mapbox)
5. Assign census tract via PostGIS ST_Contains
6. Upsert to database

### 1.4 Business Licenses ETL

Script: `scripts/etl/dca-businesses.ts`
1. Fetch from: `https://data.cityofnewyork.us/resource/w7w3-xahh.json`
2. Classify business types (flag high-end indicators)
3. Geocode and assign tracts
4. Upsert to database

### 1.5 Liquor Licenses ETL

Script: `scripts/etl/sla-liquor.ts`
1. Fetch from: `https://data.ny.gov/resource/hrvs-fxs2.json`
2. Filter to NYC counties
3. Geocode and assign tracts
4. Upsert to database

### 1.6 Compute Tract Scores

Script: `scripts/seed/compute-scores.ts`
1. For each tract and time horizon (6mo, 1yr, 3yr):
   - Count permits
   - Sum permit values
   - Count businesses (flag high-end)
   - Calculate density (permits/sq km)
   - Compute composite score
2. Store in `tract_scores` table

---

## Phase 2: API Layer

### 2.1 Address Search Endpoint

`src/app/api/search/route.ts`

```typescript
// GET /api/search?q={address}
// 1. Call Mapbox Geocoding API
// 2. Find containing census tract
// 3. Return address, coords, tract info, adjacent tracts
```

### 2.2 Permits Query Endpoint

`src/app/api/permits/route.ts`

```typescript
// GET /api/permits?tract={geoid}&timeHorizon={6mo|1yr|3yr}&types={types}
// 1. Query permits by tract(s) and date range
// 2. Filter by permit types if specified
// 3. Calculate distance from subject (if provided)
// 4. Return permits with counts by type
```

### 2.3 Census Tract Endpoint

`src/app/api/census/[geoid]/route.ts`

```typescript
// GET /api/census/{geoid}?includeAdjacent=true
// 1. Fetch tract geometry and scores
// 2. Optionally include adjacent tracts
// 3. Return GeoJSON with scores
```

### 2.4 Heatmap Data Endpoint

`src/app/api/heatmap/route.ts`

```typescript
// GET /api/heatmap?bounds={bbox}&timeHorizon={horizon}
// 1. Query permits within viewport bounds
// 2. Return lightweight points for heatmap rendering
```

---

## Phase 3: Frontend - Map Foundation

### 3.1 Map Component

`src/components/Map/Map.tsx`
- Initialize Mapbox GL
- Apply dark custom style
- Handle viewport state
- Expose map instance to parent

### 3.2 Search Bar Component

`src/components/Search/SearchBar.tsx`
- Text input with debounced query
- Mapbox Geocoding autocomplete
- Filter to NYC bounding box
- On select: emit address data

### 3.3 Map Integration

`src/app/page.tsx`
- Full-screen map layout
- Floating search bar (top center)
- Connect search to map centering

---

## Phase 4: Frontend - Data Visualization

### 4.1 Heatmap Layer

`src/components/Map/HeatmapLayer.tsx`
- Fetch heatmap data for viewport
- Add Mapbox heatmap layer
- Configure color ramp (cool→hot)
- Update on filter/time changes

### 4.2 Census Tract Layer

`src/components/Map/TractLayer.tsx`
- Render subject tract (solid border, accent fill)
- Render adjacent tracts (dashed, muted)
- Handle tract selection

### 4.3 Permit Markers Layer

`src/components/Map/MarkersLayer.tsx`
- Clustered markers at low zoom
- Individual markers at high zoom
- Color-coded by permit category
- Click handler to open drawer

---

## Phase 5: Frontend - Panels & Filters

### 5.1 Filter Panel

`src/components/Filters/FilterPanel.tsx`
- Collapsible categories (Building, Business, Liquor)
- Checkbox sub-filters with counts
- Select All / Clear All
- Emit filter state changes

### 5.2 Time Horizon Toggle

`src/components/Filters/TimeToggle.tsx`
- 3-way toggle (6mo, 1yr, 3yr)
- Visual active state
- Emit horizon changes

### 5.3 Detail Drawer

`src/components/Drawer/DetailDrawer.tsx`
- Slide-in panel from right
- Display permit/business details
- Show distance from subject
- Close on outside click or X

### 5.4 Score Display

`src/components/Score/ScoreCard.tsx`
- Large score number
- Progress bar visualization
- Score breakdown factors
- Comparison to city average

---

## Phase 6: State & Data Flow

### 6.1 Global State (Zustand)

`src/lib/store.ts`

```typescript
interface AppState {
  // Subject property
  subjectAddress: Address | null;
  subjectTract: CensusTract | null;
  
  // Filters
  activeFilters: FilterState;
  timeHorizon: '6mo' | '1yr' | '3yr';
  includeAdjacentTracts: boolean;
  
  // UI
  drawerOpen: boolean;
  selectedPermit: Permit | null;
}
```

### 6.2 Data Fetching (React Query)

`src/lib/queries.ts`
- `useSearchAddress(query)`
- `usePermits(tractIds, timeHorizon, filters)`
- `useTractData(geoid, includeAdjacent)`
- `useHeatmapData(bounds, timeHorizon)`

---

## Phase 7: Polish & Deploy

### 7.1 Loading States
- Skeleton loaders for panels
- Map loading indicator
- Smooth transitions

### 7.2 Error Handling
- API error boundaries
- Empty states
- Retry logic

### 7.3 Responsive Design
- Mobile bottom sheets
- Tablet adaptations
- Touch-friendly controls

### 7.4 Deploy to Vercel
- Connect GitHub repo
- Set environment variables
- Configure Supabase connection
- Enable preview deployments

---

## Future: Phase 8 - Explore Mode

The MVP focuses on **Review Mode** (investigate a specific address). Future work would add **Explore Mode** for discovering promising neighborhoods.

### 8.1 City-Wide Browse Entry Point
- Alternative landing state: start on zoomed-out city view
- Prominent heatmap showing investment activity hotspots
- "Browse neighborhoods" vs "Search address" toggle

### 8.2 Neighborhood Ranking
- List view of top-scoring tracts
- Sort by: composite score, permit velocity, business openings
- Filter by borough

### 8.3 Trend Detection
- Track permit velocity changes over time (accelerating vs steady)
- "Up and coming" neighborhoods: high velocity + moderate current activity
- Visual indicators for trend direction

### 8.4 Desirable Retail Weighting
- Weight business types by "gentrification signal" strength:
  - High: specialty coffee, wine bars, boutique fitness, organic grocery
  - Medium: restaurants, co-working spaces
  - Lower: general retail
- Adjust neighborhood scores accordingly

### 8.5 Mode Transition
- Click neighborhood in Explore → enter Review mode for that area
- Seamless data continuity between modes

---

## Execution Order Summary

| Step | Task | Dependencies |
|------|------|--------------|
| 0.1-0.4 | Project setup | None |
| 1.1 | Database schema | 0.x |
| 1.2 | Load census tracts | 1.1 |
| 1.3-1.5 | ETL scripts | 1.1, 1.2 |
| 1.6 | Compute scores | 1.3-1.5 |
| 2.1-2.4 | API endpoints | 1.x |
| 3.1-3.3 | Map foundation | 0.x |
| 4.1-4.3 | Data visualization | 2.x, 3.x |
| 5.1-5.4 | UI panels | 3.x |
| 6.1-6.2 | State management | 4.x, 5.x |
| 7.1-7.4 | Polish & deploy | All |

---

## Key Files Checklist

```
capex-scout/
├── shell.nix                           [Phase 0]
├── docker-compose.yml                  [Phase 0]
├── .env.local                          [Phase 0]
├── src/
│   ├── app/
│   │   ├── page.tsx                    [Phase 3]
│   │   ├── layout.tsx                  [Phase 3]
│   │   └── api/
│   │       ├── search/route.ts         [Phase 2]
│   │       ├── permits/route.ts        [Phase 2]
│   │       ├── census/[geoid]/route.ts [Phase 2]
│   │       └── heatmap/route.ts        [Phase 2]
│   ├── components/
│   │   ├── Map/
│   │   │   ├── Map.tsx                 [Phase 3]
│   │   │   ├── HeatmapLayer.tsx        [Phase 4]
│   │   │   ├── TractLayer.tsx          [Phase 4]
│   │   │   └── MarkersLayer.tsx        [Phase 4]
│   │   ├── Search/
│   │   │   └── SearchBar.tsx           [Phase 3]
│   │   ├── Filters/
│   │   │   ├── FilterPanel.tsx         [Phase 5]
│   │   │   └── TimeToggle.tsx          [Phase 5]
│   │   ├── Drawer/
│   │   │   └── DetailDrawer.tsx        [Phase 5]
│   │   └── Score/
│   │       └── ScoreCard.tsx           [Phase 5]
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts               [Phase 1]
│   │   │   └── client.ts               [Phase 1]
│   │   ├── store.ts                    [Phase 6]
│   │   └── queries.ts                  [Phase 6]
│   └── types/
│       └── index.ts                    [Phase 1]
└── scripts/
    ├── etl/
    │   ├── dob-permits.ts              [Phase 1]
    │   ├── dca-businesses.ts           [Phase 1]
    │   └── sla-liquor.ts               [Phase 1]
    └── seed/
        ├── census-tracts.ts            [Phase 1]
        └── compute-scores.ts           [Phase 1]
```

