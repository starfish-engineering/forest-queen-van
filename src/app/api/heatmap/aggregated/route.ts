import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { sql } from 'drizzle-orm';
import type { TimeHorizon } from '@/types';

// Aggregation levels for LOD
export type AggregationLevel = 'borough' | 'neighborhood' | 'tract';

interface AggregatedPoint {
  key: string;
  borough?: string;
  censusTract?: string;
  permitCount: number;
  totalCapital: number;
  lat: number;
  lng: number;
}

// Borough center coordinates for city-wide view
const BOROUGH_CENTERS: Record<string, { lat: number; lng: number }> = {
  'MANHATTAN': { lat: 40.7831, lng: -73.9712 },
  'BROOKLYN': { lat: 40.6782, lng: -73.9442 },
  'QUEENS': { lat: 40.7282, lng: -73.7949 },
  'BRONX': { lat: 40.8448, lng: -73.8648 },
  'STATEN ISLAND': { lat: 40.5795, lng: -74.1502 },
};

// Map time horizon to column names in materialized views
const HORIZON_COLUMNS: Record<TimeHorizon, { permits: string; value: string }> = {
  '6mo': { permits: 'permits_6mo', value: 'value_6mo' },
  '1yr': { permits: 'permits_1yr', value: 'value_1yr' },
  '3yr': { permits: 'permits_3yr', value: 'value_3yr' },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const timeHorizon = (searchParams.get('timeHorizon') || '1yr') as TimeHorizon;
  const level = (searchParams.get('level') || 'neighborhood') as AggregationLevel;

  try {
    const cols = HORIZON_COLUMNS[timeHorizon] || HORIZON_COLUMNS['1yr'];
    let results;

    if (level === 'borough') {
      // Use borough materialized view
      results = await db.execute(sql`
        SELECT 
          borough as group_key,
          borough,
          ${sql.raw(cols.permits)} as permit_count,
          permit_value as total_capital,
          avg_lat,
          avg_lng
        FROM mv_borough_aggregations
        ORDER BY ${sql.raw(cols.permits)} DESC
      `);
    } else if (level === 'tract') {
      // Use tract materialized view
      results = await db.execute(sql`
        SELECT 
          census_tract_geoid as group_key,
          borough,
          census_tract_geoid,
          ${sql.raw(cols.permits)} as permit_count,
          ${sql.raw(cols.value)} as total_capital,
          avg_lat,
          avg_lng
        FROM mv_tract_aggregations
        ORDER BY ${sql.raw(cols.permits)} DESC
        LIMIT 2000
      `);
    } else {
      // neighborhood - use block rankings view
      results = await db.execute(sql`
        SELECT 
          CONCAT(borough, '-', block) as group_key,
          borough,
          ${sql.raw(cols.permits)} as permit_count,
          ${sql.raw(cols.value)} as total_capital,
          avg_lat,
          avg_lng
        FROM mv_block_rankings
        ORDER BY ${sql.raw(cols.permits)} DESC
        LIMIT 2000
      `);
    }

    // Transform results - postgres returns bigint/numeric as strings, so parse them
    const aggregated: AggregatedPoint[] = (results as unknown as Array<{
      group_key: string;
      borough: string;
      census_tract_geoid?: string;
      permit_count: string | number;
      total_capital: string | number;
      avg_lat: string | number;
      avg_lng: string | number;
    }>)
      .filter(r => r.avg_lat && r.avg_lng && r.group_key)
      .map(r => {
        let lat = Number(r.avg_lat);
        let lng = Number(r.avg_lng);
        
        // For borough level, use predefined centers
        if (level === 'borough' && r.borough && BOROUGH_CENTERS[r.borough.toUpperCase()]) {
          lat = BOROUGH_CENTERS[r.borough.toUpperCase()].lat;
          lng = BOROUGH_CENTERS[r.borough.toUpperCase()].lng;
        }

        return {
          key: r.group_key,
          borough: r.borough,
          censusTract: r.census_tract_geoid,
          permitCount: Number(r.permit_count) || 0,
          totalCapital: Number(r.total_capital) || 0,
          lat,
          lng,
        };
      });

    console.log(`Aggregated heatmap (${level}): ${aggregated.length} points`);

    return NextResponse.json({
      points: aggregated,
      count: aggregated.length,
      level,
      source: 'materialized_view',
    });
  } catch (error) {
    console.error('Aggregated heatmap error:', error);
    
    // Check if materialized view doesn't exist yet
    const errorMsg = String(error);
    if (errorMsg.includes('mv_') && errorMsg.includes('does not exist')) {
      return NextResponse.json(
        { 
          error: 'Materialized views not initialized', 
          details: 'Run: psql $DATABASE_URL -f scripts/migrations/001-optimize-queries.sql'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch aggregated data', details: String(error) },
      { status: 500 }
    );
  }
}
