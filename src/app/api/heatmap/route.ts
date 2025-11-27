import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { permits } from '@/lib/db/schema';
import { sql, and, gte, lte, isNotNull } from 'drizzle-orm';
import { getDateCutoff } from '@/lib/utils/date';
import type { TimeHorizon } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const boundsParam = searchParams.get('bounds');
  const timeHorizon = (searchParams.get('timeHorizon') || '1yr') as TimeHorizon;

  if (!boundsParam) {
    return NextResponse.json(
      { error: 'Viewport bounds required' },
      { status: 400 }
    );
  }

  try {
    // Parse bounds: sw_lng,sw_lat,ne_lng,ne_lat
    const [swLng, swLat, neLng, neLat] = boundsParam.split(',').map(parseFloat);

    if ([swLng, swLat, neLng, neLat].some(isNaN)) {
      return NextResponse.json(
        { error: 'Invalid bounds format' },
        { status: 400 }
      );
    }

    const cutoffDate = getDateCutoff(timeHorizon);

    // Query permits within bounds
    const results = await db
      .select({
        latitude: permits.latitude,
        longitude: permits.longitude,
        estimatedCost: permits.estimatedCost,
      })
      .from(permits)
      .where(
        and(
          gte(permits.filingDate, cutoffDate.toISOString().split('T')[0]),
          isNotNull(permits.latitude),
          isNotNull(permits.longitude),
          gte(permits.latitude, swLat.toString()),
          lte(permits.latitude, neLat.toString()),
          gte(permits.longitude, swLng.toString()),
          lte(permits.longitude, neLng.toString())
        )
      )
      .limit(5000); // Limit for performance

    // Transform to heatmap points with weight
    const points = results
      .filter((r) => r.latitude && r.longitude)
      .map((r) => {
        // Calculate weight based on estimated cost
        const cost = r.estimatedCost ? parseFloat(r.estimatedCost) : 0;
        let weight = 1;
        
        if (cost > 1000000) weight = 5;
        else if (cost > 500000) weight = 4;
        else if (cost > 100000) weight = 3;
        else if (cost > 50000) weight = 2;

        return {
          latitude: parseFloat(r.latitude!),
          longitude: parseFloat(r.longitude!),
          weight,
        };
      });

    return NextResponse.json({
      points,
      total: points.length,
    });
  } catch (error) {
    console.error('Heatmap query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch heatmap data' },
      { status: 500 }
    );
  }
}

