import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { permits } from '@/lib/db/schema';
import { sql, and, gte, inArray } from 'drizzle-orm';
import { calculateDistance } from '@/lib/utils/distance';
import { getDateCutoff } from '@/lib/utils/date';
import type { TimeHorizon, PermitData, PermitCategory } from '@/types';

// Map permit types to categories
function categorizePermit(permitType: string): PermitCategory {
  const type = permitType.toLowerCase();
  
  if (type.includes('restaurant') || type.includes('food')) {
    return 'restaurant';
  }
  if (type.includes('liquor') || type.includes('alcohol')) {
    return 'liquor';
  }
  if (type.includes('business') || type.includes('license')) {
    return 'business';
  }
  return 'building';
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const tractParam = searchParams.get('tract');
  const timeHorizon = (searchParams.get('timeHorizon') || '1yr') as TimeHorizon;
  const typesParam = searchParams.get('types');
  const subjectLat = searchParams.get('subjectLat');
  const subjectLng = searchParams.get('subjectLng');

  if (!tractParam) {
    return NextResponse.json(
      { error: 'Census tract ID(s) required' },
      { status: 400 }
    );
  }

  try {
    const tractIds = tractParam.split(',').filter(Boolean);
    const cutoffDate = getDateCutoff(timeHorizon);

    // Build query conditions
    const conditions = [
      inArray(permits.censusTractGeoid, tractIds),
      gte(permits.filingDate, cutoffDate.toISOString().split('T')[0]),
    ];

    // Fetch permits
    const results = await db
      .select()
      .from(permits)
      .where(and(...conditions))
      .limit(500);

    // Transform results
    const hasSubjectCoords = subjectLat && subjectLng;
    const subjectLatNum = hasSubjectCoords ? parseFloat(subjectLat) : 0;
    const subjectLngNum = hasSubjectCoords ? parseFloat(subjectLng) : 0;

    const transformedPermits: PermitData[] = results.map((permit) => {
      const lat = permit.latitude ? parseFloat(permit.latitude) : 0;
      const lng = permit.longitude ? parseFloat(permit.longitude) : 0;
      
      let distanceFromSubject: number | undefined;
      if (hasSubjectCoords && lat && lng) {
        distanceFromSubject = calculateDistance(subjectLatNum, subjectLngNum, lat, lng);
      }

      return {
        id: permit.id.toString(),
        permitNumber: permit.permitNumber,
        permitType: permit.permitType,
        permitSubtype: permit.permitSubtype || undefined,
        description: permit.description || undefined,
        filingDate: permit.filingDate,
        issuanceDate: permit.issuanceDate || undefined,
        estimatedCost: permit.estimatedCost ? parseFloat(permit.estimatedCost) : undefined,
        address: permit.address || 'Address not available',
        borough: permit.borough || undefined,
        latitude: lat,
        longitude: lng,
        distanceFromSubject,
        category: categorizePermit(permit.permitType),
      };
    });

    // Sort by distance if available, otherwise by filing date
    transformedPermits.sort((a, b) => {
      if (a.distanceFromSubject !== undefined && b.distanceFromSubject !== undefined) {
        return a.distanceFromSubject - b.distanceFromSubject;
      }
      return new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime();
    });

    // Calculate statistics
    const byType: Record<string, number> = {};
    const byCategory: Record<PermitCategory, number> = {
      building: 0,
      business: 0,
      restaurant: 0,
      liquor: 0,
    };

    transformedPermits.forEach((permit) => {
      byType[permit.permitType] = (byType[permit.permitType] || 0) + 1;
      byCategory[permit.category]++;
    });

    return NextResponse.json({
      permits: transformedPermits,
      total: transformedPermits.length,
      byType,
      byCategory,
    });
  } catch (error) {
    console.error('Permits query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permits' },
      { status: 500 }
    );
  }
}

