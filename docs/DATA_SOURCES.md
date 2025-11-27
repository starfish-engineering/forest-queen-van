# Data Sources

## Overview

All data for the MVP comes from NYC Open Data and related public APIs. This document details each data source, its API, and the ETL approach.

---

## Primary Data Sources

### 1. NYC Department of Buildings (DOB) Permits

**Source:** NYC Open Data  
**Dataset:** DOB Permit Issuance  
**API Endpoint:** `https://data.cityofnewyork.us/resource/ipu4-2vj7.json`  
**Update Frequency:** Daily  
**Documentation:** https://data.cityofnewyork.us/Housing-Development/DOB-Permit-Issuance/ipu4-2vj7

#### Key Fields

| Field | Description | Use |
|-------|-------------|-----|
| `job__` | Job number | Unique identifier |
| `permit_type` | Type of permit | Filter by category |
| `permit_subtype` | Subtype details | Further classification |
| `work_type` | Type of work | Classify capex type |
| `filing_date` | Date filed | Time horizon filtering |
| `issuance_date` | Date issued | Confirmation of activity |
| `estimated_job_cost__` | Estimated cost | Value indicator |
| `house__` + `street_name` | Address | Geocoding |
| `borough` | Borough | Geography |
| `block` | Tax block | Property identification |
| `lot` | Tax lot | Property identification |
| `bin__` | Building ID | Join to other datasets |
| `latitude` | Latitude | Mapping |
| `longitude` | Longitude | Mapping |
| `owner_s_business_name` | Owner | Context |

#### Permit Types of Interest

```
HIGH PRIORITY:
- NB (New Building) - Residential
- A1 (Alteration Type 1) - Major alterations
- A2 (Alteration Type 2) - Multiple work types

WORK TYPES TO FLAG:
- General Construction
- Plumbing
- Boiler
- Sprinkler
- Mechanical (HVAC)
- Elevator
- Structural
```

#### Sample Query

```bash
# Get permits from last 6 months
curl "https://data.cityofnewyork.us/resource/ipu4-2vj7.json?\
\$where=filing_date > '2024-06-01'&\
\$limit=50000&\
\$\$app_token=YOUR_APP_TOKEN"
```

---

### 2. NYC Business Licenses (DCA)

**Source:** NYC Open Data  
**Dataset:** Legally Operating Businesses  
**API Endpoint:** `https://data.cityofnewyork.us/resource/w7w3-xahh.json`  
**Update Frequency:** Daily  
**Documentation:** https://data.cityofnewyork.us/Business/Legally-Operating-Businesses/w7w3-xahh

#### Key Fields

| Field | Description | Use |
|-------|-------------|-----|
| `license_nbr` | License number | Unique identifier |
| `license_type` | Type of license | Business category |
| `lic_expir_dd` | Expiration date | Active status |
| `business_name` | Business name | Display |
| `business_name_2` | DBA name | Display |
| `address_building` | Building number | Address |
| `address_street_name` | Street | Address |
| `address_city` | City | Geography |
| `address_zip` | Zip code | Geography |
| `address_borough` | Borough | Geography |
| `latitude` | Latitude | Mapping |
| `longitude` | Longitude | Mapping |
| `industry` | Industry type | Classification |

#### Business Types of Interest

```
HIGH PRIORITY (High-End Indicators):
- Sidewalk Cafe
- Electronics Store
- Secondhand Dealer - General
- Stoop Line Stand (food vendors - gentrification signal)
- Laundry
- Home Improvement Contractor

INFER FROM NAME (text matching):
- Coffee/Cafe
- Yoga/Pilates/Fitness
- Wine bar
- Organic/Natural foods
- Specialty retail
- Boutique
```

#### Sample Query

```bash
# Get recently licensed businesses
curl "https://data.cityofnewyork.us/resource/w7w3-xahh.json?\
\$where=license_creation_date > '2024-01-01'&\
\$limit=50000"
```

