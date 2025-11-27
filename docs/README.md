# CapEx Scout

**Neighborhood Investment Intelligence for Real Estate Investors**

A web application that helps real estate investors identify and track capital expenditure trends in NYC neighborhoods by aggregating permit data, business openings, and construction activity to visualize "neighborhood momentum."

---

## Quick Links

| Document | Description |
|----------|-------------|
| [Architecture](./ARCHITECTURE.md) | Technical stack, system design, infrastructure |
| [Data Sources](./DATA_SOURCES.md) | NYC open data APIs, ETL strategy |
| [Features](./FEATURES.md) | Detailed feature specifications |
| [Design System](./DESIGN_SYSTEM.md) | Visual design, components, UX patterns |
| [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md) | Step-by-step build guide |
| [Changelog](./changelog/) | Development history and release notes |

---

## Project Overview

### Problem Statement

Real estate investors evaluating multifamily or commercial properties need to understand if a neighborhood is "glowing up" — experiencing increased investment that signals rising property values and rents. Currently, this requires manual research across multiple data sources.

### Solution

CapEx Scout aggregates public permit and business license data to visualize investment activity around any NYC address, helping investors identify neighborhoods with momentum.

### Primary User Workflow

> "I have an address. Tell me about it."

1. User enters a NYC address
2. System shows the address on a map with surrounding census tract(s)
3. Heat map overlay displays capex density
4. User can filter by permit type (building, business, etc.)
5. User can expand to adjoining census tracts
6. Clickable markers show individual permit details
7. User can toggle time horizon (6mo, 1yr, 3yr)

---

## MVP Scope

### In Scope (Phase 1)

- ✅ NYC only (single metro)
- ✅ Address search with census tract visualization
- ✅ Heat map overlay with capex density
- ✅ Filterable by permit/business type
- ✅ Expand to adjoining census tracts
- ✅ Clickable markers for individual permits
- ✅ Distance from subject property to each permit
- ✅ Time horizon toggle (6mo, 1yr, 3yr)
- ✅ Simple scoring (permit count/area)

### Out of Scope (Future Phases)

- ❌ Multi-city support
- ❌ User accounts & authentication
- ❌ Saved searches & alerts
- ❌ Advanced trend analysis charts
- ❌ ML-based scoring
- ❌ Mobile app

---

## Investment Signals Tracked

### Building & Construction

| Signal | Data Source | Priority |
|--------|-------------|----------|
| Multifamily housing starts | DOB Permits | High |
| Major renovations (roof, HVAC) | DOB Permits | High |
| Commercial tenant improvements | DOB Permits | High |
| Certificate of Occupancy | DOB | Medium |

### Business Activity

| Signal | Data Source | Priority |
|--------|-------------|----------|
| Restaurant openings | Business Licenses | High |
| High-end retail | Business Licenses | High |
| Coffee shops | Business Licenses | High |
| Co-working spaces | Business Licenses | High |
| Grocery stores (especially upscale) | Business Licenses | High |
| Liquor licenses | SLA | Medium |

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, TypeScript |
| Mapping | Mapbox GL JS |
| Charts | Recharts |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes (Node.js) |
| Database | PostgreSQL with PostGIS (Supabase) |
| Local Dev | Nix (dependencies), Docker Compose (services) |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Nix (for local dependency management)
- Docker & Docker Compose
- Mapbox API key
- Supabase project (or local Postgres)

### Local Development Setup

```bash
# Clone the repo
git clone <repo-url>
cd capex-scout

# Enter Nix shell (installs all dependencies)
nix-shell

# Start backing services
docker-compose up -d

# Install Node dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npm run db:migrate

# Seed initial data (NYC permits)
npm run db:seed

# Start development server
npm run dev
```

---

## Project Structure

```
capex-scout/
├── docs/                    # Project documentation
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── page.tsx         # Main map view
│   │   ├── api/             # API routes
│   │   │   ├── search/      # Address search
│   │   │   ├── permits/     # Permit queries
│   │   │   └── census/      # Census tract data
│   │   └── layout.tsx
│   ├── components/          # React components
│   │   ├── Map/             # Mapbox map components
│   │   ├── Search/          # Address search bar
│   │   ├── Drawer/          # Property details drawer
│   │   └── Filters/         # Permit type filters
│   ├── lib/                 # Utilities
│   │   ├── db/              # Database client & queries
│   │   ├── mapbox/          # Mapbox utilities
│   │   └── scoring/         # Neighborhood scoring
│   └── types/               # TypeScript types
├── scripts/
│   ├── etl/                 # Data ingestion scripts
│   └── seed/                # Database seeding
├── shell.nix                # Nix dependencies
├── docker-compose.yml       # Local services
└── package.json
```

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Metro | NYC | Best open data availability, high permit volume |
| Neighborhood unit | Census tracts | Standard boundaries, expandable to adjacent |
| Scoring | Simple (permits/area) | Start simple, iterate based on feedback |
| Auth | None | MVP is public, add auth in future phase |
| Time horizons | 6mo, 1yr, 3yr | Toggle between views |

