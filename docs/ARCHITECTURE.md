# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Mapbox    │  │   Search    │  │   Filters   │  │   Drawer    │    │
│  │  GL JS Map  │  │    Bar      │  │   Panel     │  │   Panel     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                         Next.js App (React + TypeScript)                 │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS API ROUTES                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  /api/      │  │  /api/      │  │  /api/      │  │  /api/      │    │
│  │  search     │  │  permits    │  │  census     │  │  score      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         POSTGRESQL + POSTGIS                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   permits   │  │  businesses │  │   census_   │  │   geocoded_ │    │
│  │             │  │             │  │   tracts    │  │   addresses │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                          Supabase (Production)                           │
└─────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │
┌─────────────────────────────────────────────────────────────────────────┐
│                           ETL PIPELINE                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │  NYC Open   │  │   NYC DOB   │  │  SLA Data   │                      │
│  │  Data API   │  │   API       │  │             │                      │
│  └─────────────┘  └─────────────┘  └─────────────┘                      │
│                     Scheduled Scripts (Cron)                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack Details

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Mapbox GL JS | 3.x | Interactive maps, heatmaps, markers |
| Recharts | 2.x | Charts (for sparklines in drawer) |
| Tailwind CSS | 3.x | Styling |
| @tanstack/react-query | 5.x | Data fetching & caching |
| zustand | 4.x | Client state management |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 14.x | REST API endpoints |
| Node.js | 20.x | Runtime |
| PostgreSQL | 15.x | Primary database |
| PostGIS | 3.x | Geospatial queries |
| Drizzle ORM | 0.29.x | Database ORM with type safety |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Nix | Local dependency management |
| Docker Compose | Local backing services (Postgres) |
| Supabase | Managed Postgres with PostGIS |
| Vercel | Frontend & API hosting |

---

## Database Schema

### Core Tables

```sql
-- Census tract boundaries (pre-loaded from Census Bureau)
CREATE TABLE census_tracts (
  id SERIAL PRIMARY KEY,
  geoid VARCHAR(11) UNIQUE NOT NULL,  -- e.g., "36061000100"
  state_fips VARCHAR(2) NOT NULL,      -- "36" for NY
  county_fips VARCHAR(3) NOT NULL,     -- "061" for Manhattan
  tract_code VARCHAR(6) NOT NULL,
  name VARCHAR(100),
  geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
  land_area_sqm NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Building permits from NYC DOB
CREATE TABLE permits (
  id SERIAL PRIMARY KEY,
  permit_number VARCHAR(50) UNIQUE NOT NULL,
  permit_type VARCHAR(100) NOT NULL,
  permit_subtype VARCHAR(100),
  description TEXT,
  filing_date DATE NOT NULL,
  issuance_date DATE,
  expiration_date DATE,
  estimated_cost NUMERIC,
  address VARCHAR(255),
  borough VARCHAR(20),
  block VARCHAR(10),
  lot VARCHAR(10),
  bin VARCHAR(10),  -- Building Identification Number
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  geometry GEOMETRY(Point, 4326),
  census_tract_geoid VARCHAR(11),
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Business licenses
CREATE TABLE businesses (
  id SERIAL PRIMARY KEY,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  business_name VARCHAR(255),
  business_type VARCHAR(100) NOT NULL,  -- restaurant, retail, coffee, etc.
  license_type VARCHAR(100),
  license_status VARCHAR(50),
  issue_date DATE,
  expiration_date DATE,
  address VARCHAR(255),
  borough VARCHAR(20),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  geometry GEOMETRY(Point, 4326),
  census_tract_geoid VARCHAR(11),
  is_high_end_indicator BOOLEAN DEFAULT FALSE,  -- flagged as "bougie"
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Liquor licenses (NYC SLA)
CREATE TABLE liquor_licenses (
  id SERIAL PRIMARY KEY,
  serial_number VARCHAR(50) UNIQUE NOT NULL,
  license_type VARCHAR(100),
  premises_name VARCHAR(255),
  dba VARCHAR(255),
  address VARCHAR(255),
  city VARCHAR(100),
  zip VARCHAR(10),
  county VARCHAR(50),
  license_issue_date DATE,
  license_expiration_date DATE,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  geometry GEOMETRY(Point, 4326),
  census_tract_geoid VARCHAR(11),
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pre-computed tract scores (refreshed daily)
CREATE TABLE tract_scores (
  id SERIAL PRIMARY KEY,
  census_tract_geoid VARCHAR(11) NOT NULL,
  time_horizon VARCHAR(10) NOT NULL,  -- '6mo', '1yr', '3yr'
  total_permits INTEGER DEFAULT 0,
  total_permit_value NUMERIC DEFAULT 0,
  permit_density NUMERIC,  -- permits per sq km
  business_count INTEGER DEFAULT 0,
  high_end_business_count INTEGER DEFAULT 0,
  composite_score NUMERIC,
  computed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(census_tract_geoid, time_horizon)
);
```

### Indexes

```sql
-- Geospatial indexes
CREATE INDEX idx_permits_geometry ON permits USING GIST (geometry);
CREATE INDEX idx_businesses_geometry ON businesses USING GIST (geometry);
CREATE INDEX idx_liquor_licenses_geometry ON liquor_licenses USING GIST (geometry);
CREATE INDEX idx_census_tracts_geometry ON census_tracts USING GIST (geometry);

-- Query indexes
CREATE INDEX idx_permits_filing_date ON permits (filing_date);
CREATE INDEX idx_permits_census_tract ON permits (census_tract_geoid);
CREATE INDEX idx_permits_type ON permits (permit_type);
CREATE INDEX idx_businesses_type ON businesses (business_type);
CREATE INDEX idx_businesses_census_tract ON businesses (census_tract_geoid);
CREATE INDEX idx_tract_scores_lookup ON tract_scores (census_tract_geoid, time_horizon);
```

