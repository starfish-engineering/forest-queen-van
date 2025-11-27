import { NextRequest, NextResponse } from 'next/server';
import { getRankingsData, transformPermit } from '@/lib/nyc-open-data';
import type { TimeHorizon } from '@/types';

// Borough info - DOB NOW uses full uppercase names
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
  const borough = searchParams.get('borough'); // optional filter
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const monthsBack = HORIZON_MONTHS[timeHorizon] || 12;
    
    // Calculate midpoint for trend analysis
    const midpoint = new Date();
    midpoint.setMonth(midpoint.getMonth() - Math.floor(monthsBack / 2));
    const midpointStr = midpoint.toISOString().split('T')[0];

    // Fetch live data from NYC Open Data
    const permits = await getRankingsData({
      monthsBack,
      borough: borough && borough !== 'all' ? borough : undefined,
    });

    // Aggregate by block
    const blockStats = new Map<string, {
      borough: string;
      block: string;
      permitCount: number;
      permitValue: number;
      recentCount: number;
      olderCount: number;
      lats: number[];
      lngs: number[];
    }>();

    for (const permit of permits) {
      if (!permit.block || !permit.gis_latitude || !permit.gis_longitude) continue;
      
      const key = `${permit.borough}-${permit.block}`;
      const existing = blockStats.get(key) || {
        borough: permit.borough || '1',
        block: permit.block,
        permitCount: 0,
        permitValue: 0,
        recentCount: 0,
        olderCount: 0,
        lats: [],
        lngs: [],
      };

      const transformed = transformPermit(permit);
      const filingDate = permit.filing_date?.split('T')[0] || '';
      
      existing.permitCount++;
      existing.permitValue += transformed.estimatedCost || 0;
      existing.lats.push(transformed.latitude!);
      existing.lngs.push(transformed.longitude!);
      
      if (filingDate >= midpointStr) {
        existing.recentCount++;
      } else {
        existing.olderCount++;
      }
      
      blockStats.set(key, existing);
    }

    // Convert to ranked array
    const ranked = Array.from(blockStats.values())
      .filter(b => b.permitCount >= 2) // At least 2 permits
      .sort((a, b) => b.permitCount - a.permitCount || b.permitValue - a.permitValue)
      .slice(0, limit);

    // Format as RankedTract
    const tracts: RankedTract[] = ranked.map((block, index) => {
      // Calculate trend
      let trend: 'rising' | 'steady' | 'cooling' = 'steady';
      if (block.olderCount > 0) {
        const ratio = block.recentCount / block.olderCount;
        if (ratio > 1.3) trend = 'rising';
        else if (ratio < 0.7) trend = 'cooling';
      } else if (block.recentCount > 0) {
        trend = 'rising';
      }

      // Calculate score
      const score = Math.min(100, Math.round(
        (block.permitCount * 5) +
        (Math.log10(block.permitValue + 1) * 3)
      ));

      // Average lat/lng
      const lat = block.lats.reduce((a, b) => a + b, 0) / block.lats.length;
      const lng = block.lngs.reduce((a, b) => a + b, 0) / block.lngs.length;

      const boroughInfo = BOROUGHS[block.borough] || { name: 'NYC', fips: '36061' };

      return {
        rank: index + 1,
        geoid: `${boroughInfo.fips}${block.block.padStart(6, '0')}`,
        name: `Block ${block.block}`,
        borough: boroughInfo.name,
        score,
        permitCount: block.permitCount,
        permitValue: block.permitValue,
        trend,
        lat,
        lng,
      };
    });

    return NextResponse.json({
      tracts,
      timeHorizon,
      borough: borough || 'all',
      count: tracts.length,
      source: 'live',
    });
  } catch (error) {
    console.error('Rankings query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rankings', details: String(error) },
      { status: 500 }
    );
  }
}
