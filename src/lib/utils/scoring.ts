import type { TractScoreData } from '@/types';

interface TractMetrics {
  permitCount: number;
  permitDensity: number;      // permits per sq km
  totalPermitValue: number;
  businessCount: number;
  highEndBusinessCount: number;
}

interface CityAverages {
  permitDensity: number;
  totalPermitValue: number;
  highEndBusinessCount: number;
}

// NYC city-wide averages (will be computed from data)
const DEFAULT_CITY_AVERAGES: CityAverages = {
  permitDensity: 50,        // permits per sq km per year
  totalPermitValue: 500000, // $500K average permit value
  highEndBusinessCount: 5,   // 5 high-end businesses per tract
};

/**
 * Normalize a value to 0-100 scale based on average
 * Score of 50 = average, capped at 100
 */
function normalize(value: number, average: number): number {
  if (average === 0) return 0;
  return Math.min(100, Math.round((value / average) * 50));
}

/**
 * Calculate composite score for a census tract
 */
export function calculateTractScore(
  metrics: TractMetrics,
  cityAverages: CityAverages = DEFAULT_CITY_AVERAGES
): number {
  const weights = {
    permitDensity: 0.4,
    permitValue: 0.3,
    highEndBusiness: 0.3,
  };
  
  const permitScore = normalize(metrics.permitDensity, cityAverages.permitDensity);
  const valueScore = normalize(metrics.totalPermitValue, cityAverages.totalPermitValue);
  const businessScore = normalize(metrics.highEndBusinessCount, cityAverages.highEndBusinessCount);
  
  return Math.round(
    permitScore * weights.permitDensity +
    valueScore * weights.permitValue +
    businessScore * weights.highEndBusiness
  );
}

/**
 * Get score label based on value
 */
export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Hot Market';
  if (score >= 65) return 'Above Average';
  if (score >= 50) return 'Average';
  if (score >= 35) return 'Below Average';
  return 'Low Activity';
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#d7191c'; // hot
  if (score >= 65) return '#fdae61'; // warm
  if (score >= 50) return '#ffffbf'; // neutral
  if (score >= 35) return '#abd9e9'; // cool
  return '#2c7bb6'; // cold
}

/**
 * Create TractScoreData from metrics
 */
export function createTractScoreData(metrics: TractMetrics): TractScoreData {
  return {
    permitCount: metrics.permitCount,
    permitValue: metrics.totalPermitValue,
    permitDensity: metrics.permitDensity,
    businessCount: metrics.businessCount,
    highEndBusinessCount: metrics.highEndBusinessCount,
    compositeScore: calculateTractScore(metrics),
  };
}

