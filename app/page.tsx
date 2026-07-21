import type { Metadata } from 'next';
import VanExplorer from '@/components/VanExplorer';
import { buildExplorerData } from '@/lib/explorer';

export const metadata: Metadata = {
  title: 'Forest Queen — a hand-built Transit home, explorable in 3D',
  description:
    'Orbit the Forest Queen, a 2019 Ford Transit converted by hand into a full-time home. Open every system, read the build journal, see every cost. For sale.',
};

// The site is one UI: the 3D explorer. Journal, systems, costs and the
// listing all open as panels on the scene; the old routes stay for deep links.
export default function Home() {
  return <VanExplorer data={buildExplorerData()} standalone />;
}
