# Phase 0-3: Initial Project Setup

**Date:** November 27, 2025  
**Version:** 0.1.0  
**Status:** ✅ Complete

---

## Summary

Implemented the complete project foundation for CapEx Scout, including project scaffolding, database schema, API layer, and frontend UI components. The application is now ready for data ingestion and testing.

---

## What Was Built

### 🏗️ Project Infrastructure

| Component | Technology | Description |
|-----------|------------|-------------|
| Framework | Next.js 16 | App Router with TypeScript |
| Styling | Tailwind CSS 4 | Dark-themed design system |
| State | Zustand + React Query | Client state + server cache |
| Database | PostgreSQL + PostGIS | Geospatial queries |
| ORM | Drizzle | Type-safe database access |
| Maps | Mapbox GL JS 3 | Interactive mapping |

### 📁 Files Created

```
capex-scout/
├── Configuration
│   ├── shell.nix              # Nix dev environment
│   ├── docker-compose.yml     # PostgreSQL/PostGIS container
│   ├── drizzle.config.ts      # ORM configuration
│   ├── tsconfig.json          # TypeScript config (updated)
│   └── package.json           # Dependencies + scripts
│
├── Database Layer
│   ├── src/lib/db/schema.ts   # 5 table definitions
│   ├── src/lib/db/client.ts   # Database connection
│   └── scripts/init-db.sql    # PostGIS initialization
│
├── API Routes
│   ├── src/app/api/search/route.ts        # Address geocoding
│   ├── src/app/api/permits/route.ts       # Permit queries
│   ├── src/app/api/census/[geoid]/route.ts # Census tract data
│   └── src/app/api/heatmap/route.ts       # Heatmap points
│
├── Frontend Components
│   ├── src/app/page.tsx                   # Main map view
│   ├── src/app/layout.tsx                 # Root layout
│   ├── src/app/globals.css                # Design system
│   ├── src/components/Map/Map.tsx         # Mapbox map
│   ├── src/components/Search/SearchBar.tsx # Address search
│   ├── src/components/Filters/FilterPanel.tsx
│   ├── src/components/Filters/TimeToggle.tsx
│   ├── src/components/Drawer/DetailDrawer.tsx
│   └── src/components/Score/ScoreCard.tsx
│
├── State & Utilities
│   ├── src/lib/store.ts       # Zustand store
│   ├── src/lib/queries.ts     # React Query hooks
│   ├── src/lib/providers.tsx  # Provider wrapper
│   ├── src/lib/utils/         # Helper functions
│   ├── src/hooks/useDebounce.ts
│   └── src/types/index.ts     # TypeScript types
│
├── ETL Scripts
│   ├── scripts/etl/dob-permits.ts      # DOB permit ingestion
│   ├── scripts/etl/dca-businesses.ts   # Business licenses
│   ├── scripts/etl/sla-liquor.ts       # Liquor licenses
│   ├── scripts/seed/census-tracts.ts   # Load tract boundaries
│   └── scripts/seed/compute-scores.ts  # Calculate scores
│
└── Documentation
    └── README.md              # Project documentation
```

---

## Database Schema

### Tables Created

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `census_tracts` | NYC tract boundaries | geoid, geometry, land_area_sqm |
| `permits` | DOB building permits | permit_number, permit_type, filing_date, estimated_cost, lat/lng |
| `businesses` | DCA business licenses | license_number, business_type, is_high_end_indicator |
| `liquor_licenses` | SLA liquor licenses | serial_number, license_type, premises_name |
| `tract_scores` | Pre-computed scores | composite_score, permit_density, time_horizon |

### Indexes

- Geospatial indexes on lat/lng columns
- Query indexes on filing_date, census_tract_geoid, permit_type
- Composite index on tract_scores (geoid + time_horizon)

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search?q={address}` | GET | Geocode address, return tract info |
| `/api/permits?tract={geoid}&timeHorizon={6mo\|1yr\|3yr}` | GET | Query permits by tract |
| `/api/census/{geoid}?includeAdjacent={bool}` | GET | Get tract geometry + scores |
| `/api/heatmap?bounds={bbox}&timeHorizon={horizon}` | GET | Get heatmap points for viewport |

---

## UI Components

### Design System

Implemented a dark-themed design system with:

- **Color Palette:** Electric cyan accent (#00d4ff) on dark backgrounds
- **Typography:** DM Sans (body), Space Mono (display), JetBrains Mono (data)
- **Heatmap Scale:** Cold (#2c7bb6) → Hot (#d7191c)
- **Animations:** Slide-in, fade-in, pulse effects

### Components Built

| Component | Features |
|-----------|----------|
| **Map** | Full-screen Mapbox, heatmap layer, tract highlighting, markers |
| **SearchBar** | Debounced input, Mapbox autocomplete, keyboard shortcuts (⌘K) |
| **FilterPanel** | Collapsible categories, checkbox filters, select/clear all |
| **TimeToggle** | 3-way toggle (6mo/1yr/3yr) with active state |
| **DetailDrawer** | Slide-in panel, permit details, distance display |
| **ScoreCard** | Large score number, progress bar, score drivers |

---

## NPM Scripts Added

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio",
  "db:seed": "tsx scripts/seed/census-tracts.ts",
  "etl:permits": "tsx scripts/etl/dob-permits.ts",
  "etl:businesses": "tsx scripts/etl/dca-businesses.ts",
  "etl:liquor": "tsx scripts/etl/sla-liquor.ts",
  "etl:all": "npm run etl:permits && npm run etl:businesses && npm run etl:liquor",
  "score:compute": "tsx scripts/seed/compute-scores.ts"
}
```

---

## Dependencies Installed

### Production
- `@tanstack/react-query` ^5.90.11
- `drizzle-orm` ^0.44.7
- `mapbox-gl` ^3.16.0
- `postgres` ^3.4.7
- `recharts` ^3.5.0
- `zustand` ^5.0.8

### Development
- `drizzle-kit` ^0.31.7
- `tsx` ^4.20.6
- `@types/geojson` ^7946.0.16
- `@types/mapbox-gl` ^3.4.1

---

## What's Next

### Phase 4: Data Visualization
- [ ] Implement heatmap layer with real data
- [ ] Add marker clustering
- [ ] Census tract highlighting on hover

### Phase 5: UI Polish
- [ ] Loading states and skeletons
- [ ] Error boundaries
- [ ] Mobile responsive design

### Phase 6: Data Pipeline
- [ ] Run ETL scripts to load real data
- [ ] Set up census tract assignment (PostGIS)
- [ ] Compute initial neighborhood scores

---

## How to Run

```bash
# Start PostgreSQL
docker-compose up -d

# Create .env.local with your tokens
# DATABASE_URL=postgresql://capex:capex_dev@localhost:5432/capex_scout
# NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx

# Push schema to database
npm run db:push

# Start development server
npm run dev
```

Open http://localhost:3000

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Next.js 16 | App Router | Modern React patterns, built-in API routes |
| Drizzle ORM | Over Prisma | Better TypeScript inference, lighter weight |
| Zustand | Over Redux | Simpler API, less boilerplate |
| Mapbox GL | Over Leaflet | Better heatmap support, vector tiles |
| PostGIS | For spatial queries | Industry standard for geospatial |

---

*This changelog documents the initial implementation of CapEx Scout.*

