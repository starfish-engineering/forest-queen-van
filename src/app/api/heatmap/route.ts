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
  const limitParam = searchParams.get('limit');
  
  // Allow caller to specify sample size - default higher for smooth coverage
  const limit = limitParam ? parseInt(limitParam) : 8000;

  try {
    const monthsBack = HORIZON_MONTHS[timeHorizon] || 12;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - monthsBack);
    const cutoffDate = cutoff.toISOString().split('T')[0];

    let results;
    
    if (boundsParam) {
      // Parse bounds: sw_lng,sw_lat,ne_lng,ne_lat
      const [swLng, swLat, neLng, neLat] = boundsParam.split(',').map(parseFloat);
      
      if ([swLng, swLat, neLng, neLat].some(isNaN)) {
        return NextResponse.json({ error: 'Invalid bounds' }, { status: 400 });
      }
      
      // Add buffer for edge blending
      const latBuffer = (neLat - swLat) * 0.15;
      const lngBuffer = (neLng - swLng) * 0.15;
      
      // Query with random sampling for even distribution
      results = await db.execute(sql`
        SELECT latitude, longitude, estimated_cost
        FROM permits
        WHERE filing_date >= ${cutoffDate}
          AND latitude BETWEEN ${swLat - latBuffer} AND ${neLat + latBuffer}
          AND longitude BETWEEN ${swLng - lngBuffer} AND ${neLng + lngBuffer}
        ORDER BY RANDOM()
        LIMIT ${limit}
      `);
    } else {
      // City-wide view: sample from all permits
      results = await db.execute(sql`
        SELECT latitude, longitude, estimated_cost
        FROM permits
        WHERE filing_date >= ${cutoffDate}
          AND latitude IS NOT NULL
        ORDER BY RANDOM()
        LIMIT ${limit}
      `);
    }

    // Transform to heatmap points
    const points = (results as unknown as Array<{
      latitude: number | null;
      longitude: number | null;
      estimated_cost: number | null;
    }>)
      .filter(r => r.latitude != null && r.longitude != null)
      .map(r => {
        const cost = r.estimated_cost || 0;
        
        // Weight by capital investment (subtle boost for bigger projects)
        let weight = 1;
        if (cost > 5000000) weight = 2.5;
        else if (cost > 1000000) weight = 2;
        else if (cost > 500000) weight = 1.5;
        else if (cost > 100000) weight = 1.2;

        return {
          latitude: r.latitude!,
          longitude: r.longitude!,
          weight,
        };
      });

    return NextResponse.json({
      points,
      total: points.length,
      sampled: true,
    });
  } catch (error) {
    console.error('Heatmap query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch heatmap data', details: String(error) },
      { status: 500 }
    );
  }
}
