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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const boundsParam = searchParams.get('bounds');
  const timeHorizon = (searchParams.get('timeHorizon') || '1yr') as TimeHorizon;

  try {
    // Parse bounds if provided: sw_lng,sw_lat,ne_lng,ne_lat
    let bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number } | undefined;
    
    if (boundsParam) {
      const [swLng, swLat, neLng, neLat] = boundsParam.split(',').map(parseFloat);
      if (![swLng, swLat, neLng, neLat].some(isNaN)) {
        // Add 20% buffer around viewport
        const latBuffer = (neLat - swLat) * 0.2;
        const lngBuffer = (neLng - swLng) * 0.2;
        bounds = {
          minLat: swLat - latBuffer,
          maxLat: neLat + latBuffer,
          minLng: swLng - lngBuffer,
          maxLng: neLng + lngBuffer,
        };
      }
    }

    const monthsBack = HORIZON_MONTHS[timeHorizon] || 12;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - monthsBack);
    const cutoffDate = cutoff.toISOString().split('T')[0];

    // Build bounds filter
    const boundsFilter = bounds 
      ? sql`AND CAST(latitude AS NUMERIC) BETWEEN ${bounds.minLat} AND ${bounds.maxLat}
            AND CAST(longitude AS NUMERIC) BETWEEN ${bounds.minLng} AND ${bounds.maxLng}`
      : sql``;

    // Query permits from database
    const results = await db.execute(sql`
      SELECT 
        latitude,
        longitude,
        estimated_cost
      FROM permits
      WHERE filing_date >= ${cutoffDate}
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        ${boundsFilter}
      ORDER BY filing_date DESC
      LIMIT 2000
    `);

    // Transform to heatmap points - db.execute returns array directly
    const points = (results as unknown as Array<{
      latitude: string;
      longitude: string;
      estimated_cost: string | null;
    }>)
      .filter(r => r.latitude && r.longitude)
      .map(r => {
        const cost = parseFloat(r.estimated_cost || '0') || 0;
        
        // Weight by capital investment
        let weight = 2;
        if (cost > 1000000) weight = 10;
        else if (cost > 500000) weight = 8;
        else if (cost > 100000) weight = 6;
        else if (cost > 50000) weight = 4;

        return {
          latitude: parseFloat(r.latitude),
          longitude: parseFloat(r.longitude),
          weight,
        };
      });

    return NextResponse.json({
      points,
      total: points.length,
      source: 'database',
    });
  } catch (error) {
    console.error('Heatmap query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch heatmap data', details: String(error) },
      { status: 500 }
    );
  }
}
