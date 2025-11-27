import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { censusTracts } from '@/lib/db/schema';

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

    // Step 2: Find the census tract containing this point
    // For MVP, we'll return a placeholder tract until PostGIS queries are set up
    // In production, this would use ST_Contains with the geometry column
    
    let censusTract = null;
    let adjacentTracts: Array<{ geoid: string; name: string }> = [];

    // Query for tracts (simplified for initial setup - will use PostGIS in production)
    const tractResult = await db
      .select()
      .from(censusTracts)
      .limit(1);

    if (tractResult.length > 0) {
      const tract = tractResult[0];

      censusTract = {
        geoid: tract.geoid,
        name: tract.name || `Census Tract ${tract.geoid}`,
        countyFips: tract.countyFips,
        landAreaSqm: tract.landAreaSqm ? parseFloat(tract.landAreaSqm) : null,
        geometry: JSON.parse(tract.geometry),
      };

      // For adjacent tracts, we'd use ST_Touches in production
      // For now, return empty array
      adjacentTracts = [];
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
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

