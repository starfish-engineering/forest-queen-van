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

// Map time horizon to months
const HORIZON_MONTHS: Record<TimeHorizon, number> = {
  '6mo': 6,
  '1yr': 12,
  '3yr': 36,
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
    const monthsBack = HORIZON_MONTHS[timeHorizon] || 12;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - monthsBack);
    const cutoffDate = cutoff.toISOString().split('T')[0];
    
    // Midpoint for trend analysis
    const midpoint = new Date();
    midpoint.setMonth(midpoint.getMonth() - Math.floor(monthsBack / 2));
    const midpointDate = midpoint.toISOString().split('T')[0];

    // Build borough filter
    const boroughFilter = borough && borough !== 'all' 
      ? sql`AND UPPER(borough) = ${borough.toUpperCase()}`
      : sql``;

    // Query aggregated data from database
    const results = await db.execute(sql`
      SELECT 
        borough,
        block,
        COUNT(*) as permit_count,
        COALESCE(SUM(CAST(estimated_cost AS NUMERIC)), 0) as permit_value,
        COUNT(*) FILTER (WHERE filing_date >= ${midpointDate}) as recent_count,
        COUNT(*) FILTER (WHERE filing_date < ${midpointDate}) as older_count,
        AVG(CAST(latitude AS NUMERIC)) as avg_lat,
        AVG(CAST(longitude AS NUMERIC)) as avg_lng
      FROM permits
      WHERE filing_date >= ${cutoffDate}
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND block IS NOT NULL
        ${boroughFilter}
      GROUP BY borough, block
      HAVING COUNT(*) >= 2
      ORDER BY COUNT(*) DESC, SUM(CAST(estimated_cost AS NUMERIC)) DESC
      LIMIT ${limit}
    `);

    // Transform results
    const tracts: RankedTract[] = (results.rows as Array<{
      borough: string;
      block: string;
      permit_count: string;
      permit_value: string;
      recent_count: string;
      older_count: string;
      avg_lat: string;
      avg_lng: string;
    }>)
      .filter(r => r.avg_lat && r.avg_lng)
      .map((r, index) => {
        const permitCount = parseInt(r.permit_count) || 0;
        const permitValue = parseFloat(r.permit_value) || 0;
        const recentCount = parseInt(r.recent_count) || 0;
        const olderCount = parseInt(r.older_count) || 0;

        // Calculate trend
        let trend: 'rising' | 'steady' | 'cooling' = 'steady';
        if (olderCount > 0) {
          const ratio = recentCount / olderCount;
          if (ratio > 1.3) trend = 'rising';
          else if (ratio < 0.7) trend = 'cooling';
        } else if (recentCount > 0) {
          trend = 'rising';
        }

        // Calculate score
        const score = Math.min(100, Math.round(
          (permitCount * 5) + (Math.log10(permitValue + 1) * 3)
        ));

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
          lat: parseFloat(r.avg_lat),
          lng: parseFloat(r.avg_lng),
        };
      });

    return NextResponse.json({
      tracts,
      timeHorizon,
      borough: borough || 'all',
      count: tracts.length,
      source: 'database',
    });
  } catch (error) {
    console.error('Rankings query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rankings', details: String(error) },
      { status: 500 }
    );
  }
}
