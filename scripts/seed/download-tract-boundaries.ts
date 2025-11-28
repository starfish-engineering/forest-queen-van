/**
 * Download NYC Census Tract Boundaries
 * 
 * Fetches GeoJSON boundaries from Census Bureau or NYC Open Data
 * 
 * Usage: npx tsx scripts/seed/download-tract-boundaries.ts
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// NYC Census Tracts from data.gov / Census Bureau
// ACS 2020 5-year estimates boundaries
const CENSUS_TRACTS_URL = 'https://raw.githubusercontent.com/nychealth/coronavirus-data/master/Geography-resources/MODZCTA_2010.geo.json';

// Alternative: NYC Department of City Planning
const NYC_TRACTS_URL = 'https://data.cityofnewyork.us/api/geospatial/fxpq-c8ku?method=export&format=GeoJSON';

async function downloadNYCTracts() {
  console.log('📍 Downloading NYC Census Tract Boundaries\n');

  try {
    console.log('  Fetching from NYC Open Data...');
    const response = await fetch(NYC_TRACTS_URL, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const geojson = await response.json();
    
    // Transform to ensure consistent property names
    const features = geojson.features.map((f: GeoJSON.Feature) => ({
      type: 'Feature',
      properties: {
        geoid: f.properties?.ct2010 || f.properties?.geoid || f.properties?.GEOID || '',
        name: f.properties?.ctlabel || f.properties?.name || '',
        boro: f.properties?.boro_name || f.properties?.borough || '',
        boroCode: f.properties?.boro_code || '',
      },
      geometry: f.geometry,
    }));

    const output: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };

    // Ensure public/data directory exists
    const dataDir = join(process.cwd(), 'public', 'data');
    mkdirSync(dataDir, { recursive: true });

    // Save to file
    const outputPath = join(dataDir, 'nyc-census-tracts.json');
    writeFileSync(outputPath, JSON.stringify(output));

    console.log(`\n✨ Downloaded ${features.length} census tracts`);
    console.log(`   Saved to: ${outputPath}`);
    
    // Show sample
    if (features.length > 0) {
      console.log('\n   Sample tract:', JSON.stringify(features[0].properties, null, 2));
    }
  } catch (error) {
    console.error('❌ Download failed:', error);
    
    // Fallback: Create a simplified version using our permit data
    console.log('\n📝 Creating simplified tract boundaries from permit data...');
    await createSimplifiedTracts();
  }
}

async function createSimplifiedTracts() {
  // If we can't get official boundaries, create approximate ones from our data
  // This is a fallback approach using convex hulls around permit clusters
  console.log('   This would require computing convex hulls from permit locations');
  console.log('   For now, using heatmap visualization instead');
}

downloadNYCTracts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Download failed:', err);
    process.exit(1);
  });
