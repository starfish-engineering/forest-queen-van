import { NextRequest, NextResponse } from 'next/server';
import { getHeatmapPermits, transformPermit } from '@/lib/nyc-open-data';
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
        bounds = {
          minLat: swLat,
          maxLat: neLat,
          minLng: swLng,
          maxLng: neLng,
        };
      }
    }

    const monthsBack = HORIZON_MONTHS[timeHorizon] || 12;

    // Fetch live data from NYC Open Data
    const permits = await getHeatmapPermits({
      bounds,
      monthsBack,
    });

    // Transform to heatmap points with weight
    const points = permits
      .filter(p => p.gis_latitude && p.gis_longitude)
      .map(p => {
        const transformed = transformPermit(p);
        const cost = transformed.estimatedCost || 0;
        
        // Calculate weight based on estimated cost
        let weight = 1;
        if (cost > 1000000) weight = 5;
        else if (cost > 500000) weight = 4;
        else if (cost > 100000) weight = 3;
        else if (cost > 50000) weight = 2;

        return {
          latitude: transformed.latitude!,
          longitude: transformed.longitude!,
          weight,
        };
      });

    return NextResponse.json({
      points,
      total: points.length,
      source: 'live', // Indicate this is live data
    });
  } catch (error) {
    console.error('Heatmap query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch heatmap data', details: String(error) },
      { status: 500 }
    );
  }
}

