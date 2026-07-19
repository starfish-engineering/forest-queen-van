import type { Metadata } from 'next';
import { getAllSystems } from '@/lib/systems';
import VanExplorer, { type HotspotSystem } from '@/components/VanExplorer';

export const metadata: Metadata = {
  title: 'Explore the Build in 3D — Forest Queen',
  description:
    'Orbit a 3D scan of the Forest Queen and open each system — electrical, plumbing, HVAC, solar — right on the van.',
};

// Placeholder hotspot coordinates. These are tuned against the sample splat; re-map them
// once the real Forest Queen scan is in place (see docs/3d-model/RESEARCH.md).
const HOTSPOT_POS: Record<string, [number, number, number]> = {
  electrical: [0.6, 0.4, 0.2],
  plumbing: [-0.6, 0.1, 0.3],
  hvac: [0.2, 0.7, -0.3],
  solar: [0, 1.0, 0],
  propane: [-0.4, -0.2, -0.4],
  structural: [0.5, -0.3, 0.4],
};

export default function ExplorePage() {
  const systems: HotspotSystem[] = getAllSystems().map((s) => ({
    slug: s.slug,
    name: s.name,
    icon: s.icon,
    totalCost: s.totalCost,
    headline: s.description,
    pos: HOTSPOT_POS[s.slug] ?? [0, 0, 0],
  }));

  const splatUrl = process.env.NEXT_PUBLIC_SPLAT_URL ?? '';

  return <VanExplorer systems={systems} splatUrl={splatUrl} />;
}
