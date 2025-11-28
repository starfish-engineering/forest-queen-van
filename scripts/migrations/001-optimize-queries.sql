-- Migration: Optimize PostgreSQL for faster queries
-- Run this migration on an existing database to improve performance

-- ============================================
-- 1. Convert numeric columns to double precision
--    (double precision is ~3x faster for range queries)
-- ============================================

-- Permits table
ALTER TABLE permits 
  ALTER COLUMN latitude TYPE double precision USING latitude::double precision,
  ALTER COLUMN longitude TYPE double precision USING longitude::double precision,
  ALTER COLUMN estimated_cost TYPE double precision USING estimated_cost::double precision;

-- Businesses table
ALTER TABLE businesses 
  ALTER COLUMN latitude TYPE double precision USING latitude::double precision,
  ALTER COLUMN longitude TYPE double precision USING longitude::double precision;

-- Liquor licenses table
ALTER TABLE liquor_licenses 
  ALTER COLUMN latitude TYPE double precision USING latitude::double precision,
  ALTER COLUMN longitude TYPE double precision USING longitude::double precision;

-- Census tracts table
ALTER TABLE census_tracts 
  ALTER COLUMN land_area_sqm TYPE double precision USING land_area_sqm::double precision;

-- Tract scores table
ALTER TABLE tract_scores 
  ALTER COLUMN total_permits TYPE integer USING total_permits::integer,
  ALTER COLUMN total_permit_value TYPE double precision USING total_permit_value::double precision,
  ALTER COLUMN permit_density TYPE double precision USING permit_density::double precision,
  ALTER COLUMN business_count TYPE integer USING business_count::integer,
  ALTER COLUMN high_end_business_count TYPE integer USING high_end_business_count::integer,
  ALTER COLUMN composite_score TYPE double precision USING composite_score::double precision;

-- ============================================
-- 2. Drop old indexes (will recreate optimized versions)
-- ============================================

DROP INDEX IF EXISTS idx_permits_coords;
DROP INDEX IF EXISTS idx_businesses_coords;
DROP INDEX IF EXISTS idx_liquor_licenses_coords;

-- ============================================
-- 3. Create optimized composite indexes
--    (Using regular CREATE INDEX, not CONCURRENTLY, for simplicity)
-- ============================================

