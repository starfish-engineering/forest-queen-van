import { db } from '../src/lib/db/client';
import { permits } from '../src/lib/db/schema';

const DOB_PERMITS_ENDPOINT = 'https://data.cityofnewyork.us/resource/w9ak-ipjd.json';

interface NYCPermit {
  job_filing_number: string;
  job_type?: string;
  filing_status?: string;
  filing_date?: string;
  initial_cost?: string;
  house_no?: string;
  street_name?: string;
  borough?: string;
  block?: string;
  lot?: string;
  bin?: string;
  latitude?: string;
  longitude?: string;
  nta?: string;
  census_tract?: string;
}

async function fetchPermits(limit: number, offset: number, sinceDate: string): Promise<NYCPermit[]> {
  const params = new URLSearchParams({
    '$where': `latitude IS NOT NULL AND filing_date >= '${sinceDate}'`,
    '$limit': limit.toString(),
    '$offset': offset.toString(),
    '$order': 'filing_date DESC',
  });

  const response = await fetch(`${DOB_PERMITS_ENDPOINT}?${params}`, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function loadPermits() {
  console.log('🚀 Starting permit data load...');
  
  // Calculate date 3 years ago
  const sinceDate = new Date();
  sinceDate.setFullYear(sinceDate.getFullYear() - 3);
  const sinceDateStr = sinceDate.toISOString().split('T')[0];
  
  console.log(`📡 Fetching permits since ${sinceDateStr}...`);
  
  const batchSize = 10000;
  let offset = 0;
  let totalInserted = 0;
  let totalFetched = 0;
  
  while (true) {
    console.log(`\n📥 Fetching batch at offset ${offset}...`);
    const rawPermits = await fetchPermits(batchSize, offset, sinceDateStr);
    totalFetched += rawPermits.length;
    
    console.log(`   Got ${rawPermits.length} permits`);
    
    if (rawPermits.length === 0) break;
    
    // Transform permits
    const values = rawPermits
      .filter(p => p.job_filing_number && p.filing_date)
      .map(p => ({
        permitNumber: p.job_filing_number,
        permitType: p.job_type || 'Unknown',
        permitSubtype: null,
        description: null,
        filingDate: p.filing_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        issuanceDate: null,
        expirationDate: null,
        estimatedCost: p.initial_cost || null,
        address: p.house_no && p.street_name ? `${p.house_no} ${p.street_name}` : null,
        borough: p.borough || null,
        block: p.block || null,
        lot: p.lot || null,
        bin: p.bin || null,
        latitude: p.latitude || null,
        longitude: p.longitude || null,
        censusTractGeoid: p.census_tract || null,
        rawData: p,
      }));
    
    // Insert in smaller batches to avoid stack overflow
    const insertBatchSize = 200;
    for (let i = 0; i < values.length; i += insertBatchSize) {
      const batch = values.slice(i, i + insertBatchSize);
      await db.insert(permits).values(batch).onConflictDoNothing();
      totalInserted += batch.length;
    }
    console.log(`   ✅ Inserted ${values.length} permits (total: ${totalInserted})`)
    
    if (rawPermits.length < batchSize) break;
    offset += batchSize;
    
    // Small delay to be nice to the API
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(`\n🎉 Done! Fetched ${totalFetched} permits, inserted ${totalInserted}`);
}

loadPermits()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
