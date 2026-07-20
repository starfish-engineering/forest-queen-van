import type { Metadata } from 'next';
import { getAllSystems } from '@/lib/systems';
import VanExplorer, { type HotspotSystem } from '@/components/VanExplorer';

export const metadata: Metadata = {
  title: 'Explore the Build in 3D — Forest Queen',
  description:
    'Orbit a 3D model of the Forest Queen and open each system — electrical, plumbing, HVAC, solar — right on the van.',
};

// Hotspot coordinates tuned against the real Transit component layout in
// components/van/TransitModel.tsx. hvac and solar sit on the roof, so they
// stay visible even with the body shell closed.
const HOTSPOT_POS: Record<string, [number, number, number]> = {
  electrical: [-2.15, 1.05, -0.75], // battery bank in the garage, driver side
  plumbing: [-1.05, 1.7, 0.75], // galley sink, passenger side
  hvac: [-1.25, 3.05, 0], // MaxxAir fan above the galley
  solar: [-0.1, 3.05, 0], // front panel
  propane: [-2.9, 1.0, 0.65],
  structural: [0.15, 1.9, -0.95], // 80/20 upright at the bench
};

const ROOF_SYSTEMS = new Set(['hvac', 'solar']);

export default function ExplorePage() {
  const systems: HotspotSystem[] = getAllSystems().map((s) => ({
    slug: s.slug,
    name: s.name,
    icon: s.icon,
    totalCost: s.totalCost,
    headline: s.description,
    pos: HOTSPOT_POS[s.slug] ?? [0, 0, 0],
    roof: ROOF_SYSTEMS.has(s.slug),
  }));

  return <VanExplorer systems={systems} />;
}
