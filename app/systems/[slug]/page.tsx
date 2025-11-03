import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllSystems, getSystemBySlug } from '@/lib/systems';
import { getAllPosts } from '@/lib/posts';
import { formatDate } from '@/lib/posts';

export async function generateStaticParams() {
  const systems = getAllSystems();
  return systems.map((system) => ({
    slug: system.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const system = getSystemBySlug(params.slug);

  if (!system) {
    return {
      title: 'System Not Found',
    };
  }

  return {
    title: `${system.name} - Systems - Forest Queen Van`,
    description: system.description,
  };
}

export default function SystemPage({ params }: { params: { slug: string } }) {
  const system = getSystemBySlug(params.slug);

  if (!system) {
    notFound();
  }

  const allPosts = getAllPosts();
  const relatedPosts = allPosts.filter(post => system.relatedPosts.includes(post.id));

  // Map systems to background images
  const systemBackgrounds: Record<string, string> = {
    'electrical': '/images/posts/electrical/IMG_3859.jpeg',
    'plumbing': '/images/posts/plumbing/IMG_4964.jpeg',
    'hvac': '/images/posts/air-conditioner/IMG_7741.jpeg',
    'solar': '/images/posts/roof/IMG_5884.jpeg',
    'propane': '/images/posts/propane/IMG_8459.jpeg',
    'structural': '/images/posts/framing/IMG_1504.jpeg',
  };

  const backgroundImage = systemBackgrounds[system.slug] || '/images/posts/electrical/IMG_3859.jpeg';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-20 px-6">
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt={system.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 to-teal-900/90"></div>
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <Link
            href="/systems"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Systems
          </Link>

          <div className="flex items-start gap-6 mb-8">
            <div className="text-8xl animate-bounce">{system.icon}</div>
            <div className="flex-1">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                {system.name}
              </h1>
              <p className="text-xl text-emerald-100 leading-relaxed">
                {system.description}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">${(system.totalCost / 1000).toFixed(1)}k</div>
              <div className="text-emerald-200 text-sm">Total Cost</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{system.components.length}</div>
              <div className="text-emerald-200 text-sm">Components</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{relatedPosts.length}</div>
              <div className="text-emerald-200 text-sm">Build Posts</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">✓</div>
              <div className="text-emerald-200 text-sm">Tested</div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications */}
      {Object.keys(system.specs).length > 0 && (
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Specifications</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(system.specs).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-105 border-l-4 border-emerald-500"
                >
                  <div className="text-sm font-semibold text-emerald-700 mb-2">{key}</div>
                  <div className="text-lg text-gray-900">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Components Breakdown */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Components</h2>
          <p className="text-xl text-gray-600 mb-12">Every part that makes this system work</p>

          <div className="space-y-6">
            {system.components.map((component, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-emerald-500 p-8 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    {/* Component Name */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">
                        {component.quantity > 1 ? `${component.quantity}×` : ''}
                      </span>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {component.name}
                      </h3>
                    </div>

                    {/* Specs */}
                    <p className="text-gray-600 mb-3">
                      <strong>Specs:</strong> {component.specs}
                    </p>

                    {/* Purpose */}
                    <p className="text-gray-700 italic">
                      "{component.purpose}"
                    </p>

                    {/* Vendor */}
                    <div className="mt-4 text-sm text-gray-500">
                      <strong>Vendor:</strong> {component.vendor}
                    </div>
                  </div>

                  {/* Cost Badge */}
                  <div className="text-right">
                    <div className="bg-emerald-50 text-emerald-900 px-6 py-3 rounded-full font-bold text-xl whitespace-nowrap group-hover:bg-emerald-100 transition-colors">
                      ${component.cost.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Interactive Progress Bar */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-1000 group-hover:bg-emerald-500"
                        style={{ width: `${(component.cost / system.totalCost) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                      {((component.cost / system.totalCost) * 100).toFixed(1)}% of system
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Cost Summary */}
          <div className="mt-12 bg-gradient-to-br from-emerald-900 to-teal-900 text-white rounded-3xl p-8 text-center">
            <div className="text-sm text-emerald-200 mb-2">System Total</div>
            <div className="text-5xl font-bold mb-2">${system.totalCost.toLocaleString()}</div>
            <div className="text-emerald-200">
              {system.components.length} components installed
            </div>
          </div>
        </div>
      </section>

      {/* Power Analysis (if available) */}
      {system.powerAnalysis && (
        <section className="py-16 px-6 bg-gradient-to-br from-gray-50 to-emerald-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Power Analysis</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {Object.entries(system.powerAnalysis).map(([category, items]) => (
                <div key={category} className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{category}</h3>
                  {typeof items === 'object' && !Array.isArray(items) ? (
                    <div className="space-y-3">
                      {Object.entries(items).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center pb-3 border-b border-gray-200 last:border-0">
                          <span className="text-gray-700">{key}</span>
                          <span className="font-semibold text-emerald-700">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700">{String(items)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Build Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Build Posts</h2>
            <p className="text-xl text-gray-600 mb-12">
              See how this system was installed and tested
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/journal/${post.slug}`}
                  className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-emerald-500 overflow-hidden hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <span className="text-5xl">{post.imageCount || 0}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-emerald-700 font-semibold mb-2">
                      {formatDate(post.date)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-6 bg-emerald-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Explore More Systems
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            See how all the systems work together to create a complete off-grid home
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/systems"
              className="bg-white text-emerald-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-50 hover:scale-105 transition-all"
            >
              ← All Systems
            </Link>
            <Link
              href="/costs"
              className="bg-emerald-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-600 hover:scale-105 transition-all border-2 border-emerald-600"
            >
              Cost Breakdown →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
