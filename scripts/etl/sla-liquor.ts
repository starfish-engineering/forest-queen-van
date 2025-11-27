/**
 * SLA Liquor Licenses ETL Script
 * 
 * Fetches liquor licenses from NY State Open Data and loads them
 * into the database.
 * 
 * Usage: npm run etl:liquor
 */

import { db } from '../../src/lib/db/client';
import { liquorLicenses } from '../../src/lib/db/schema';

const NYC_OPEN_DATA_TOKEN = process.env.NYC_OPEN_DATA_APP_TOKEN || '';
const SLA_LIQUOR_API = 'https://data.ny.gov/resource/hrvs-fxs2.json';

// NYC county names in SLA data
const NYC_COUNTIES = ['NEW YORK', 'KINGS', 'QUEENS', 'BRONX', 'RICHMOND'];

// Calculate date 3 years ago
const THREE_YEARS_AGO = new Date();
THREE_YEARS_AGO.setFullYear(THREE_YEARS_AGO.getFullYear() - 3);
const DATE_FILTER = THREE_YEARS_AGO.toISOString().split('T')[0];

interface SLALicense {
  serial_number: string;
  license_type_name?: string;
  premises_name?: string;
  doing_business_as_dba?: string;
  actual_address_of_premises_address1?: string;
  actual_address_of_premises_city?: string;
  actual_address_of_premises_zip_code?: string;
  county?: string;
  license_original_issue_date?: string;
  license_expiration_date?: string;
  georeference?: {
    latitude?: string;
    longitude?: string;
  };
}

async function fetchLiquorLicenses(offset: number = 0, limit: number = 50000): Promise<SLALicense[]> {
  const countyFilter = NYC_COUNTIES.map(c => `'${c}'`).join(',');
  
  const params = new URLSearchParams({
    '$where': `license_original_issue_date > '${DATE_FILTER}' AND county in (${countyFilter})`,
    '$limit': limit.toString(),
    '$offset': offset.toString(),
    '$order': 'license_original_issue_date DESC',
  });

  const headers: Record<string, string> = {};
  if (NYC_OPEN_DATA_TOKEN) {
    headers['X-App-Token'] = NYC_OPEN_DATA_TOKEN;
  }

  const response = await fetch(`${SLA_LIQUOR_API}?${params}`, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch liquor licenses: ${response.statusText}`);
  }

  return response.json();
}

function buildAddress(license: SLALicense): string {
  const parts = [];
  if (license.actual_address_of_premises_address1) {
    parts.push(license.actual_address_of_premises_address1);
  }
  if (license.actual_address_of_premises_city) {
    parts.push(license.actual_address_of_premises_city);
  }
  parts.push('NY');
  if (license.actual_address_of_premises_zip_code) {
    parts.push(license.actual_address_of_premises_zip_code);
  }
  return parts.join(' ');
}

async function etlSLALiquorLicenses() {
  console.log('🍷 Starting SLA liquor licenses ETL...\n');
  console.log(`📅 Fetching licenses since ${DATE_FILTER}\n`);
  console.log(`📍 Filtering to NYC counties: ${NYC_COUNTIES.join(', ')}\n`);

  let offset = 0;
  let totalProcessed = 0;
  let hasMore = true;

  while (hasMore) {
    console.log(`📥 Fetching batch at offset ${offset}...`);
    
    try {
      const batch = await fetchLiquorLicenses(offset);
      
      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`   Processing ${batch.length} licenses...`);

      for (const license of batch) {
        if (!license.serial_number) continue;

        const latitude = license.georeference?.latitude;
        const longitude = license.georeference?.longitude;

        try {
          await db.insert(liquorLicenses).values({
            serialNumber: license.serial_number,
            licenseType: license.license_type_name,
            premisesName: license.premises_name,
            dba: license.doing_business_as_dba,
            address: buildAddress(license),
            city: license.actual_address_of_premises_city,
            zip: license.actual_address_of_premises_zip_code,
            county: license.county,
            licenseIssueDate: license.license_original_issue_date,
            licenseExpirationDate: license.license_expiration_date,
            latitude,
            longitude,
            rawData: license,
          }).onConflictDoUpdate({
            target: liquorLicenses.serialNumber,
            set: {
              licenseType: license.license_type_name,
              premisesName: license.premises_name,
              dba: license.doing_business_as_dba,
              licenseExpirationDate: license.license_expiration_date,
              latitude,
              longitude,
              rawData: license,
            },
          });

          totalProcessed++;
        } catch (err) {
          // Skip errors silently
        }
      }

      console.log(`   ✅ Batch complete (total: ${totalProcessed})\n`);
      
      offset += batch.length;
      
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

  console.log(`\n✨ SLA liquor licenses ETL complete!`);
  console.log(`   Total licenses processed: ${totalProcessed}`);
}

// Run the ETL
etlSLALiquorLicenses()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('ETL failed:', err);
    process.exit(1);
  });

