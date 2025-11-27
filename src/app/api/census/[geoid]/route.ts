import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { censusTracts, tractScores } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { TimeHorizon, TractScoreData } from '@/types';

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

    // Fetch scores for all time horizons
    const scoresResult = await db
      .select()
      .from(tractScores)
      .where(eq(tractScores.censusTractGeoid, geoid));

    const scores: Record<TimeHorizon, TractScoreData> = {
      '6mo': createDefaultScoreData(),
      '1yr': createDefaultScoreData(),
      '3yr': createDefaultScoreData(),
    };

    scoresResult.forEach((score) => {
      const horizon = score.timeHorizon as TimeHorizon;
      if (horizon in scores) {
        scores[horizon] = {
          permitCount: parseInt(score.totalPermits?.toString() || '0'),
          permitValue: parseFloat(score.totalPermitValue?.toString() || '0'),
          permitDensity: parseFloat(score.permitDensity?.toString() || '0'),
          businessCount: parseInt(score.businessCount?.toString() || '0'),
          highEndBusinessCount: parseInt(score.highEndBusinessCount?.toString() || '0'),
          compositeScore: parseFloat(score.compositeScore?.toString() || '0'),
        };
      }
    });

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
        geometry: JSON.parse(tract.geometry),
        scores,
      },
    };

    // Fetch adjacent tracts if requested
    // In production, this would use PostGIS ST_Touches
    // For now, return empty array for adjacent tracts
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

