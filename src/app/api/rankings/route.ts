import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { sql } from 'drizzle-orm';
import { getDateCutoff } from '@/lib/utils/date';
import type { TimeHorizon } from '@/types';

// Borough info
const BOROUGHS = {
  '1': { name: 'Manhattan', fips: '36061' },
  '2': { name: 'Bronx', fips: '36005' },
  '3': { name: 'Brooklyn', fips: '36047' },
  '4': { name: 'Queens', fips: '36081' },
  '5': { name: 'Staten Island', fips: '36085' },
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
  const borough = searchParams.get('borough'); // optional filter
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const cutoffDate = getDateCutoff(timeHorizon);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];
    
    // For trend calculation - compare recent vs older period
    const midpointDate = new Date(cutoffDate);
    midpointDate.setTime(midpointDate.getTime() + (Date.now() - cutoffDate.getTime()) / 2);
    const midpointStr = midpointDate.toISOString().split('T')[0];

    // Build borough filter if specified
    let boroughFilter = '';
    if (borough && borough !== 'all') {
      const boroughMap: Record<string, string> = {
        manhattan: '1',
        bronx: '2',
        brooklyn: '3',
        queens: '4',
        'staten-island': '5',
      };
      if (boroughMap[borough]) {
        boroughFilter = `AND borough = '${boroughMap[borough]}'`;
      }
    }

    // Fast query: aggregate permits by neighborhood using address/BIN clustering
    // Group by (block, lot) to approximate neighborhood activity without expensive spatial joins
    const results = await db.execute<{
      borough: string;
      block: string;
      permit_count: string;
      permit_value: string;
      recent_count: string;
      older_count: string;
      lat: string;
      lng: string;
    }>(sql`
      SELECT 
        borough,
        block,
        COUNT(*)::text as permit_count,
        COALESCE(SUM(estimated_cost::numeric), 0)::text as permit_value,
        COUNT(CASE WHEN filing_date >= ${midpointStr} THEN 1 END)::text as recent_count,
        COUNT(CASE WHEN filing_date < ${midpointStr} THEN 1 END)::text as older_count,
        AVG(latitude::float)::text as lat,
        AVG(longitude::float)::text as lng
      FROM permits
      WHERE filing_date >= ${cutoffStr}
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND block IS NOT NULL
        ${sql.raw(boroughFilter)}
      GROUP BY borough, block
      HAVING COUNT(*) >= 2
      ORDER BY COUNT(*) DESC, SUM(estimated_cost::numeric) DESC
      LIMIT ${limit}
    `);

    // Convert to ranked tracts format
    const tracts: RankedTract[] = (Array.isArray(results) ? results : []).map((row, index) => {
      const permitCount = parseInt(row.permit_count || '0');
      const permitValue = parseFloat(row.permit_value || '0');
      const recentCount = parseInt(row.recent_count || '0');
      const olderCount = parseInt(row.older_count || '0');
      
      // Calculate trend
      let trend: 'rising' | 'steady' | 'cooling' = 'steady';
      if (olderCount > 0) {
        const ratio = recentCount / olderCount;
        if (ratio > 1.3) trend = 'rising';
        else if (ratio < 0.7) trend = 'cooling';
      } else if (recentCount > 0) {
        trend = 'rising';
      }

      // Calculate score (simplified)
      const score = Math.min(100, Math.round(
        (permitCount * 5) +
        (Math.log10(permitValue + 1) * 3)
      ));

      const boroughInfo = BOROUGHS[row.borough as keyof typeof BOROUGHS] || { name: 'NYC', fips: '36061' };
      
      return {
        rank: index + 1,
        geoid: `${boroughInfo.fips}${row.block.padStart(6, '0')}`,
        name: `Block ${row.block}`,
        borough: boroughInfo.name,
        score,
        permitCount,
        permitValue,
        trend,
        lat: parseFloat(row.lat || '40.7128'),
        lng: parseFloat(row.lng || '-73.9856'),
      };
    });

    return NextResponse.json({
      tracts,
      timeHorizon,
      borough: borough || 'all',
      count: tracts.length,
    });
  } catch (error) {
    console.error('Rankings query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rankings' },
      { status: 500 }
    );
  }
}