---

### 3. NYC Restaurant Inspections (DOHMH)

**Source:** NYC Open Data  
**Dataset:** DOHMH New York City Restaurant Inspection Results  
**API Endpoint:** `https://data.cityofnewyork.us/resource/43nn-pn8j.json`  
**Update Frequency:** Daily  
**Documentation:** https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j

#### Key Fields

| Field | Description | Use |
|-------|-------------|-----|
| `camis` | Restaurant ID | Unique identifier |
| `dba` | Business name | Display |
| `boro` | Borough | Geography |
| `building` | Building number | Address |
| `street` | Street name | Address |
| `zipcode` | Zip code | Geography |
| `cuisine_description` | Cuisine type | Classification |
| `inspection_date` | Date inspected | First inspection = new opening |
| `grade` | Health grade | Quality indicator |
| `latitude` | Latitude | Mapping |
| `longitude` | Longitude | Mapping |

#### Use Case

Track new restaurant openings by identifying first inspection dates for new CAMIS IDs. Cuisine type can indicate "high-end" (French, Japanese, Farm-to-table, etc.).

---

### 4. NYS Liquor Authority (SLA) Licenses

**Source:** NY Open Data  
**Dataset:** Liquor Authority Current List of Active Licenses  
**API Endpoint:** `https://data.ny.gov/resource/hrvs-fxs2.json`  
**Update Frequency:** Weekly  
**Documentation:** https://data.ny.gov/Economic-Development/Liquor-Authority-Current-List-of-Active-Licenses/hrvs-fxs2

#### Key Fields

| Field | Description | Use |
|-------|-------------|-----|
| `serial_number` | License number | Unique identifier |
| `license_type_name` | Type of license | Classification |
| `premises_name` | Business name | Display |
| `doing_business_as_dba` | DBA | Display |
| `actual_address_of_premises_address1` | Address | Location |
| `actual_address_of_premises_city` | City | Filter to NYC |
| `actual_address_of_premises_zip_code` | Zip | Geography |
| `license_original_issue_date` | Issue date | Track new licenses |
| `license_effective_date` | Effective date | Active status |
| `license_expiration_date` | Expiration | Active status |
| `county` | County | Filter to NYC counties |
| `georeference` | Lat/Lng | Mapping |

#### NYC County Filter

```
NYC Counties:
- NEW YORK (Manhattan)
- KINGS (Brooklyn)
- QUEENS (Queens)
- BRONX (Bronx)
- RICHMOND (Staten Island)
```

#### Sample Query

```bash
# Get NYC liquor licenses issued in last year
curl "https://data.ny.gov/resource/hrvs-fxs2.json?\
\$where=license_original_issue_date > '2023-12-01' AND \
county in ('NEW YORK', 'KINGS', 'QUEENS', 'BRONX', 'RICHMOND')&\
\$limit=50000"
```

---

### 5. Census Tract Boundaries

**Source:** US Census Bureau TIGER/Line  
**Dataset:** Census Tracts for New York State  
**Format:** Shapefile / GeoJSON  
**Documentation:** https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html

#### Download URL

```
https://www2.census.gov/geo/tiger/TIGER2023/TRACT/tl_2023_36_tract.zip
```

(State FIPS 36 = New York)

#### NYC County FIPS Codes

```
36061 - New York County (Manhattan)
36047 - Kings County (Brooklyn)
36081 - Queens County
36005 - Bronx County
36085 - Richmond County (Staten Island)
```

#### Processing

1. Download TIGER shapefile
2. Filter to NYC counties
3. Convert to GeoJSON
4. Load into PostGIS
5. Create spatial indexes

---

## ETL Pipeline

### Architecture

```
┌─────────────────┐
│  NYC Open Data  │
│   Socrata API   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ETL Script    │
│  (Node.js/TS)   │
│                 │
│ • Fetch data    │
│ • Transform     │
│ • Geocode       │
│ • Assign tract  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│    + PostGIS    │
└─────────────────┘
```

