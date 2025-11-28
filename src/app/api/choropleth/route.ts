import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { sql } from 'drizzle-orm';
import type { TimeHorizon } from '@/types';

// Map time horizon to column names
const HORIZON_COLUMNS: Record<TimeHorizon, { permits: string; value: string }> = {
  '6mo': { permits: 'permits_6mo', value: 'value_6mo' },
  '1yr': { permits: 'permits_1yr', value: 'value_1yr' },
  '3yr': { permits: 'permits_3yr', value: 'value_3yr' },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const timeHorizon = (searchParams.get('timeHorizon') || '1yr') as TimeHorizon;

  try {
    const cols = HORIZON_COLUMNS[timeHorizon] || HORIZON_COLUMNS['1yr'];

    // Get tract-level aggregations from materialized view
    const results = await db.execute(sql`
      SELECT 
        census_tract_geoid as geoid,
        borough,
        ${sql.raw(cols.permits)} as permit_count,
        ${sql.raw(cols.value)} as permit_value,
        avg_lat as lat,
        avg_lng as lng
      FROM mv_tract_aggregations
      WHERE ${sql.raw(cols.permits)} > 0
      ORDER BY ${sql.raw(cols.permits)} DESC
    `);

    // Calculate percentiles for normalization
    const tracts = results as unknown as Array<{
      geoid: string;
      borough: string;
      permit_count: number;
      permit_value: number;
      lat: number;
      lng: number;
    }>;

    const counts = tracts.map(t => Number(t.permit_count)).sort((a, b) => a - b);
    const p50 = counts[Math.floor(counts.length * 0.5)] || 1;
    const p90 = counts[Math.floor(counts.length * 0.9)] || 1;
    const max = counts[counts.length - 1] || 1;

    // Normalize scores (0-100)
    const scoredTracts = tracts.map(t => {
      const count = Number(t.permit_count);
      const value = Number(t.permit_value);
      
      // Score based on permit count relative to distribution
      let score: number;
      if (count >= p90) {
        score = 80 + ((count - p90) / (max - p90)) * 20;
      } else if (count >= p50) {
        score = 40 + ((count - p50) / (p90 - p50)) * 40;
      } else {
        score = (count / p50) * 40;
      }
      
      return {
        geoid: t.geoid,
        borough: t.borough,
        permitCount: count,
        permitValue: value,
        score: Math.min(100, Math.round(score)),
        lat: Number(t.lat),
        lng: Number(t.lng),
      };
    });

    return NextResponse.json({
      tracts: scoredTracts,
      count: scoredTracts.length,
      timeHorizon,
      stats: { p50, p90, max },
    });
  } catch (error) {
    console.error('Choropleth query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch choropleth data', details: String(error) },
      { status: 500 }
    );
  }
}

