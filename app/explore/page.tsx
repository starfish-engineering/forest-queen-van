import type { Metadata } from 'next';
import VanExplorer from '@/components/VanExplorer';
import { buildExplorerData } from '@/lib/explorer';

export const metadata: Metadata = {
  title: 'Explore the Build in 3D — Forest Queen',
  description:
    'Orbit a 3D model of the Forest Queen and open each system — electrical, plumbing, HVAC, solar — right on the van.',
};

export default function ExplorePage() {
  return <VanExplorer data={buildExplorerData()} />;
}
