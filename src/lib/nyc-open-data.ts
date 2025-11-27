/**
 * NYC Open Data Live API Client
 * 
 * Queries DOB NOW: Build – Job Application Filings directly from Socrata API.
 * This dataset is updated daily with the latest permit filings.
 * 
 * Rate limits (without app token): ~1000 requests/hour
 * Rate limits (with app token): ~10000 requests/hour
 * Max results per request: 50000
 */

// DOB NOW: Build – Job Application Filings (updated daily, has recent data!)
const DOB_PERMITS_ENDPOINT = 'https://data.cityofnewyork.us/resource/w9ak-ipjd.json';
const APP_TOKEN = process.env.NYC_OPEN_DATA_APP_TOKEN || '';

export interface NYCPermit {
  job_filing_number: string;
  job_type?: string;
  filing_status?: string;
  filing_date?: string;
  approved_date?: string;
  first_permit_date?: string;
  initial_cost?: string;
  house_no?: string;
  street_name?: string;
  borough?: string;
  block?: string;
  lot?: string;
  bin?: string;
  latitude?: string;
  longitude?: string;
  postcode?: string;
  nta?: string; // Neighborhood Tabulation Area
  census_tract?: string;
  existing_dwelling_units?: string;
  proposed_dwelling_units?: string;
  // Alias for compatibility
  gis_latitude?: string;
  gis_longitude?: string;
}

export interface PermitQueryOptions {
  // Date filter
  sinceDate?: string; // YYYY-MM-DD
  // Pagination
  limit?: number;
  offset?: number;
  // Permit types (job_type: Alteration, New Building, etc.)
  permitTypes?: string[];
}

/**
 * Query permits from NYC Open Data API
 */
export async function queryPermits(options: PermitQueryOptions = {}): Promise<NYCPermit[]> {
  const {
    sinceDate,
    limit = 10000,
    offset = 0,
    permitTypes,
  } = options;

  // Build WHERE clause - use 'latitude' field
  // NOTE: We skip bbox filtering because string comparisons don't work with negative longitudes
  const conditions: string[] = ['latitude IS NOT NULL'];
  
  // Date filter - use filing_date
  if (sinceDate) {
    conditions.push(`filing_date >= '${sinceDate}'`);
  }
  
  // Job type filter (Alteration, New Building, etc.)
  if (permitTypes && permitTypes.length > 0) {
    const typeFilter = permitTypes.map(t => `job_type LIKE '%${t}%'`).join(' OR ');
    conditions.push(`(${typeFilter})`);
  }

  const whereClause = conditions.join(' AND ');

  const params = new URLSearchParams({
    '$where': whereClause,
    '$limit': limit.toString(),
    '$offset': offset.toString(),
    '$order': 'filing_date DESC',
  });

  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  
  if (APP_TOKEN) {
    headers['X-App-Token'] = APP_TOKEN;
  }

  const url = `${DOB_PERMITS_ENDPOINT}?${params}`;
  
  const response = await fetch(url, { 
    headers,
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    console.error('NYC Open Data API error:', response.status, response.statusText);
    throw new Error(`NYC Open Data API error: ${response.statusText}`);
  }

  const data = await response.json() as NYCPermit[];
  
  // Normalize lat/lng fields for compatibility
  return data.map(p => ({
    ...p,
    gis_latitude: p.latitude,
    gis_longitude: p.longitude,
  }));
}

/**
 * Get permits for heatmap display (city-wide, recent)
 * Note: We fetch all NYC permits and let Mapbox handle viewport filtering
 * because string-based lat/lng comparisons don't work well with negative numbers
 */
export async function getHeatmapPermits(options: {
  bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  monthsBack?: number;
}): Promise<NYCPermit[]> {
  const { monthsBack = 12 } = options;
  
  // Calculate date cutoff
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - monthsBack);
  const sinceDate = cutoff.toISOString().split('T')[0];

  // Fetch city-wide, Mapbox will handle viewport filtering
  return queryPermits({
    sinceDate,
    limit: 30000, // Get more data for full city coverage
  });
}

