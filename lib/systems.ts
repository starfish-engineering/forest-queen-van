import systemsData from '@/data/systems.json';

export interface SystemComponent {
  name: string;
  quantity: number;
  specs: string;
  cost: number;
  vendor: string;
  purpose: string;
}

export interface System {
  id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  icon: string;
  totalCost: number;
  components: SystemComponent[];
  relatedPosts: string[];
  specs: Record<string, string | undefined>;
  powerAnalysis?: {
    [key: string]: Record<string, string> | string;
  };
}

export function getAllSystems(): System[] {
  return systemsData as System[];
}

export function getSystemBySlug(slug: string): System | undefined {
  return systemsData.find((system) => system.slug === slug) as System | undefined;
}

export function getTotalSystemsCost(): number {
  return systemsData.reduce((total, system) => total + system.totalCost, 0);
}
