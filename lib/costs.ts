import costsData from '@/data/costs.json';

export interface CostItem {
  item: string;
  cost: number;
  category: string;
  notes: string;
}

export interface CostCategory {
  name: string;
  total: number;
  color: string;
  items: CostItem[];
}

export interface TimelineEntry {
  date: string;
  items: string[];
  amount: number;
}

export interface CostsData {
  total: number;
  categories: CostCategory[];
  timeline: TimelineEntry[];
  notes: {
    excludedCosts: string[];
    comparison: {
      'DIY Cost': number;
      'Professional Build': string;
      'Labor Value': string;
    };
  };
}

export function getCostsData(): CostsData {
  return costsData as CostsData;
}

export function getTotalCost(): number {
  return costsData.total;
}

export function getCategorySummary(): Array<{ name: string; total: number; color: string; percentage: number }> {
  const total = costsData.total;
  return costsData.categories.map((cat) => ({
    name: cat.name,
    total: cat.total,
    color: cat.color,
    percentage: (cat.total / total) * 100
  }));
}

export function getAllCostItems(): CostItem[] {
  return costsData.categories.flatMap((cat) => cat.items);
}

export function getCostTimeline(): TimelineEntry[] {
  return costsData.timeline;
}
