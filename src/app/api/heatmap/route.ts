import { NextRequest, NextResponse } from 'next/server';
import { getHeatmapPermits, transformPermit } from '@/lib/nyc-open-data';
import type { TimeHorizon } from '@/types';

// Map time horizon to months
const HORIZON_MONTHS: Record<TimeHorizon, number> = {
  '6mo': 6,
  '1yr': 12,
  '3yr': 36,
};

// Simple in-memory cache for permit data (refreshes every 5 min)
let permitCache: { data: Awaited<ReturnType<typeof getHeatmapPermits>>; timestamp: number; timeHorizon: string } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

    // Check cache - reuse if fresh and same time horizon
    const now = Date.now();
    let permits;
    
    if (permitCache && 
        permitCache.timeHorizon === timeHorizon && 
        (now - permitCache.timestamp) < CACHE_TTL) {
      permits = permitCache.data;
    } else {
      // Fetch fresh data from NYC Open Data
      permits = await getHeatmapPermits({ monthsBack });
      permitCache = { data: permits, timestamp: now, timeHorizon };
    }

    // Apply viewport filtering client-side for fast response
    let filteredPermits = permits;
    if (bounds) {
      // Add 20% buffer around viewport
      const latBuffer = (bounds.maxLat - bounds.minLat) * 0.2;
      const lngBuffer = (bounds.maxLng - bounds.minLng) * 0.2;
      
      filteredPermits = permits.filter(p => {
        if (!p.gis_latitude || !p.gis_longitude) return false;
        const lat = parseFloat(p.gis_latitude);
        const lng = parseFloat(p.gis_longitude);
        return (
          lat >= bounds!.minLat - latBuffer &&
          lat <= bounds!.maxLat + latBuffer &&
          lng >= bounds!.minLng - lngBuffer &&
          lng <= bounds!.maxLng + lngBuffer
        );
      });
    }

    // Transform to heatmap points with weight based on capital
    const points = filteredPermits
      .filter(p => p.gis_latitude && p.gis_longitude)
      .map(p => {
        const transformed = transformPermit(p);
        const cost = transformed.estimatedCost || 0;
        
        // Weight by capital investment
        let weight = 1;
        if (cost > 1000000) weight = 5;      // $1M+ = max intensity
        else if (cost > 500000) weight = 4;  // $500K-1M
        else if (cost > 100000) weight = 3;  // $100K-500K
        else if (cost > 50000) weight = 2;   // $50K-100K

        return {
          latitude: transformed.latitude!,
          longitude: transformed.longitude!,
          weight,
        };
      });

    return NextResponse.json({
      points,
      total: points.length,
      cached: permitCache?.timestamp === now ? false : true,
    });
  } catch (error) {
    console.error('Heatmap query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch heatmap data', details: String(error) },
      { status: 500 }
    );
  }
}