-- Heatmap queries: filter by date, then lat/lng range
CREATE INDEX IF NOT EXISTS idx_permits_heatmap 
  ON permits (filing_date DESC, latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Rankings/aggregation queries: group by borough + block
CREATE INDEX IF NOT EXISTS idx_permits_rankings 
  ON permits (borough, block, filing_date DESC) 
  WHERE latitude IS NOT NULL AND block IS NOT NULL;

-- Census tract lookups with date
CREATE INDEX IF NOT EXISTS idx_permits_tract_date 
  ON permits (census_tract_geoid, filing_date DESC) 
  WHERE census_tract_geoid IS NOT NULL;

-- Simple coordinate indexes (PostGIS GIST requires the extension)
CREATE INDEX IF NOT EXISTS idx_permits_lat ON permits (latitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_permits_lng ON permits (longitude) WHERE longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_lat ON businesses (latitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_lng ON businesses (longitude) WHERE longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_liquor_lat ON liquor_licenses (latitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_liquor_lng ON liquor_licenses (longitude) WHERE longitude IS NOT NULL;

-- ============================================
-- 4. Create materialized views for heavy aggregations
-- ============================================

-- Drop existing views if they exist
DROP MATERIALIZED VIEW IF EXISTS mv_block_rankings;
DROP MATERIALIZED VIEW IF EXISTS mv_tract_aggregations;
DROP MATERIALIZED VIEW IF EXISTS mv_borough_aggregations;

-- Block-level rankings (refreshed periodically)
CREATE MATERIALIZED VIEW mv_block_rankings AS
SELECT 
  borough,
  block,
  COUNT(*) as permit_count,
  COALESCE(SUM(estimated_cost), 0) as permit_value,
  AVG(latitude) as avg_lat,
  AVG(longitude) as avg_lng,
  MIN(filing_date) as earliest_filing,
  MAX(filing_date) as latest_filing,
  -- Pre-compute counts for different time windows
  COUNT(*) FILTER (WHERE filing_date >= CURRENT_DATE - INTERVAL '6 months') as permits_6mo,
  COUNT(*) FILTER (WHERE filing_date >= CURRENT_DATE - INTERVAL '1 year') as permits_1yr,
  COUNT(*) FILTER (WHERE filing_date >= CURRENT_DATE - INTERVAL '3 years') as permits_3yr,
  COALESCE(SUM(estimated_cost) FILTER (WHERE filing_date >= CURRENT_DATE - INTERVAL '6 months'), 0) as value_6mo,
  COALESCE(SUM(estimated_cost) FILTER (WHERE filing_date >= CURRENT_DATE - INTERVAL '1 year'), 0) as value_1yr,
  COALESCE(SUM(estimated_cost) FILTER (WHERE filing_date >= CURRENT_DATE - INTERVAL '3 years'), 0) as value_3yr
FROM permits
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL 
  AND block IS NOT NULL
  AND borough IS NOT NULL
GROUP BY borough, block;

-- Index on materialized view
CREATE UNIQUE INDEX idx_mv_block_rankings_pk ON mv_block_rankings (borough, block);
CREATE INDEX idx_mv_block_rankings_6mo ON mv_block_rankings (permits_6mo DESC);
CREATE INDEX idx_mv_block_rankings_1yr ON mv_block_rankings (permits_1yr DESC);
CREATE INDEX idx_mv_block_rankings_3yr ON mv_block_rankings (permits_3yr DESC);

-- Census tract aggregations
CREATE MATERIALIZED VIEW mv_tract_aggregations AS
SELECT 
  census_tract_geoid,
  borough,
  COUNT(*) as permit_count,
  COALESCE(SUM(estimated_cost), 0) as permit_value,
  AVG(latitude) as avg_lat,
  AVG(longitude) as avg_lng,
  COUNT(*) FILTER (WHERE filing_date >= CURRENT_DATE - INTERVAL '6 months') as permits_6mo,
  COUNT(*) FILTER (WHERE filing_date >= CURRENT_DATE - INTERVAL '1 year') as permits_1yr,
  COUNT(*) FILTER (WHERE filing_date >= CURRENT_DATE - INTERVAL '3 years') as permits_3yr,
  COALESCE(SUM(estimated_cost) FILTER (WHERE filing_date >= CURRENT_DATE - INTERVAL '6 months'), 0) as value_6mo,
  COALESCE(SUM(estimated_cost) FILTER (WHERE filing_date >= CURRENT_DATE - INTERVAL '1 year'), 0) as value_1yr,
  COALESCE(SUM(estimated_cost) FILTER (WHERE filing_date >= CURRENT_DATE - INTERVAL '3 years'), 0) as value_3yr
FROM permits
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL 
  AND census_tract_geoid IS NOT NULL
GROUP BY census_tract_geoid, borough;

CREATE UNIQUE INDEX idx_mv_tract_agg_pk ON mv_tract_aggregations (census_tract_geoid);
CREATE INDEX idx_mv_tract_agg_1yr ON mv_tract_aggregations (permits_1yr DESC);

-- Borough-level aggregations (for zoomed-out heatmap)
CREATE MATERIALIZED VIEW mv_borough_aggregations AS
SELECT 
  borough,
  COUNT(*) as permit_count,
  COALESCE(SUM(estimated_cost), 0) as permit_value,
  AVG(latitude) as avg_lat,
  AVG(longitude) as avg_lng,
  COUNT(*) FILTER (WHERE filing_date >= CURRENT_DATE - INTERVAL '6 months') as permits_6mo,
  COUNT(*) FILTER (WHERE filing_date >= CURRENT_DATE - INTERVAL '1 year') as permits_1yr,
  COUNT(*) FILTER (WHERE filing_date >= CURRENT_DATE - INTERVAL '3 years') as permits_3yr
FROM permits
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL 
  AND borough IS NOT NULL
GROUP BY borough;

CREATE UNIQUE INDEX idx_mv_borough_agg_pk ON mv_borough_aggregations (borough);

-- ============================================
-- 5. Create refresh function
-- ============================================

CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_block_rankings;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_tract_aggregations;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_borough_aggregations;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Update table statistics for query planner
-- ============================================

ANALYZE permits;
ANALYZE businesses;
ANALYZE liquor_licenses;
ANALYZE census_tracts;

-- Done!
SELECT 'Migration completed successfully' as status;
