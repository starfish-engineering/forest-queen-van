import postsData from '@/data/posts.json';

export interface Post {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  gallery: string[];
  categories: string[];
  systems: string[];
  readingTime: number;
  imageCount: number;
  cost?: number;
}

export function getAllPosts(): Post[] {
  return postsData as Post[];
}

export function getPostBySlug(slug: string): Post | undefined {
  return postsData.find((post) => post.slug === slug) as Post | undefined;
}

export function getPostsByCategory(category: string): Post[] {
  return postsData.filter((post) =>
    post.categories.includes(category)
  ) as Post[];
}

export function getPostsBySystem(system: string): Post[] {
  return postsData.filter((post) =>
    post.systems.includes(system)
  ) as Post[];
}

export function getRecentPosts(limit: number = 5): Post[] {
  return postsData
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit) as Post[];
}

export function getFeaturedPosts(): Post[] {
  // Return key milestone posts
  const featured = [
    'framing-2020-09',
    'electrical-2022-07',
    'floor-2022-07',
    'slats-2021-09',
    'garden-2024-07'
  ];

  return postsData.filter((post) =>
    featured.includes(post.id)
  ) as Post[];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}
