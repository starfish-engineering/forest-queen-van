/**
 * Census Tract Seeding Script
 * 
 * Downloads NYC census tract boundaries from Census TIGER/Line
 * and loads them into the PostGIS database.
 * 
 * Usage: npm run db:seed
 */

import { db } from '../../src/lib/db/client';
import { censusTracts } from '../../src/lib/db/schema';

// NYC County FIPS codes
const NYC_COUNTIES = [
  '36061', // New York (Manhattan)
  '36047', // Kings (Brooklyn)
  '36081', // Queens
  '36005', // Bronx
  '36085', // Richmond (Staten Island)
];

// Census TIGER API for tract boundaries (Layer 6 = Census Tracts)
const CENSUS_API_URL = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Census2020/MapServer/6/query';

async function fetchTractsForCounty(countyFips: string): Promise<unknown[]> {
  const params = new URLSearchParams({
    where: `STATE='36' AND COUNTY='${countyFips.slice(2)}'`,
    outFields: 'GEOID,STATE,COUNTY,TRACT,NAME,AREALAND',
    returnGeometry: 'true',
    f: 'geojson',
    outSR: '4326',
  });

  const response = await fetch(`${CENSUS_API_URL}?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tracts for county ${countyFips}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.features || [];
}

async function seedCensusTracts() {
  console.log('🗺️  Starting census tract seeding...\n');

  let totalInserted = 0;

  for (const countyFips of NYC_COUNTIES) {
    console.log(`📍 Fetching tracts for county ${countyFips}...`);
    
    try {
      const features = await fetchTractsForCounty(countyFips);
      console.log(`   Found ${features.length} tracts`);

      for (const feature of features) {
        const f = feature as {
          properties: {
            GEOID: string;
            STATE: string;
            COUNTY: string;
            TRACT: string;
            NAME: string;
            AREALAND: number;
          };
          geometry: unknown;
        };

        const { GEOID, STATE, COUNTY, TRACT, NAME, AREALAND } = f.properties;
        const geometry = f.geometry;

        try {
          await db.insert(censusTracts).values({
            geoid: GEOID,
            stateFips: STATE,
            countyFips: COUNTY,
            tractCode: TRACT,
            name: NAME || `Census Tract ${TRACT}`,
            geometry: JSON.stringify(geometry),
            landAreaSqm: AREALAND?.toString(),
          }).onConflictDoUpdate({
            target: censusTracts.geoid,
            set: {
              name: NAME || `Census Tract ${TRACT}`,
              geometry: JSON.stringify(geometry),
              landAreaSqm: AREALAND?.toString(),
            },
          });

          totalInserted++;
        } catch (err) {
          console.error(`   ⚠️  Failed to insert tract ${GEOID}:`, err);
        }
      }

      console.log(`   ✅ Processed ${features.length} tracts\n`);
    } catch (err) {
      console.error(`   ❌ Failed to fetch county ${countyFips}:`, err);
    }
  }

  console.log(`\n✨ Census tract seeding complete!`);
  console.log(`   Total tracts loaded: ${totalInserted}`);
}

// Run the seeding
seedCensusTracts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });

