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
  
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseFloat(searchParams.get('radius') || '0.01');
  const limit = parseInt(searchParams.get('limit') || '300');
  const timeHorizon = (searchParams.get('timeHorizon') || '1yr') as TimeHorizon;

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'lat and lng required' },
      { status: 400 }
    );
  }

  try {
    const monthsBack = HORIZON_MONTHS[timeHorizon] || 12;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - monthsBack);
    const cutoffDate = cutoff.toISOString().split('T')[0];

    // Calculate bounding box
    const minLat = lat - radius;
    const maxLat = lat + radius;
    const minLng = lng - radius;
    const maxLng = lng + radius;

    // Query permits from database - random sample across time range
    // Using TABLESAMPLE or random ordering to get diverse dates, not just recent
    const results = await db.execute(sql`
      SELECT 
        id,
        permit_number,
        permit_type,
        permit_subtype,
        description,
        filing_date,
        address,
        borough,
        estimated_cost,
        latitude,
        longitude
      FROM permits
      WHERE latitude BETWEEN ${minLat.toString()} AND ${maxLat.toString()}
        AND longitude BETWEEN ${minLng.toString()} AND ${maxLng.toString()}
        AND filing_date >= ${cutoffDate}
      ORDER BY RANDOM()
      LIMIT ${limit}
    `);

    // Transform to GeoJSON
    const features = (results as unknown as Array<{
      id: string;
      permit_number: string | null;
      permit_type: string | null;
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
          permitType: r.permit_type || 'Unknown',
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
