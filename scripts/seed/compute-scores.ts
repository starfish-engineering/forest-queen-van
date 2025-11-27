/**
 * Compute Tract Scores Script
 * 
 * Calculates neighborhood scores for all census tracts
 * based on permit density and business activity.
 * 
 * Usage: npm run score:compute
 */

import { db } from '../../src/lib/db/client';
import { censusTracts, permits, businesses, tractScores } from '../../src/lib/db/schema';
import { sql, eq, gte, and } from 'drizzle-orm';
import { calculateTractScore } from '../../src/lib/utils/scoring';
import type { TimeHorizon } from '../../src/types';

const TIME_HORIZONS: TimeHorizon[] = ['6mo', '1yr', '3yr'];

function getDateCutoff(horizon: TimeHorizon): Date {
  const now = new Date();
  switch (horizon) {
    case '6mo':
      return new Date(now.setMonth(now.getMonth() - 6));
    case '1yr':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case '3yr':
      return new Date(now.setFullYear(now.getFullYear() - 3));
  }
}

async function computeScores() {
  console.log('📊 Starting neighborhood score computation...\n');

  // Get all census tracts
  const tracts = await db.select().from(censusTracts);
  console.log(`📍 Found ${tracts.length} census tracts\n`);

  let processed = 0;
  let errors = 0;

  for (const tract of tracts) {
    try {
      for (const horizon of TIME_HORIZONS) {
        const cutoffDate = getDateCutoff(horizon);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];

        // Count permits
        const permitResult = await db
          .select({
            count: sql<number>`count(*)`,
            totalValue: sql<number>`coalesce(sum(estimated_cost::numeric), 0)`,
          })
          .from(permits)
          .where(
            and(
              eq(permits.censusTractGeoid, tract.geoid),
              gte(permits.filingDate, cutoffStr)
            )
          );

        const permitCount = Number(permitResult[0]?.count || 0);
        const totalPermitValue = Number(permitResult[0]?.totalValue || 0);

        // Count businesses
        const businessResult = await db
          .select({
            count: sql<number>`count(*)`,
            highEndCount: sql<number>`sum(case when is_high_end_indicator then 1 else 0 end)`,
          })
          .from(businesses)
          .where(
            and(
              eq(businesses.censusTractGeoid, tract.geoid),
              gte(businesses.issueDate, cutoffStr)
            )
          );

        const businessCount = Number(businessResult[0]?.count || 0);
        const highEndBusinessCount = Number(businessResult[0]?.highEndCount || 0);

        // Calculate density (permits per sq km)
        const landAreaSqKm = tract.landAreaSqm 
          ? parseFloat(tract.landAreaSqm) / 1_000_000 
          : 1;
        const permitDensity = permitCount / Math.max(landAreaSqKm, 0.01);

        // Calculate composite score
        const compositeScore = calculateTractScore({
          permitCount,
          permitDensity,
          totalPermitValue,
          businessCount,
          highEndBusinessCount,
        });

        // Upsert score
        await db
          .insert(tractScores)
          .values({
            censusTractGeoid: tract.geoid,
            timeHorizon: horizon,
            totalPermits: permitCount.toString(),
            totalPermitValue: totalPermitValue.toString(),
            permitDensity: permitDensity.toString(),
            businessCount: businessCount.toString(),
            highEndBusinessCount: highEndBusinessCount.toString(),
            compositeScore: compositeScore.toString(),
          })
          .onConflictDoUpdate({
            target: [tractScores.censusTractGeoid, tractScores.timeHorizon],
            set: {
              totalPermits: permitCount.toString(),
              totalPermitValue: totalPermitValue.toString(),
              permitDensity: permitDensity.toString(),
              businessCount: businessCount.toString(),
              highEndBusinessCount: highEndBusinessCount.toString(),
              compositeScore: compositeScore.toString(),
              computedAt: new Date(),
            },
          });
      }

      processed++;
      
      if (processed % 100 === 0) {
        console.log(`   Processed ${processed}/${tracts.length} tracts...`);
      }
    } catch (err) {
      errors++;
      console.error(`   ⚠️  Error processing tract ${tract.geoid}:`, err);
    }
  }

  console.log(`\n✨ Score computation complete!`);
  console.log(`   Tracts processed: ${processed}`);
  console.log(`   Errors: ${errors}`);
}

// Run the computation
computeScores()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Score computation failed:', err);
    process.exit(1);
  });

