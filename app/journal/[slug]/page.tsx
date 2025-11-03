import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, formatDate } from '@/lib/posts';
import { getSystemBySlug } from '@/lib/systems';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} - Build Journal - Forest Queen Van`,
    description: post.excerpt,
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image Section */}
      <section className="relative h-96 bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 h-full flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Build Journal
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-white/80">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(post.date)}
              </span>
              <span>•</span>
              <span>{post.readingTime} min read</span>
              {post.imageCount && (
                <>
                  <span>•</span>
                  <span>{post.imageCount} photos</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-emerald-700">Home</Link>
            <span>/</span>
            <Link href="/journal" className="hover:text-emerald-700">Build Journal</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{post.title}</span>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <article className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Categories */}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.categories.map((category) => (
                <span
                  key={category}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Cost Callout */}
          {post.cost && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-lg mb-8">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-sm text-emerald-700 font-medium">Project Cost</div>
                  <div className="text-2xl font-bold text-emerald-900">${post.cost.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none prose-emerald">
            {/* Render markdown content as HTML */}
            <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>').replace(/## /g, '<h2>').replace(/<\/h2><br\/>/g, '</h2>').replace(/### /g, '<h3>').replace(/<\/h3><br\/>/g, '</h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/- /g, '<li>').replace(/<li>/g, '<ul><li>').replace(/<\/li><br\/>/g, '</li></ul>') }} />
          </div>

          {/* Gallery */}
          {post.gallery.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Photos ({post.gallery.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.gallery.map((image, index) => (
                  <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative group hover:scale-105 transition-transform duration-300">
                    <img
                      src={image}
                      alt={`${post.title} - Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Systems */}
          {post.systems.length > 0 && (
            <div className="mt-16 p-8 bg-gray-50 rounded-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Systems</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {post.systems.map((systemSlug) => {
                  const system = getSystemBySlug(systemSlug);
                  if (!system) return null;
                  return (
                    <Link
                      key={system.id}
                      href={`/systems/${system.slug}`}
                      className="flex items-center gap-4 p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
                    >
                      <div className="text-3xl">{system.icon}</div>
                      <div>
                        <div className="font-semibold text-gray-900">{system.name}</div>
                        <div className="text-sm text-gray-600">${system.totalCost.toLocaleString()}</div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Post Navigation */}
      <section className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Previous Post */}
            {prevPost && (
              <Link
                href={`/journal/${prevPost.slug}`}
                className="group flex items-start gap-4 p-6 bg-white rounded-xl hover:shadow-lg transition-all border border-gray-200"
              >
                <div className="text-gray-400 group-hover:text-emerald-700 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Previous Post</div>
                  <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {prevPost.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{formatDate(prevPost.date)}</div>
                </div>
              </Link>
            )}

            {/* Next Post */}
            {nextPost && (
              <Link
                href={`/journal/${nextPost.slug}`}
                className="group flex items-start gap-4 p-6 bg-white rounded-xl hover:shadow-lg transition-all border border-gray-200 md:ml-auto md:text-right"
              >
                <div className="md:order-2 text-gray-400 group-hover:text-emerald-700 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="md:order-1">
                  <div className="text-sm text-gray-500 mb-1">Next Post</div>
                  <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {nextPost.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{formatDate(nextPost.date)}</div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-emerald-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Enjoying the Build Journey?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Explore the complete system breakdowns and cost transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/systems"
              className="bg-white text-emerald-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-50 transition-colors"
            >
              View All Systems
            </Link>
            <Link
              href="/costs"
              className="bg-emerald-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-600 transition-colors border-2 border-emerald-600"
            >
              See Cost Breakdown
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
