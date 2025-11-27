import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { sql } from 'drizzle-orm';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// NYC bounding box
const NYC_BBOX = '-74.259,40.477,-73.700,40.917';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 3) {
    return NextResponse.json(
      { error: 'Query must be at least 3 characters' },
      { status: 400 }
    );
  }

  try {
    // Step 1: Geocode the address using Mapbox
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
      `access_token=${MAPBOX_TOKEN}&` +
      `bbox=${NYC_BBOX}&` +
      `types=address&` +
      `limit=1`;

    const geocodeRes = await fetch(geocodeUrl);
    if (!geocodeRes.ok) {
      throw new Error('Geocoding failed');
    }

    const geocodeData = await geocodeRes.json();
    
    if (!geocodeData.features || geocodeData.features.length === 0) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    const feature = geocodeData.features[0];
    const [longitude, latitude] = feature.center;
    const formattedAddress = feature.place_name;

    // Step 2: Find the census tract containing this point using PostGIS
    let censusTract = null;
    let adjacentTracts: Array<{ geoid: string; name: string }> = [];

    // PostGIS point-in-polygon query
    const tractResult = await db.execute<{
      geoid: string;
      name: string | null;
      county_fips: string;
      land_area_sqm: string | null;
      geometry: string;
    }>(sql`
      SELECT 
        geoid, 
        name, 
        county_fips,
        land_area_sqm,
        geometry
      FROM census_tracts 
      WHERE ST_Contains(
        ST_GeomFromGeoJSON(geometry), 
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      )
      LIMIT 1
    `);

    // db.execute returns array directly with postgres-js driver
    const tractRows = Array.isArray(tractResult) ? tractResult : [];

    if (tractRows.length > 0) {
      const tract = tractRows[0];

      censusTract = {
        geoid: tract.geoid,
        name: tract.name || `Census Tract ${tract.geoid}`,
        countyFips: tract.county_fips,
        landAreaSqm: tract.land_area_sqm ? parseFloat(tract.land_area_sqm) : null,
        geometry: JSON.parse(tract.geometry),
      };

      // Step 3: Find adjacent tracts using PostGIS ST_Touches
      const adjacentResult = await db.execute<{
        geoid: string;
        name: string | null;
      }>(sql`
        SELECT 
          geoid, 
          name
        FROM census_tracts 
        WHERE ST_Touches(
          ST_GeomFromGeoJSON(geometry),
          ST_GeomFromGeoJSON(${tract.geometry})
        )
        AND geoid != ${tract.geoid}
        LIMIT 10
      `);

      const adjacentRows = Array.isArray(adjacentResult) ? adjacentResult : [];
      adjacentTracts = adjacentRows.map((r) => ({
        geoid: r.geoid,
        name: r.name || `Census Tract ${r.geoid}`,
      }));
    }

    return NextResponse.json({
      address: {
        formatted: formattedAddress,
        latitude,
        longitude,
      },
      censusTract,
      adjacentTracts,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

