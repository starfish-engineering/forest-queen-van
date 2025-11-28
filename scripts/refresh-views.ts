/**
 * Refresh materialized views for optimized query performance.
 * Run this script periodically (e.g., every 15 minutes or hourly via cron).
 * 
 * Usage:
 *   npx tsx scripts/refresh-views.ts
 * 
 * Or add to cron:
 *   */15 * * * * cd /path/to/project && npx tsx scripts/refresh-views.ts >> /var/log/refresh-views.log 2>&1
 */

import postgres from 'postgres';

async function refreshMaterializedViews() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = postgres(connectionString);
  const startTime = Date.now();

  console.log(`[${new Date().toISOString()}] Starting materialized view refresh...`);

  try {
    // Refresh views concurrently (non-blocking)
    // CONCURRENTLY requires a UNIQUE index on the view, which we created in the migration
    
    console.log('  Refreshing mv_block_rankings...');
    await sql`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_block_rankings`;
    
    console.log('  Refreshing mv_tract_aggregations...');
    await sql`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_tract_aggregations`;
    
    console.log('  Refreshing mv_borough_aggregations...');
    await sql`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_borough_aggregations`;

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[${new Date().toISOString()}] Refresh completed in ${duration}s`);

    // Log view stats
    const stats = await sql`
      SELECT 
        'mv_block_rankings' as view_name, COUNT(*) as row_count FROM mv_block_rankings
      UNION ALL
      SELECT 
        'mv_tract_aggregations', COUNT(*) FROM mv_tract_aggregations
      UNION ALL
      SELECT 
        'mv_borough_aggregations', COUNT(*) FROM mv_borough_aggregations
    `;
    
    console.log('  View statistics:');
    for (const row of stats) {
      console.log(`    ${row.view_name}: ${row.row_count} rows`);
    }

  } catch (error) {
    console.error('Error refreshing materialized views:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

refreshMaterializedViews();

