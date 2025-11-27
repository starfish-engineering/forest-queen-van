import { NextRequest, NextResponse } from 'next/server';
import { queryPermits, transformPermit } from '@/lib/nyc-open-data';
import type { TimeHorizon } from '@/types';

// Map time horizon to months
const HORIZON_MONTHS: Record<TimeHorizon, number> = {
  '6mo': 6,
  '1yr': 12,
  '3yr': 36,
};

// Cache for aggregated data (by time horizon)
const aggregatedCache = new Map<string, { 
  data: AggregatedTract[]; 
  timestamp: number;
}>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface AggregatedTract {
  nta: string;
  censusTract: string;
  permitCount: number;
  totalCapital: number;
  lat: number;
  lng: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const timeHorizon = (searchParams.get('timeHorizon') || '1yr') as TimeHorizon;

  try {
    // Check cache
    const cached = aggregatedCache.get(timeHorizon);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return NextResponse.json({
        tracts: cached.data,
        count: cached.data.length,
        cached: true,
      });
    }

    const monthsBack = HORIZON_MONTHS[timeHorizon] || 12;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - monthsBack);
    const sinceDate = cutoff.toISOString().split('T')[0];

    // Fetch permits (limited for aggregation)
    const permits = await queryPermits({
      sinceDate,
      limit: 20000,
    });

    // Aggregate by NTA (Neighborhood Tabulation Area) or census tract
    const tractMap = new Map<string, {
      nta: string;
      censusTract: string;
      permitCount: number;
      totalCapital: number;
      lats: number[];
      lngs: number[];
    }>();

    for (const permit of permits) {
      // Use NTA as primary key, fall back to census tract
      const key = permit.nta || permit.census_tract || 'unknown';
      if (key === 'unknown') continue;

      const transformed = transformPermit(permit);
      if (!transformed.latitude || !transformed.longitude) continue;

      const existing = tractMap.get(key) || {
        nta: permit.nta || '',
        censusTract: permit.census_tract || '',
        permitCount: 0,
        totalCapital: 0,
        lats: [],
        lngs: [],
      };

      existing.permitCount++;
      existing.totalCapital += transformed.estimatedCost || 0;
      existing.lats.push(transformed.latitude);
      existing.lngs.push(transformed.longitude);

      tractMap.set(key, existing);
    }

    // Convert to array with averaged coordinates
    const aggregated: AggregatedTract[] = Array.from(tractMap.values())
      .filter(t => t.permitCount >= 1 && t.lats.length > 0)
      .map(t => ({
        nta: t.nta,
        censusTract: t.censusTract,
        permitCount: t.permitCount,
        totalCapital: t.totalCapital,
        lat: t.lats.reduce((a, b) => a + b, 0) / t.lats.length,
        lng: t.lngs.reduce((a, b) => a + b, 0) / t.lngs.length,
      }));

    // Cache the result
    aggregatedCache.set(timeHorizon, {
      data: aggregated,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      tracts: aggregated,
      count: aggregated.length,
      cached: false,
    });
  } catch (error) {
    console.error('Aggregated heatmap error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aggregated data', details: String(error) },
      { status: 500 }
    );
  }
}

