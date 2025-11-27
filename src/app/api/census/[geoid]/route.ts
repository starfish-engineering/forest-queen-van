import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { censusTracts, permits } from '@/lib/db/schema';
import { eq, sql, gte, and, isNotNull } from 'drizzle-orm';
import { getDateCutoff } from '@/lib/utils/date';
import type { TimeHorizon, TractScoreData } from '@/types';

const TIME_HORIZONS: TimeHorizon[] = ['6mo', '1yr', '3yr'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ geoid: string }> }
) {
  const { geoid } = await params;
  const searchParams = request.nextUrl.searchParams;
  const includeAdjacent = searchParams.get('includeAdjacent') === 'true';

  if (!geoid) {
    return NextResponse.json(
      { error: 'Census tract GEOID required' },
      { status: 400 }
    );
  }

  try {
    // Fetch the main tract
    const tractResult = await db
      .select()
      .from(censusTracts)
      .where(eq(censusTracts.geoid, geoid))
      .limit(1);

    if (tractResult.length === 0) {
      return NextResponse.json(
        { error: 'Census tract not found' },
        { status: 404 }
      );
    }

    const tract = tractResult[0];
    const geometry = JSON.parse(tract.geometry);
    const landAreaSqKm = tract.landAreaSqm 
      ? parseFloat(tract.landAreaSqm) / 1_000_000 
      : 0.1;

    // Calculate scores dynamically for each time horizon
    const scores: Record<TimeHorizon, TractScoreData> = {
      '6mo': createDefaultScoreData(),
      '1yr': createDefaultScoreData(),
      '3yr': createDefaultScoreData(),
    };

    for (const horizon of TIME_HORIZONS) {
      const cutoffDate = getDateCutoff(horizon);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      // Count permits within the tract geometry using PostGIS
      const permitStats = await db.execute<{
        count: string;
        total_value: string;
      }>(sql`
        SELECT 
          COUNT(*)::text as count,
          COALESCE(SUM(estimated_cost::numeric), 0)::text as total_value
        FROM permits
        WHERE latitude IS NOT NULL 
          AND longitude IS NOT NULL
          AND filing_date >= ${cutoffStr}
          AND ST_Contains(
            ST_GeomFromGeoJSON(${tract.geometry}),
            ST_SetSRID(ST_MakePoint(longitude::float, latitude::float), 4326)
          )
      `);

      const stats = Array.isArray(permitStats) ? permitStats[0] : null;
      const permitCount = stats ? parseInt(stats.count || '0') : 0;
      const totalValue = stats ? parseFloat(stats.total_value || '0') : 0;
      const permitDensity = permitCount / Math.max(landAreaSqKm, 0.01);

      // Simple scoring: normalize to 0-100 scale
      // Higher permits = higher score, capped at 100
      const compositeScore = Math.min(100, Math.round(
        (permitDensity * 2) + // Density contribution
        (Math.log10(totalValue + 1) * 5) + // Value contribution (log scale)
        (permitCount * 0.5) // Raw count contribution
      ));

        scores[horizon] = {
        permitCount,
        permitValue: totalValue,
        permitDensity: Math.round(permitDensity * 100) / 100,
        businessCount: 0, // Would need business data
        highEndBusinessCount: 0,
        compositeScore,
        };
      }

    const response: {
      tract: {
        geoid: string;
        name: string | null;
        countyFips: string;
        landAreaSqm: string | null;
        geometry: unknown;
        scores: Record<TimeHorizon, TractScoreData>;
      };
      adjacentTracts?: Array<{
        geoid: string;
        name: string | null;
        countyFips: string;
        geometry: unknown;
      }>;
    } = {
      tract: {
        geoid: tract.geoid,
        name: tract.name,
        countyFips: tract.countyFips,
        landAreaSqm: tract.landAreaSqm,
        geometry,
        scores,
      },
    };

    if (includeAdjacent) {
      response.adjacentTracts = [];
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Census tract query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch census tract' },
      { status: 500 }
    );
  }
}

function createDefaultScoreData(): TractScoreData {
  return {
    permitCount: 0,
    permitValue: 0,
    permitDensity: 0,
    businessCount: 0,
    highEndBusinessCount: 0,
    compositeScore: 0,
  };
}

