import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { permits } from '@/lib/db/schema';
import { sql, and, gte, lte, isNotNull } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseFloat(searchParams.get('radius') || '0.01'); // ~1km default
  const limit = parseInt(searchParams.get('limit') || '200');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'lat and lng required' },
      { status: 400 }
    );
  }

  try {
    // Simple bounding box query
    const minLat = lat - radius;
    const maxLat = lat + radius;
    const minLng = lng - radius;
    const maxLng = lng + radius;

    const results = await db
      .select({
        id: permits.id,
        permitNumber: permits.permitNumber,
        permitType: permits.permitType,
        permitSubtype: permits.permitSubtype,
        description: permits.description,
        filingDate: permits.filingDate,
        address: permits.address,
        borough: permits.borough,
        latitude: permits.latitude,
        longitude: permits.longitude,
        estimatedCost: permits.estimatedCost,
      })
      .from(permits)
      .where(
        and(
          isNotNull(permits.latitude),
          isNotNull(permits.longitude),
          gte(sql`CAST(${permits.latitude} AS NUMERIC)`, minLat),
          lte(sql`CAST(${permits.latitude} AS NUMERIC)`, maxLat),
          gte(sql`CAST(${permits.longitude} AS NUMERIC)`, minLng),
          lte(sql`CAST(${permits.longitude} AS NUMERIC)`, maxLng)
        )
      )
      .limit(limit);

    // Transform to GeoJSON for easy map rendering
    const geojson = {
      type: 'FeatureCollection' as const,
      features: results.map((p) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [parseFloat(p.longitude!), parseFloat(p.latitude!)],
        },
        properties: {
          id: p.id,
          permitNumber: p.permitNumber,
          permitType: p.permitType,
          permitSubtype: p.permitSubtype,
          description: p.description,
          filingDate: p.filingDate,
          address: p.address,
          borough: p.borough,
          estimatedCost: p.estimatedCost,
        },
      })),
    };

    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Nearby permits query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permits' },
      { status: 500 }
    );
  }
}

