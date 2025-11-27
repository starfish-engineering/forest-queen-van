/**
 * Refresh Permits - Fetches recent permits from NYC Open Data
 * 
 * Usage: npx tsx scripts/etl/refresh-permits.ts
 */

import { db } from '../../src/lib/db/client';
import { permits } from '../../src/lib/db/schema';

const DOB_PERMITS_API = 'https://data.cityofnewyork.us/resource/ipu4-2q9a.json';

interface DOBPermit {
  job__: string;
  permit_type: string;
  permit_subtype?: string;
  work_type?: string;
  filing_date: string;
  issuance_date?: string;
  expiration_date?: string;
  estimated_job_cost__?: string;
  house__?: string;
  street_name?: string;
  borough?: string;
  block?: string;
  lot?: string;
  bin__?: string;
  gis_latitude?: string;
  gis_longitude?: string;
}

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (trimmed.match(/^\d{4}-\d{2}-\d{2}/)) {
    return trimmed.split('T')[0];
  }
  const parts = trimmed.split('/');
  if (parts.length === 3) {
    const [m, d, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return null;
}

function buildAddress(permit: DOBPermit): string {
  const parts = [];
  if (permit.house__) parts.push(permit.house__);
  if (permit.street_name) parts.push(permit.street_name);
  if (permit.borough) parts.push(permit.borough);
  parts.push('NY');
  return parts.join(' ');
}

async function fetchPermits(offset: number = 0, limit: number = 5000): Promise<DOBPermit[]> {
  // Fetch all NYC permits with coordinates, ordered by most recent
  const params = new URLSearchParams({
    '$where': 'gis_latitude IS NOT NULL',
    '$limit': limit.toString(),
    '$offset': offset.toString(),
    '$order': 'filing_date DESC',
  });

  const response = await fetch(`${DOB_PERMITS_API}?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch permits: ${response.statusText}`);
  }

  return response.json();
}

async function refreshPermits() {
  console.log('🔄 Refreshing permits from NYC Open Data...\n');

  let totalInserted = 0;
  let totalBatches = 0;
  const maxBatches = 20; // Fetch up to 100k permits (20 batches * 5000)

  for (let batch = 0; batch < maxBatches; batch++) {
    const offset = batch * 5000;
    console.log(`📥 Fetching batch ${batch + 1}/${maxBatches} (offset: ${offset})...`);
    
    try {
      const permits_data = await fetchPermits(offset, 5000);
      
      if (permits_data.length === 0) {
        console.log('   No more permits to fetch.');
        break;
      }

      let inserted = 0;
      let skipped = 0;

      for (const permit of permits_data) {
        if (!permit.job__) { skipped++; continue; }

        const filingDate = parseDate(permit.filing_date);
        if (!filingDate) { skipped++; continue; }

        try {
          await db.insert(permits).values({
            permitNumber: permit.job__,
            permitType: permit.permit_type || 'Unknown',
            permitSubtype: permit.permit_subtype || permit.work_type,
            description: permit.work_type,
            filingDate: filingDate,
            issuanceDate: parseDate(permit.issuance_date || ''),
            expirationDate: parseDate(permit.expiration_date || ''),
            estimatedCost: permit.estimated_job_cost__,
            address: buildAddress(permit),
            borough: permit.borough,
            block: permit.block,
            lot: permit.lot,
            bin: permit.bin__,
            latitude: permit.gis_latitude,
            longitude: permit.gis_longitude,
            rawData: permit,
          }).onConflictDoUpdate({
            target: permits.permitNumber,
            set: {
              filingDate: filingDate,
              issuanceDate: parseDate(permit.issuance_date || ''),
              latitude: permit.gis_latitude,
              longitude: permit.gis_longitude,
              updatedAt: new Date(),
            },
          });
          inserted++;
        } catch {
          skipped++;
        }
      }

      totalInserted += inserted;
      totalBatches++;
      console.log(`   ✅ Inserted: ${inserted}, Skipped: ${skipped}`);
      
      // Show newest date in batch
      if (permits_data.length > 0) {
        const newest = permits_data[0].filing_date;
        const oldest = permits_data[permits_data.length - 1].filing_date;
        console.log(`   📅 Date range: ${oldest} to ${newest}`);
      }

      // Small delay to be nice to the API
      await new Promise(r => setTimeout(r, 500));

    } catch (err) {
      console.error(`   ❌ Batch failed:`, err);
      break;
    }
  }

  console.log(`\n✨ Refresh complete!`);
  console.log(`   Total batches: ${totalBatches}`);
  console.log(`   Total permits inserted/updated: ${totalInserted}`);
}

refreshPermits()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Refresh failed:', err);
    process.exit(1);
  });

