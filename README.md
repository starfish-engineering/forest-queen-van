# CapEx Scout

**Neighborhood Investment Intelligence for Real Estate Investors**

A web application that helps real estate investors identify and track capital expenditure trends in NYC neighborhoods by aggregating permit data, business openings, and construction activity to visualize "neighborhood momentum."

![CapEx Scout](https://via.placeholder.com/800x400?text=CapEx+Scout+Map+View)

## Features

- 🗺️ **Interactive Map** — Full-screen Mapbox map with heatmap visualization of investment activity
- 🔍 **Address Search** — Search any NYC address with autocomplete
- 📊 **Neighborhood Scoring** — See a composite score (0-100) based on permit density and business activity
- 🏗️ **Permit Filters** — Filter by building permits, business licenses, and liquor licenses
- ⏱️ **Time Horizon Toggle** — View data from the last 6 months, 1 year, or 3 years
- 📍 **Census Tract Visualization** — See tract boundaries with option to include adjacent tracts

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Mapping | Mapbox GL JS |
| Charts | Recharts |
| Styling | Tailwind CSS |
| State | Zustand, React Query |
| Backend | Next.js API Routes |
| Database | PostgreSQL + PostGIS |
| ORM | Drizzle |

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Mapbox API key ([get one free](https://account.mapbox.com/access-tokens/))
- NYC Open Data App Token ([register here](https://data.cityofnewyork.us/profile/edit/developer_settings))

### Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd capex-scout

# 2. Install dependencies
npm install

# 3. Start PostgreSQL with PostGIS
docker-compose up -d

# 4. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Mapbox token and NYC Open Data token

# 5. Push database schema
npm run db:push

# 6. Seed census tract data
npm run db:seed

# 7. Run ETL to load permit data
npm run etl:all

# 8. Compute neighborhood scores
npm run score:compute

# 9. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

Create a `.env.local` file with:

```bash
# Database
DATABASE_URL=postgresql://capex:capex_dev@localhost:5432/capex_scout

# Mapbox (get from https://account.mapbox.com/access-tokens/)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here

# NYC Open Data (get from https://data.cityofnewyork.us/profile/edit/developer_settings)
NYC_OPEN_DATA_APP_TOKEN=your_token_here
```

## Project Structure

```
capex-scout/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── search/         # Address geocoding
│   │   │   ├── permits/        # Permit queries
│   │   │   ├── census/         # Census tract data
│   │   │   └── heatmap/        # Heatmap points
│   │   ├── page.tsx            # Main map view
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── Map/                # Mapbox map
│   │   ├── Search/             # Address search
│   │   ├── Filters/            # Filter panel & time toggle
│   │   ├── Drawer/             # Detail drawer
│   │   └── Score/              # Score display
│   ├── lib/
│   │   ├── db/                 # Database client & schema
│   │   ├── utils/              # Utility functions
│   │   ├── store.ts            # Zustand store
│   │   ├── queries.ts          # React Query hooks
│   │   └── providers.tsx       # Provider wrapper
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript types
├── scripts/
│   ├── etl/                    # Data ingestion scripts
│   └── seed/                   # Database seeding
├── drizzle/                    # Database migrations
├── shell.nix                   # Nix development shell
├── docker-compose.yml          # Local PostgreSQL
└── drizzle.config.ts           # Drizzle ORM config
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Load census tract boundaries |
| `npm run etl:permits` | Load DOB permit data |
| `npm run etl:businesses` | Load business license data |
| `npm run etl:liquor` | Load liquor license data |
| `npm run etl:all` | Run all ETL scripts |
| `npm run score:compute` | Compute neighborhood scores |

## Data Sources

| Source | API | Update Frequency |
|--------|-----|------------------|
| DOB Permits | [NYC Open Data](https://data.cityofnewyork.us/resource/ipu4-2vj7.json) | Daily |
| Business Licenses | [NYC Open Data](https://data.cityofnewyork.us/resource/w7w3-xahh.json) | Daily |
| Liquor Licenses | [NY Open Data](https://data.ny.gov/resource/hrvs-fxs2.json) | Weekly |
| Census Tracts | [Census TIGER](https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html) | Annual |

## License

MIT

---

Built with ❤️ for NYC real estate investors
