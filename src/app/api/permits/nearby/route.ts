import { NextRequest, NextResponse } from 'next/server';
import { getNearbyPermits, transformPermit } from '@/lib/nyc-open-data';
import type { TimeHorizon } from '@/types';

// Map filter categories to actual permit types
const PERMIT_TYPE_MAP: Record<string, string[]> = {
  newConstruction: ['NB'],
  majorRenovation: ['A1'],
  commercialTi: ['A2'],
  multifamily: ['A3'],
  demolition: ['DM'],
  equipment: ['EW', 'EQ'],
};

// Map time horizon to months
const HORIZON_MONTHS: Record<TimeHorizon, number> = {
  '6mo': 6,
  '1yr': 12,
  '3yr': 36,
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseFloat(searchParams.get('radius') || '0.01');
  const limit = parseInt(searchParams.get('limit') || '300');
  const types = searchParams.get('types');
  const timeHorizon = (searchParams.get('timeHorizon') || '1yr') as TimeHorizon;

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'lat and lng required' },
      { status: 400 }
    );
  }

  try {
    // Build list of permit types to include based on filters
    let permitTypesToInclude: string[] | null = null;
    if (types) {
      const filterIds = types.split(',');
      permitTypesToInclude = filterIds.flatMap(id => PERMIT_TYPE_MAP[id] || []);
      if (permitTypesToInclude.length === 0) {
        permitTypesToInclude = null;
      }
    }

    const monthsBack = HORIZON_MONTHS[timeHorizon] || 12;

    // Fetch live data from NYC Open Data
    const permits = await getNearbyPermits({
      lat,
      lng,
      radiusDegrees: radius,
      monthsBack,
      limit,
    });

    // Apply client-side type filtering if needed
    let filteredPermits = permits;
    if (permitTypesToInclude && permitTypesToInclude.length > 0) {
      filteredPermits = permits.filter(p => 
        permitTypesToInclude!.includes(p.permit_type)
      );
    }

    // Transform to GeoJSON for easy map rendering
    const geojson = {
      type: 'FeatureCollection' as const,
      features: filteredPermits
        .filter(p => p.gis_latitude && p.gis_longitude)
        .map((p) => {
          const transformed = transformPermit(p);
          return {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
              coordinates: [transformed.longitude!, transformed.latitude!],
        },
        properties: {
              id: transformed.id,
              permitNumber: transformed.permitNumber,
              permitType: transformed.permitType,
              permitSubtype: transformed.permitSubtype,
              description: transformed.description,
              filingDate: transformed.filingDate,
              address: transformed.address,
              borough: transformed.borough,
              estimatedCost: transformed.estimatedCost,
        },
          };
        }),
    };

    return NextResponse.json({
      ...geojson,
      source: 'live',
    });
  } catch (error) {
    console.error('Nearby permits query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permits', details: String(error) },
      { status: 500 }
    );
  }
}

