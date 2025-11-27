import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { sql } from 'drizzle-orm';
import type { TimeHorizon } from '@/types';

// Map time horizon to months
const HORIZON_MONTHS: Record<TimeHorizon, number> = {
  '6mo': 6,
  '1yr': 12,
  '3yr': 36,
};

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const timeHorizon = (searchParams.get('timeHorizon') || '1yr') as TimeHorizon;
  const level = (searchParams.get('level') || 'neighborhood') as AggregationLevel;

  try {
    const monthsBack = HORIZON_MONTHS[timeHorizon] || 12;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - monthsBack);
    const cutoffDate = cutoff.toISOString().split('T')[0];

    let results;

    if (level === 'borough') {
      results = await db.execute(sql`
        SELECT 
          borough as group_key,
          borough,
          COUNT(*) as permit_count,
          COALESCE(SUM(estimated_cost::numeric), 0) as total_capital,
          AVG(latitude::numeric) as avg_lat,
          AVG(longitude::numeric) as avg_lng
        FROM permits
        WHERE filing_date >= ${cutoffDate}
          AND latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND borough IS NOT NULL
        GROUP BY borough
        ORDER BY COUNT(*) DESC
      `);
    } else if (level === 'tract') {
      results = await db.execute(sql`
        SELECT 
          census_tract_geoid as group_key,
          borough,
          census_tract_geoid,
          COUNT(*) as permit_count,
          COALESCE(SUM(estimated_cost::numeric), 0) as total_capital,
          AVG(latitude::numeric) as avg_lat,
          AVG(longitude::numeric) as avg_lng
        FROM permits
        WHERE filing_date >= ${cutoffDate}
          AND latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND census_tract_geoid IS NOT NULL
        GROUP BY census_tract_geoid, borough
        ORDER BY COUNT(*) DESC
        LIMIT 2000
      `);
    } else {
      // neighborhood - group by borough + block
      results = await db.execute(sql`
        SELECT 
          CONCAT(borough, '-', block) as group_key,
          borough,
          COUNT(*) as permit_count,
          COALESCE(SUM(estimated_cost::numeric), 0) as total_capital,
          AVG(latitude::numeric) as avg_lat,
          AVG(longitude::numeric) as avg_lng
        FROM permits
        WHERE filing_date >= ${cutoffDate}
          AND latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND borough IS NOT NULL
          AND block IS NOT NULL
        GROUP BY borough, block
        ORDER BY COUNT(*) DESC
        LIMIT 2000
      `);
    }

    // Transform results
    const aggregated: AggregatedPoint[] = (results as unknown as Array<{
      group_key: string;
      borough: string;
      census_tract_geoid?: string;
      permit_count: string;
      total_capital: string;
      avg_lat: string;
      avg_lng: string;
    }>)
      .filter(r => r.avg_lat && r.avg_lng && r.group_key)
      .map(r => {
        let lat = parseFloat(r.avg_lat);
        let lng = parseFloat(r.avg_lng);
        
        // For borough level, use predefined centers
        if (level === 'borough' && r.borough && BOROUGH_CENTERS[r.borough.toUpperCase()]) {
          lat = BOROUGH_CENTERS[r.borough.toUpperCase()].lat;
          lng = BOROUGH_CENTERS[r.borough.toUpperCase()].lng;
        }

        return {
          key: r.group_key,
          borough: r.borough,
          censusTract: r.census_tract_geoid,
          permitCount: parseInt(r.permit_count) || 0,
          totalCapital: parseFloat(r.total_capital) || 0,
          lat,
          lng,
        };
      });

    console.log(`Aggregated heatmap (${level}): ${aggregated.length} points`);

    return NextResponse.json({
      points: aggregated,
      count: aggregated.length,
      level,
      source: 'database',
    });
  } catch (error) {
    console.error('Aggregated heatmap error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aggregated data', details: String(error) },
      { status: 500 }
    );
  }
}
