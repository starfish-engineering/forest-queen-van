/**
 * DCA Business Licenses ETL Script
 * 
 * Fetches business licenses from NYC Open Data and loads them
 * into the database.
 * 
 * Usage: npm run etl:businesses
 */

import { db } from '../../src/lib/db/client';
import { businesses } from '../../src/lib/db/schema';

const NYC_OPEN_DATA_TOKEN = process.env.NYC_OPEN_DATA_APP_TOKEN || '';
const DCA_BUSINESSES_API = 'https://data.cityofnewyork.us/resource/w7w3-xahh.json';

// Calculate date 3 years ago
const THREE_YEARS_AGO = new Date();
THREE_YEARS_AGO.setFullYear(THREE_YEARS_AGO.getFullYear() - 3);
const DATE_FILTER = THREE_YEARS_AGO.toISOString().split('T')[0];

// High-end business indicators (keywords in business name)
const HIGH_END_KEYWORDS = [
  'coffee', 'cafe', 'espresso',
  'yoga', 'pilates', 'fitness', 'wellness',
  'wine', 'organic', 'artisan', 'boutique',
  'specialty', 'gourmet', 'craft',
  'coworking', 'co-working',
];

interface DCABusiness {
  license_nbr: string;
  license_type: string;
  business_name?: string;
  business_name_2?: string;
  license_status?: string;
  license_creation_date?: string;
  lic_expir_dd?: string;
  address_building?: string;
  address_street_name?: string;
  address_city?: string;
  address_zip?: string;
  address_borough?: string;
  latitude?: string;
  longitude?: string;
  industry?: string;
}

async function fetchBusinesses(offset: number = 0, limit: number = 50000): Promise<DCABusiness[]> {
  const params = new URLSearchParams({
    '$where': `license_creation_date > '${DATE_FILTER}'`,
    '$limit': limit.toString(),
    '$offset': offset.toString(),
    '$order': 'license_creation_date DESC',
  });

  const headers: Record<string, string> = {};
  if (NYC_OPEN_DATA_TOKEN) {
    headers['X-App-Token'] = NYC_OPEN_DATA_TOKEN;
  }

  const response = await fetch(`${DCA_BUSINESSES_API}?${params}`, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch businesses: ${response.statusText}`);
  }

  return response.json();
}

function buildAddress(biz: DCABusiness): string {
  const parts = [];
  if (biz.address_building) parts.push(biz.address_building);
  if (biz.address_street_name) parts.push(biz.address_street_name);
  if (biz.address_city) parts.push(biz.address_city);
  parts.push('NY');
  if (biz.address_zip) parts.push(biz.address_zip);
  return parts.join(' ');
}

function isHighEndIndicator(biz: DCABusiness): boolean {
  const name = (biz.business_name || '').toLowerCase() + ' ' + (biz.business_name_2 || '').toLowerCase();
  const industry = (biz.industry || '').toLowerCase();
  
  return HIGH_END_KEYWORDS.some(keyword => 
    name.includes(keyword) || industry.includes(keyword)
  );
}

function classifyBusinessType(biz: DCABusiness): string {
  const industry = (biz.industry || '').toLowerCase();
  const licenseType = (biz.license_type || '').toLowerCase();
  
  if (industry.includes('restaurant') || industry.includes('food')) return 'restaurant';
  if (industry.includes('cafe') || industry.includes('coffee')) return 'coffee';
  if (industry.includes('retail') || licenseType.includes('retail')) return 'retail';
  if (industry.includes('fitness') || industry.includes('gym')) return 'fitness';
  if (industry.includes('grocery') || industry.includes('food store')) return 'grocery';
  
  return licenseType || 'other';
}

async function etlDCABusinesses() {
  console.log('🏪 Starting DCA business licenses ETL...\n');
  console.log(`📅 Fetching licenses since ${DATE_FILTER}\n`);

  let offset = 0;
  let totalProcessed = 0;
  let highEndCount = 0;
  let hasMore = true;

  while (hasMore) {
    console.log(`📥 Fetching batch at offset ${offset}...`);
    
    try {
      const batch = await fetchBusinesses(offset);
      
      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`   Processing ${batch.length} businesses...`);

      for (const biz of batch) {
        if (!biz.license_nbr) continue;

        const isHighEnd = isHighEndIndicator(biz);
        if (isHighEnd) highEndCount++;

        try {
          await db.insert(businesses).values({
            licenseNumber: biz.license_nbr,
            businessName: biz.business_name || biz.business_name_2,
            businessType: classifyBusinessType(biz),
            licenseType: biz.license_type,
            licenseStatus: biz.license_status,
            issueDate: biz.license_creation_date,
            expirationDate: biz.lic_expir_dd,
            address: buildAddress(biz),
            borough: biz.address_borough,
            latitude: biz.latitude,
            longitude: biz.longitude,
            isHighEndIndicator: isHighEnd,
            rawData: biz,
          }).onConflictDoUpdate({
            target: businesses.licenseNumber,
            set: {
              businessName: biz.business_name || biz.business_name_2,
              businessType: classifyBusinessType(biz),
              licenseStatus: biz.license_status,
              expirationDate: biz.lic_expir_dd,
              latitude: biz.latitude,
              longitude: biz.longitude,
              isHighEndIndicator: isHighEnd,
              rawData: biz,
              updatedAt: new Date(),
            },
          });

          totalProcessed++;
        } catch (err) {
          // Skip errors silently
        }
      }

      console.log(`   ✅ Batch complete (total: ${totalProcessed}, high-end: ${highEndCount})\n`);
      
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

  console.log(`\n✨ DCA business licenses ETL complete!`);
  console.log(`   Total businesses processed: ${totalProcessed}`);
  console.log(`   High-end indicators: ${highEndCount}`);
}

// Run the ETL
etlDCABusinesses()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('ETL failed:', err);
    process.exit(1);
  });

