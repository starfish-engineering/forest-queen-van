import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { sql } from 'drizzle-orm';
import type { TimeHorizon } from '@/types';

// Borough info
const BOROUGHS: Record<string, { name: string; fips: string }> = {
  'MANHATTAN': { name: 'Manhattan', fips: '36061' },
  'BRONX': { name: 'Bronx', fips: '36005' },
  'BROOKLYN': { name: 'Brooklyn', fips: '36047' },
  'QUEENS': { name: 'Queens', fips: '36081' },
  'STATEN ISLAND': { name: 'Staten Island', fips: '36085' },
};

// Map time horizon to column suffix
const HORIZON_COLUMNS: Record<TimeHorizon, { permits: string; value: string }> = {
  '6mo': { permits: 'permits_6mo', value: 'value_6mo' },
  '1yr': { permits: 'permits_1yr', value: 'value_1yr' },
  '3yr': { permits: 'permits_3yr', value: 'value_3yr' },
};

export interface RankedTract {
  rank: number;
  geoid: string;
  name: string;
  borough: string;
  score: number;
  permitCount: number;
  permitValue: number;
  trend: 'rising' | 'steady' | 'cooling';
  lat: number;
  lng: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const timeHorizon = (searchParams.get('timeHorizon') || '1yr') as TimeHorizon;
  const borough = searchParams.get('borough');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const cols = HORIZON_COLUMNS[timeHorizon] || HORIZON_COLUMNS['1yr'];

    // Build borough filter (handle both "all" and "ALL")
    const boroughFilter = borough && borough.toLowerCase() !== 'all' 
      ? sql`WHERE UPPER(borough) = ${borough.toUpperCase()}`
      : sql``;

    // Use materialized view for fast aggregated queries
    // The view has pre-computed counts for 6mo, 1yr, 3yr windows
    const results = await db.execute(sql`
      SELECT 
        borough,
        block,
        ${sql.raw(cols.permits)} as permit_count,
        ${sql.raw(cols.value)} as permit_value,
        permits_6mo as recent_count,
        permits_1yr - permits_6mo as older_count,
        avg_lat,
        avg_lng
      FROM mv_block_rankings
        ${boroughFilter}
      ORDER BY ${sql.raw(cols.permits)} DESC, ${sql.raw(cols.value)} DESC
      LIMIT ${limit}
    `);

    // Get raw results first
    const rawResults = (results as unknown as Array<{
      borough: string;
      block: string;
      permit_count: number;
      permit_value: number;
      recent_count: number;
      older_count: number;
      avg_lat: number;
      avg_lng: number;
    }>).filter(r => r.avg_lat && r.avg_lng);

    // Calculate max values for percentile-based scoring
    const maxPermits = Math.max(...rawResults.map(r => r.permit_count || 0), 1);
    const maxValue = Math.max(...rawResults.map(r => r.permit_value || 0), 1);

    // Transform results with percentile-based scores
    const tracts: RankedTract[] = rawResults.map((r, index) => {
        const permitCount = r.permit_count || 0;
        const permitValue = r.permit_value || 0;
        const recentCount = r.recent_count || 0;
        const olderCount = r.older_count || 0;

        // Calculate trend
        let trend: 'rising' | 'steady' | 'cooling' = 'steady';
        if (olderCount > 0) {
          const ratio = recentCount / olderCount;
          if (ratio > 1.3) trend = 'rising';
          else if (ratio < 0.7) trend = 'cooling';
        } else if (recentCount > 0) {
          trend = 'rising';
        }

        // Calculate score using percentile-based approach
        // 60% weight on permit count percentile, 40% on value percentile
        const countPercentile = (permitCount / maxPermits) * 100;
        const valuePercentile = (Math.log10(permitValue + 1) / Math.log10(maxValue + 1)) * 100;
        const score = Math.round(countPercentile * 0.6 + valuePercentile * 0.4);

        const boroughKey = (r.borough || '').toUpperCase();
        const boroughInfo = BOROUGHS[boroughKey] || { name: r.borough || 'NYC', fips: '36061' };

        return {
          rank: index + 1,
          geoid: `${boroughInfo.fips}${(r.block || '0').padStart(6, '0')}`,
          name: `Block ${r.block}`,
          borough: boroughInfo.name,
          score,
          permitCount,
          permitValue,
          trend,
          lat: r.avg_lat,
          lng: r.avg_lng,
        };
      });

    return NextResponse.json({
      tracts,
      timeHorizon,
      borough: borough || 'all',
      count: tracts.length,
      source: 'materialized_view',
    });
  } catch (error) {
    console.error('Rankings query error:', error);
    
    // Check if materialized view doesn't exist yet
    const errorMsg = String(error);
    if (errorMsg.includes('mv_block_rankings') && errorMsg.includes('does not exist')) {
      return NextResponse.json(
        { 
          error: 'Materialized views not initialized', 
          details: 'Run: psql $DATABASE_URL -f scripts/migrations/001-optimize-queries.sql'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch rankings', details: String(error) },
      { status: 500 }
    );
  }
}
