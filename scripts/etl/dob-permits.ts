/**
 * DOB Permits ETL Script
 * 
 * Fetches building permits from NYC Open Data and loads them
 * into the database.
 * 
 * Usage: npm run etl:permits
 */

import { db } from '../../src/lib/db/client';
import { permits } from '../../src/lib/db/schema';

const NYC_OPEN_DATA_TOKEN = process.env.NYC_OPEN_DATA_APP_TOKEN || '';
const DOB_PERMITS_API = 'https://data.cityofnewyork.us/resource/ipu4-2q9a.json';

// Calculate date 3 years ago in MM/DD/YYYY format
const THREE_YEARS_AGO = new Date();
THREE_YEARS_AGO.setFullYear(THREE_YEARS_AGO.getFullYear() - 3);
const month = String(THREE_YEARS_AGO.getMonth() + 1).padStart(2, '0');
const day = String(THREE_YEARS_AGO.getDate()).padStart(2, '0');
const year = THREE_YEARS_AGO.getFullYear();
const DATE_FILTER = `${month}/${day}/${year}`;

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
  owner_s_business_name?: string;
}

// Parse date - handles both YYYY-MM-DD and MM/DD/YYYY formats
function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  
  // Already in YYYY-MM-DD format
  if (trimmed.match(/^\d{4}-\d{2}-\d{2}/)) {
    return trimmed.split(' ')[0]; // Remove any time component
  }
  
  // MM/DD/YYYY format
  const parts = trimmed.split('/');
  if (parts.length === 3) {
    const [m, d, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  
  return null;
}

// For demo: fetch permits around East Village/Alphabet City (zip 10009) + nearby areas
async function fetchPermits(offset: number = 0, limit: number = 2000): Promise<DOBPermit[]> {
  // Focus on Manhattan zips around 133 Avenue D (10009)
  const demoZips = ['10009', '10003', '10002', '10010', '10014'];
  const zipFilter = demoZips.map(z => `zip_code='${z}'`).join(' OR ');
  
  const params = new URLSearchParams({
    '$where': `gis_latitude IS NOT NULL AND (${zipFilter})`,
    '$limit': limit.toString(),
    '$offset': offset.toString(),
    '$order': 'filing_date DESC',
  });

  const headers: Record<string, string> = {};
  if (NYC_OPEN_DATA_TOKEN) {
    headers['X-App-Token'] = NYC_OPEN_DATA_TOKEN;
  }

  const response = await fetch(`${DOB_PERMITS_API}?${params}`, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch permits: ${response.statusText}`);
  }

  return response.json();
}

function buildAddress(permit: DOBPermit): string {
  const parts = [];
  if (permit.house__) parts.push(permit.house__);
  if (permit.street_name) parts.push(permit.street_name);
  if (permit.borough) parts.push(permit.borough);
  parts.push('NY');
  return parts.join(' ');
}

async function etlDOBPermits() {
  console.log('🏗️  Starting DOB permits ETL...\n');
  console.log(`📅 Fetching permits since ${DATE_FILTER}\n`);

  let offset = 0;
  let totalProcessed = 0;
  let hasMore = true;

  while (hasMore) {
    console.log(`📥 Fetching batch at offset ${offset}...`);
    
    try {
      const batch = await fetchPermits(offset);
      
      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`   Processing ${batch.length} permits...`);

      let skipped = 0;
      let errors = 0;
      
      for (const permit of batch) {
        if (!permit.job__) { skipped++; continue; }

        try {
          const filingDate = parseDate(permit.filing_date);
          if (!filingDate) { skipped++; continue; } // Skip if no valid filing date

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
              permitType: permit.permit_type || 'Unknown',
              permitSubtype: permit.permit_subtype || permit.work_type,
              description: permit.work_type,
              issuanceDate: parseDate(permit.issuance_date || ''),
              expirationDate: parseDate(permit.expiration_date || ''),
              estimatedCost: permit.estimated_job_cost__,
              latitude: permit.gis_latitude,
              longitude: permit.gis_longitude,
              rawData: permit,
              updatedAt: new Date(),
            },
          });

          totalProcessed++;
        } catch (err) {
          errors++;
          // Log first error for debugging
          if (errors === 1) {
            console.error('   ⚠️  Insert error:', (err as Error).message);
          }
        }
      }

      console.log(`   ✅ Batch complete (inserted: ${totalProcessed}, skipped: ${skipped}, errors: ${errors})\n`);
      
      // Log sample permit for debugging
      if (batch.length > 0) {
        const sample = batch[0];
        console.log(`   📋 Sample permit: job=${sample.job__}, date=${sample.filing_date}, lat=${sample.gis_latitude}`);
      }
      
      // For demo: just load one batch
      hasMore = false;
    } catch (err) {
      console.error(`   ❌ Batch failed:`, err);
      hasMore = false;
    }
  }

  console.log(`\n✨ DOB permits ETL complete!`);
  console.log(`   Total permits processed: ${totalProcessed}`);
}

// Run the ETL
etlDOBPermits()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('ETL failed:', err);
    process.exit(1);
  });

