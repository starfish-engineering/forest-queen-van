import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { sql } from 'drizzle-orm';
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
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - monthsBack);
    const cutoffDate = cutoff.toISOString().split('T')[0];

    // Calculate bounding box
    const minLat = lat - radius;
    const maxLat = lat + radius;
    const minLng = lng - radius;
    const maxLng = lng + radius;

    // Build type filter
    const typeFilter = permitTypesToInclude && permitTypesToInclude.length > 0
      ? sql`AND job_type IN (${sql.join(permitTypesToInclude.map(t => sql`${t}`), sql`, `)})`
      : sql``;

    // Query permits from database
    const results = await db.execute(sql`
      SELECT 
        id,
        permit_number,
        job_type,
        permit_subtype,
        description,
        filing_date,
        address,
        borough,
        estimated_cost,
        latitude,
        longitude
      FROM permits
      WHERE filing_date >= ${cutoffDate}
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND CAST(latitude AS NUMERIC) BETWEEN ${minLat} AND ${maxLat}
        AND CAST(longitude AS NUMERIC) BETWEEN ${minLng} AND ${maxLng}
        ${typeFilter}
      ORDER BY filing_date DESC
      LIMIT ${limit}
    `);

    // Transform to GeoJSON
    const features = (results as unknown as Array<{
      id: string;
      permit_number: string | null;
      job_type: string | null;
      permit_subtype: string | null;
      description: string | null;
      filing_date: string | null;
      address: string | null;
      borough: string | null;
      estimated_cost: string | null;
      latitude: string;
      longitude: string;
    }>)
      .filter(r => r.latitude && r.longitude)
      .map(r => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [parseFloat(r.longitude), parseFloat(r.latitude)],
        },
        properties: {
          id: r.id,
          permitNumber: r.permit_number,
          permitType: r.job_type || 'Unknown',
          permitSubtype: r.permit_subtype,
          description: r.description,
          filingDate: r.filing_date,
          address: r.address,
          borough: r.borough,
          estimatedCost: parseFloat(r.estimated_cost || '0') || 0,
        },
      }));

    return NextResponse.json({
      type: 'FeatureCollection' as const,
      features,
      source: 'database',
    });
  } catch (error) {
    console.error('Nearby permits query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permits', details: String(error) },
      { status: 500 }
    );
  }
}
