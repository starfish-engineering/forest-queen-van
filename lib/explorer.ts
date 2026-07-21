import { getAllSystems } from './systems';
import { getAllPosts } from './posts';
import costsData from '@/data/costs.json';

export type ExplorerSystem = {
  slug: string;
  name: string;
  icon: string;
  totalCost: number;
  headline: string;
  pos: [number, number, number];
  roof?: boolean;
  image: string | null;
  specs: [string, string][];
  posts: { title: string; slug: string }[];
};

export type ExplorerData = {
  systems: ExplorerSystem[];
  buildTotal: number;
  categories: { name: string; total: number }[];
  journal: { title: string; slug: string; date: string; readingTime: number }[];
};

// Hotspot coordinates tuned against the component layout in
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

// Real photos from the build archive (the systems.json heroImage paths do not
// exist on disk — these are verified present in public/).
const SYSTEM_IMAGE: Record<string, string> = {
  electrical: '/images/posts/electrical/IMG_3859.jpeg',
  plumbing: '/images/posts/plumbing/63219326097__A9D81835-3EA9-4071-89FF-EA2132234361.jpeg',
  hvac: '/images/posts/air-conditioner/64739653462__99D269C3-8908-4EBE-838D-8BF4FB8E6BEA.jpeg',
  solar: '/images/12-roof-solar-skylight.jpeg',
  propane: '/images/posts/propane/IMG_8459.jpeg',
  structural: '/images/posts/framing/IMG_1504.jpeg',
};

export function buildExplorerData(): ExplorerData {
  const posts = getAllPosts();
  const postById = new Map(posts.map((p) => [p.id, p]));

  const systems: ExplorerSystem[] = getAllSystems().map((s) => ({
    slug: s.slug,
    name: s.name,
    icon: s.icon,
    totalCost: Number(s.totalCost),
    headline: s.description,
    pos: HOTSPOT_POS[s.slug] ?? [0, 0, 0],
    roof: ROOF_SYSTEMS.has(s.slug),
    image: SYSTEM_IMAGE[s.slug] ?? null,
    specs: Object.entries(s.specs ?? {}).slice(0, 3) as [string, string][],
    posts: (s.relatedPosts ?? [])
      .map((id: string) => postById.get(id))
      .filter(Boolean)
      .slice(0, 3)
      .map((p) => ({ title: p!.title, slug: p!.slug })),
  }));

  return {
    systems,
    buildTotal: costsData.total,
    categories: costsData.categories.map((c) => ({ name: c.name, total: c.total })),
    journal: posts.map((p) => ({
      title: p.title,
      slug: p.slug,
      date: p.date,
      readingTime: Number(p.readingTime),
    })),
  };
}