### ETL Script Structure

```
scripts/
├── etl/
│   ├── index.ts           # Main ETL runner
│   ├── sources/
│   │   ├── dob-permits.ts     # DOB permit ingestion
│   │   ├── dca-businesses.ts  # Business licenses
│   │   ├── dohmh-restaurants.ts
│   │   └── sla-liquor.ts
│   ├── transforms/
│   │   ├── geocode.ts         # Address geocoding
│   │   ├── classify.ts        # Permit/business classification
│   │   └── assign-tract.ts    # Census tract assignment
│   └── loaders/
│       └── postgres.ts        # Database insertion
├── seed/
│   ├── census-tracts.ts   # Load tract boundaries
│   └── compute-scores.ts  # Calculate tract scores
└── cron/
    └── daily-sync.ts      # Daily incremental update
```

### Incremental Sync Strategy

```typescript
// Track last sync timestamp
// Only fetch records modified since last sync
// Upsert based on unique identifiers

async function syncPermits() {
  const lastSync = await getLastSyncTimestamp('permits');
  
  const newRecords = await fetchDOBPermits({
    where: `filing_date > '${lastSync}'`,
    limit: 50000
  });
  
  for (const record of newRecords) {
    await upsertPermit(record);
  }
  
  await updateSyncTimestamp('permits');
}
```

### Census Tract Assignment

```sql
-- Assign census tract to permit based on point-in-polygon
UPDATE permits p
SET census_tract_geoid = ct.geoid
FROM census_tracts ct
WHERE ST_Contains(ct.geometry, p.geometry)
  AND p.census_tract_geoid IS NULL;
```

---

## Data Quality Considerations

### Missing Coordinates

Some records may lack lat/lng. Strategy:
1. Use provided coordinates when available
2. Fallback: Geocode using address with Mapbox Geocoding API
3. Cache geocoded results to avoid repeated API calls

### Duplicate Records

NYC Open Data may have duplicates or updates to existing records:
- Use permit_number/license_number as unique key
- Implement upsert logic
- Track `updated_at` timestamps

### Data Freshness

| Dataset | Typical Lag | Strategy |
|---------|-------------|----------|
| DOB Permits | 1-3 days | Daily sync |
| Business Licenses | 1-7 days | Daily sync |
| Restaurant Inspections | 1-7 days | Daily sync |
| Liquor Licenses | 1-2 weeks | Weekly sync |

---

## API Rate Limits

### NYC Open Data (Socrata)

- **Without app token:** 1,000 requests/hour
- **With app token:** 10,000 requests/hour (free registration)
- **Throttling:** Implement exponential backoff

### Mapbox Geocoding

- **Free tier:** 100,000 requests/month
- **Strategy:** Cache all geocoded addresses, batch requests

---

## Initial Data Load Estimates

| Dataset | Records (Est.) | Size | Load Time |
|---------|---------------|------|-----------|
| Census Tracts (NYC) | ~2,300 | 50 MB | 2 min |
| DOB Permits (3yr) | ~500,000 | 200 MB | 30 min |
| Business Licenses | ~100,000 | 30 MB | 10 min |
| Restaurant Data | ~27,000 | 15 MB | 5 min |
| Liquor Licenses (NYC) | ~15,000 | 5 MB | 2 min |

**Total estimated initial load time:** ~1 hour

---

## Monitoring & Maintenance

### Daily Checks

- [ ] ETL job completed successfully
- [ ] Record counts within expected range
- [ ] No significant geocoding failures
- [ ] Tract score computation completed

### Weekly Tasks

- [ ] Review data quality metrics
- [ ] Check for API changes/deprecations
- [ ] Update any classification rules

### Alerts

- ETL job failure
- >5% geocoding failure rate
- Unexpected drop in record counts
- API rate limit approaching