/**
 * Get permits near a location (for markers)
 * Fetches from API then filters client-side by distance
 */
export async function getNearbyPermits(options: {
  lat: number;
  lng: number;
  radiusDegrees?: number;
  monthsBack?: number;
  limit?: number;
}): Promise<NYCPermit[]> {
  const { lat, lng, radiusDegrees = 0.01, monthsBack = 12, limit = 500 } = options;
  
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - monthsBack);
  const sinceDate = cutoff.toISOString().split('T')[0];

  // Fetch more data to filter client-side
  const permits = await queryPermits({
    sinceDate,
    limit: Math.max(limit * 10, 5000), // Fetch extra for client-side filtering
  });

  // Client-side distance filter
  return permits
    .filter(p => {
      if (!p.latitude || !p.longitude) return false;
      const pLat = parseFloat(p.latitude);
      const pLng = parseFloat(p.longitude);
      return (
        Math.abs(pLat - lat) <= radiusDegrees &&
        Math.abs(pLng - lng) <= radiusDegrees
      );
    })
    .slice(0, limit);
}

/**
 * Get aggregated stats by borough/block for rankings
 */
export async function getRankingsData(options: {
  monthsBack?: number;
  borough?: string;
}): Promise<NYCPermit[]> {
  const { monthsBack = 12, borough } = options;
  
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - monthsBack);
  const sinceDate = cutoff.toISOString().split('T')[0];

  // Build query - fetch recent permits for aggregation
  const conditions: string[] = [
    'latitude IS NOT NULL',
    `filing_date >= '${sinceDate}'`,
  ];
  
  if (borough) {
    // Map borough names to uppercase (DOB NOW uses full names)
    const boroughMap: Record<string, string> = {
      'manhattan': 'MANHATTAN',
      'bronx': 'BRONX', 
      'brooklyn': 'BROOKLYN',
      'queens': 'QUEENS',
      'staten-island': 'STATEN ISLAND',
    };
    if (boroughMap[borough]) {
      conditions.push(`borough = '${boroughMap[borough]}'`);
    }
  }

  const whereClause = conditions.join(' AND ');

  const params = new URLSearchParams({
    '$where': whereClause,
    '$limit': '50000',
    '$order': 'filing_date DESC',
  });

  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (APP_TOKEN) headers['X-App-Token'] = APP_TOKEN;

  const response = await fetch(`${DOB_PERMITS_ENDPOINT}?${params}`, { 
    headers,
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`NYC Open Data API error: ${response.statusText}`);
  }

  const data = await response.json() as NYCPermit[];
  
  // Normalize for compatibility
  return data.map(p => ({
    ...p,
    gis_latitude: p.latitude,
    gis_longitude: p.longitude,
  }));
}

/**
 * Convert NYC permit to our app format
 */
export function transformPermit(permit: NYCPermit) {
  return {
    id: permit.job_filing_number,
    permitNumber: permit.job_filing_number,
    permitType: permit.job_type || 'Unknown',
    permitSubtype: permit.filing_status,
    description: permit.nta ? `${permit.job_type} in ${permit.nta}` : permit.job_type,
    filingDate: permit.filing_date?.split('T')[0],
    issuanceDate: permit.first_permit_date?.split('T')[0],
    estimatedCost: permit.initial_cost ? parseFloat(permit.initial_cost) : 0,
    address: [permit.house_no, permit.street_name, permit.borough, 'NY'].filter(Boolean).join(' '),
    borough: permit.borough,
    block: permit.block,
    lot: permit.lot,
    bin: permit.bin,
    latitude: permit.gis_latitude ? parseFloat(permit.gis_latitude) : null,
    longitude: permit.gis_longitude ? parseFloat(permit.gis_longitude) : null,
    neighborhood: permit.nta,
    censusTract: permit.census_tract,
  };
}

