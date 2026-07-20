import Link from 'next/link';
import { getAllPosts, formatDate } from '@/lib/posts';

export const metadata = {
  title: 'Build Journal - Forest Queen Van',
  description: 'Complete timeline of the Forest Queen Van build from empty cargo van to finished home - 15 major milestones documented with photos and details.',
};

export default function JournalPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-900 to-teal-800 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            The Build Journal
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100 mb-8">
            From empty cargo van to full-time home — every step documented
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">{posts.length}</div>
              <div className="text-emerald-200">Build Posts</div>
            </div>
            <div>
              <div className="text-4xl font-bold">400+</div>
              <div className="text-emerald-200">Photos</div>
            </div>
            <div>
              <div className="text-4xl font-bold">4yrs</div>
              <div className="text-emerald-200">Timeline</div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline View */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-emerald-200 transform md:-translate-x-1/2"></div>

            {/* Timeline Items */}
            <div className="space-y-12">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className={`relative flex flex-col md:flex-row gap-8 ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-emerald-600 rounded-full transform -translate-x-1/2 md:translate-x-0 ring-4 ring-white"></div>

                  {/* Content Card */}
                  <div className={`flex-1 ml-16 md:ml-0 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                    <Link
                      href={`/journal/${post.slug}`}
                      className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 overflow-hidden border border-gray-100"
                    >
                      {/* Image Placeholder */}
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        {post.featuredImage ? (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-5xl text-gray-400 mb-2">{post.imageCount || 0}</div>
                              <div className="text-sm text-gray-500">photos</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Date */}
                        <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold mb-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(post.date)}
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                          {post.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {post.readingTime} min read
                          </span>
                          {post.imageCount && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {post.imageCount} photos
                            </span>
                          )}
                          {post.cost && (
                            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              ${post.cost.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Categories */}
                        {post.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {post.categories.map((category) => (
                              <span
                                key={category}
                                className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-emerald-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to explore the systems in depth?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Dive into detailed breakdowns of the electrical, plumbing, HVAC, and structural systems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/systems"
              className="bg-emerald-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-800 transition-colors shadow-lg"
            >
              Explore Systems
            </Link>
            <Link
              href="/costs"
              className="bg-white text-emerald-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border-2 border-emerald-900"
            >
              View Cost Breakdown
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