---

## API Endpoints

### Address Search

```
GET /api/search?q={address}
```

Returns geocoded address with census tract information.

**Response:**
```json
{
  "address": "123 Main St, Brooklyn, NY 11201",
  "latitude": 40.6892,
  "longitude": -73.9857,
  "censusTract": {
    "geoid": "36047000100",
    "name": "Census Tract 1, Kings County",
    "geometry": { /* GeoJSON */ }
  },
  "adjacentTracts": [
    { "geoid": "36047000200", "name": "Census Tract 2" }
  ]
}
```

### Permits Query

```
GET /api/permits?tract={geoid}&timeHorizon={6mo|1yr|3yr}&types={comma-separated}
```

Returns permits within specified tract(s) and time horizon.

**Query Parameters:**
- `tract`: Census tract GEOID (can be comma-separated for multiple)
- `timeHorizon`: `6mo`, `1yr`, or `3yr`
- `types`: Filter by permit types (optional)
- `includeAdjacent`: Include adjacent tracts (boolean)

**Response:**
```json
{
  "permits": [
    {
      "id": "123",
      "permitNumber": "DOB-2024-001234",
      "type": "Alteration Type 1",
      "description": "New HVAC system installation",
      "filingDate": "2024-03-15",
      "estimatedCost": 150000,
      "address": "456 Oak Ave, Brooklyn, NY",
      "latitude": 40.6895,
      "longitude": -73.9860,
      "distanceFromSubject": 0.2  // miles
    }
  ],
  "total": 45,
  "byType": {
    "Alteration Type 1": 20,
    "New Building": 5,
    "Electrical": 20
  }
}
```

### Census Tract Data

```
GET /api/census/{geoid}?includeAdjacent={boolean}
```

Returns tract boundaries and computed scores.

**Response:**
```json
{
  "tract": {
    "geoid": "36047000100",
    "geometry": { /* GeoJSON */ },
    "scores": {
      "6mo": { "permitCount": 15, "density": 2.3, "score": 72 },
      "1yr": { "permitCount": 45, "density": 2.1, "score": 68 },
      "3yr": { "permitCount": 120, "density": 1.8, "score": 65 }
    }
  },
  "adjacentTracts": [ /* array of tract objects */ ]
}
```

### Heatmap Data

```
GET /api/heatmap?bounds={sw_lng,sw_lat,ne_lng,ne_lat}&timeHorizon={6mo|1yr|3yr}
```

Returns aggregated data for heatmap rendering within viewport bounds.

---

## Key Algorithms

### Distance Calculation

```typescript
// Haversine formula for distance from subject property
function calculateDistance(
  subjectLat: number,
  subjectLng: number,
  permitLat: number,
  permitLng: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(permitLat - subjectLat);
  const dLng = toRad(permitLng - subjectLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(subjectLat)) *
      Math.cos(toRad(permitLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

### Neighborhood Score (v1 - Simple)

```typescript
interface TractScore {
  permitCount: number;
  permitDensity: number;  // permits per sq km
  permitValue: number;    // total estimated cost
  highEndBusinessCount: number;
  compositeScore: number; // 0-100
}

function calculateTractScore(
  tractGeoid: string,
  timeHorizon: '6mo' | '1yr' | '3yr'
): TractScore {
  // Simple weighted formula
  const weights = {
    permitDensity: 0.4,
    permitValue: 0.3,
    highEndBusiness: 0.3
  };
  
  // Normalize each metric to 0-100 based on city-wide percentiles
  // Combine with weights
  // Return composite score
}
```

### Permit Type Classification

```typescript
const PERMIT_CATEGORIES = {
  multifamily: [
    'NB - New Building (Residential)',
    'A1 - Alteration Type 1 (Residential)',
    'DM - Demolition'
  ],
  majorCapex: [
    'New roof',
    'HVAC',
    'Boiler replacement',
    'Elevator',
    'Facade restoration'
  ],
  commercial: [
    'A1 - Alteration Type 1 (Commercial)',
    'Commercial tenant improvement'
  ]
};

const BUSINESS_CATEGORIES = {
  highEndIndicator: [
    'Coffee shop',
    'Specialty food',
    'Boutique retail',
    'Fitness studio',
    'Co-working',
    'Wine bar',
    'Organic grocery'
  ],
  restaurant: [
    'Restaurant',
    'Cafe',
    'Bar'
  ],
  grocery: [
    'Grocery',
    'Supermarket',
    'Specialty food store'
  ]
};
```

---

## Environment Variables

```bash
# .env.local

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/capex_scout

# Supabase (production)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx

# NYC Open Data
NYC_OPEN_DATA_APP_TOKEN=xxx

# Optional: Redis for caching (future)
# REDIS_URL=redis://localhost:6379
```

---

## Local Development Setup

### shell.nix

```nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_20
    nodePackages.npm
    nodePackages.typescript
    postgresql_15
    postgis
  ];

  shellHook = ''
    echo "CapEx Scout development environment"
    echo "Node: $(node --version)"
    echo "npm: $(npm --version)"
  '';
}
```

### docker-compose.yml

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
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
```

