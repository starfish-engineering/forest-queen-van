import { NextRequest, NextResponse } from 'next/server';
import { queryPermits, transformPermit } from '@/lib/nyc-open-data';
import type { TimeHorizon } from '@/types';

// Map time horizon to months
const HORIZON_MONTHS: Record<TimeHorizon, number> = {
  '6mo': 6,
  '1yr': 12,
  '3yr': 36,
};

// Aggregation levels for LOD
export type AggregationLevel = 'borough' | 'neighborhood' | 'tract';

// Cache for aggregated data (by time horizon + level)
const aggregatedCache = new Map<string, { 
  data: AggregatedPoint[]; 
  timestamp: number;
}>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface AggregatedPoint {
  key: string;
  borough?: string;
  nta?: string;
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

  const cacheKey = `${timeHorizon}-${level}`;

  try {
    // Check cache
    const cached = aggregatedCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return NextResponse.json({
        points: cached.data,
        count: cached.data.length,
        level,
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
      limit: 25000,
    });

    // Aggregate based on level
    const pointMap = new Map<string, {
      key: string;
      borough?: string;
      nta?: string;
      censusTract?: string;
      permitCount: number;
      totalCapital: number;
      lats: number[];
      lngs: number[];
    }>();

    for (const permit of permits) {
      let key: string;
      let borough: string | undefined;
      let nta: string | undefined;
      let censusTract: string | undefined;

      // Determine grouping key based on level
      if (level === 'borough') {
        key = permit.borough || 'unknown';
        borough = permit.borough;
      } else if (level === 'neighborhood') {
        key = permit.nta || permit.borough || 'unknown';
        nta = permit.nta;
        borough = permit.borough;
      } else {
        // tract level
        key = permit.census_tract || permit.nta || 'unknown';
        censusTract = permit.census_tract;
        nta = permit.nta;
        borough = permit.borough;
      }

      if (key === 'unknown') continue;

      const transformed = transformPermit(permit);
      if (!transformed.latitude || !transformed.longitude) continue;

      const existing = pointMap.get(key) || {
        key,
        borough,
        nta,
        censusTract,
        permitCount: 0,
        totalCapital: 0,
        lats: [],
        lngs: [],
      };

      existing.permitCount++;
      existing.totalCapital += transformed.estimatedCost || 0;
      existing.lats.push(transformed.latitude);
      existing.lngs.push(transformed.longitude);

      pointMap.set(key, existing);
    }

    // Convert to array with averaged coordinates
    const aggregated: AggregatedPoint[] = Array.from(pointMap.values())
      .filter(t => t.permitCount >= 1 && t.lats.length > 0)
      .map(t => {
        // For borough level, use predefined centers for better visualization
        let lat = t.lats.reduce((a, b) => a + b, 0) / t.lats.length;
        let lng = t.lngs.reduce((a, b) => a + b, 0) / t.lngs.length;
        
        if (level === 'borough' && t.borough && BOROUGH_CENTERS[t.borough]) {
          lat = BOROUGH_CENTERS[t.borough].lat;
          lng = BOROUGH_CENTERS[t.borough].lng;
        }

        return {
          key: t.key,
          borough: t.borough,
          nta: t.nta,
          censusTract: t.censusTract,
          permitCount: t.permitCount,
          totalCapital: t.totalCapital,
          lat,
          lng,
        };
      });

    // Cache the result
    aggregatedCache.set(cacheKey, {
      data: aggregated,
      timestamp: Date.now(),
    });

    console.log(`Aggregated heatmap (${level}): ${aggregated.length} points from ${permits.length} permits`);

    return NextResponse.json({
      points: aggregated,
      count: aggregated.length,
      level,
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
