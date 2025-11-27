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
const DOB_PERMITS_API = 'https://data.cityofnewyork.us/resource/ipu4-2vj7.json';

// Calculate date 3 years ago
const THREE_YEARS_AGO = new Date();
THREE_YEARS_AGO.setFullYear(THREE_YEARS_AGO.getFullYear() - 3);
const DATE_FILTER = THREE_YEARS_AGO.toISOString().split('T')[0];

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
  latitude?: string;
  longitude?: string;
  owner_s_business_name?: string;
}

async function fetchPermits(offset: number = 0, limit: number = 50000): Promise<DOBPermit[]> {
  const params = new URLSearchParams({
    '$where': `filing_date > '${DATE_FILTER}'`,
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

      for (const permit of batch) {
        if (!permit.job__) continue;

        try {
          await db.insert(permits).values({
            permitNumber: permit.job__,
            permitType: permit.permit_type || 'Unknown',
            permitSubtype: permit.permit_subtype || permit.work_type,
            description: permit.work_type,
            filingDate: permit.filing_date,
            issuanceDate: permit.issuance_date,
            expirationDate: permit.expiration_date,
            estimatedCost: permit.estimated_job_cost__,
            address: buildAddress(permit),
            borough: permit.borough,
            block: permit.block,
            lot: permit.lot,
            bin: permit.bin__,
            latitude: permit.latitude,
            longitude: permit.longitude,
            rawData: permit,
          }).onConflictDoUpdate({
            target: permits.permitNumber,
            set: {
              permitType: permit.permit_type || 'Unknown',
              permitSubtype: permit.permit_subtype || permit.work_type,
              description: permit.work_type,
              issuanceDate: permit.issuance_date,
              expirationDate: permit.expiration_date,
              estimatedCost: permit.estimated_job_cost__,
              latitude: permit.latitude,
              longitude: permit.longitude,
              rawData: permit,
              updatedAt: new Date(),
            },
          });

          totalProcessed++;
        } catch (err) {
          // Skip duplicates and other errors silently
        }
      }

      console.log(`   ✅ Batch complete (total: ${totalProcessed})\n`);
      
      offset += batch.length;
      
      // Rate limiting - wait 1 second between batches
      if (batch.length === 50000) {
        console.log('   ⏳ Rate limiting pause...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        hasMore = false;
      }
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

