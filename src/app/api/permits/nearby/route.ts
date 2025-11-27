import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { permits } from '@/lib/db/schema';
import { sql, and, gte, lte, isNotNull, inArray } from 'drizzle-orm';

// Map filter categories to actual permit types
const PERMIT_TYPE_MAP: Record<string, string[]> = {
  // Building filters
  newConstruction: ['NB'],           // New Building
  majorRenovation: ['A1'],           // Alteration Type 1 (major)
  commercialTi: ['A2'],              // Alteration Type 2 (tenant improvement)
  multifamily: ['A3'],               // Alteration Type 3 (minor/cosmetic)
  // Additional permit types for completeness
  demolition: ['DM'],
  equipment: ['EW', 'EQ'],
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseFloat(searchParams.get('radius') || '0.01'); // ~1km default
  const limit = parseInt(searchParams.get('limit') || '200');
  const types = searchParams.get('types'); // comma-separated filter IDs

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

    // Build list of permit types to include based on filters
    let permitTypesToInclude: string[] | null = null;
    if (types) {
      const filterIds = types.split(',');
      permitTypesToInclude = filterIds.flatMap(id => PERMIT_TYPE_MAP[id] || []);
      // If no valid mappings, include all types
      if (permitTypesToInclude.length === 0) {
        permitTypesToInclude = null;
      }
    }

    // Build where conditions
    const conditions = [
      isNotNull(permits.latitude),
      isNotNull(permits.longitude),
      gte(sql`CAST(${permits.latitude} AS NUMERIC)`, minLat),
      lte(sql`CAST(${permits.latitude} AS NUMERIC)`, maxLat),
      gte(sql`CAST(${permits.longitude} AS NUMERIC)`, minLng),
      lte(sql`CAST(${permits.longitude} AS NUMERIC)`, maxLng),
    ];

    // Add type filter if specified
    if (permitTypesToInclude && permitTypesToInclude.length > 0) {
      conditions.push(inArray(permits.permitType, permitTypesToInclude));
    }

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
      .where(and(...conditions))
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

