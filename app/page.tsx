import Link from 'next/link';
import { getFeaturedPosts } from '@/lib/posts';
import { getAllSystems } from '@/lib/systems';
import { getTotalCost } from '@/lib/costs';
import { formatDate } from '@/lib/posts';

export default function Home() {
  const featuredPosts = getFeaturedPosts();
  const systems = getAllSystems().slice(0, 6);
  const totalCost = getTotalCost();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Story-Driven */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient (you can replace with actual hero image) */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900">
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto py-20">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Building Freedom,
            <br />
            One Bolt at a Time
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100 mb-8 max-w-3xl mx-auto">
            The complete journey of transforming an empty 2019 Ford Transit into a full-time home on wheels — documented from first cut to final touch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/journal"
              className="bg-white text-emerald-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-50 transition-all hover:scale-105 shadow-2xl"
            >
              Explore the Build →
            </Link>
            <Link
              href="/for-sale"
              className="bg-emerald-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-600 transition-all hover:scale-105 shadow-2xl"
            >
              This Van is For Sale
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Quick Stats Strip */}
      <section className="py-16 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-emerald-900 mb-2">400hrs</div>
              <div className="text-gray-600 text-sm md:text-base">Of Work</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-emerald-900 mb-2">$30.5k</div>
              <div className="text-gray-600 text-sm md:text-base">Total Investment</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-emerald-900 mb-2">15</div>
              <div className="text-gray-600 text-sm md:text-base">Major Milestones</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-emerald-900 mb-2">4-Season</div>
              <div className="text-gray-600 text-sm md:text-base">Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Journey - Story Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              The Journey
            </h2>
            <p className="text-xl text-gray-600">
              From empty cargo van to full-time home
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              In March 2019, I bought an empty white Ford Transit cargo van with a vision: create a mobile home and office capable of full-time living anywhere in North America.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              <strong>I had no tools. No prior van-building experience.</strong> Just determination and an internet connection to learn from the generous vanlife community.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed">
              What followed was a 400-hour journey of cutting, measuring, wiring, plumbing, and problem-solving. This site documents every step — the successes, the mistakes, and the lessons learned. My hope is that it helps you build your own dream, or at least shows you what's possible with time, patience, and YouTube tutorials.
            </p>
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/about"
              className="text-emerald-700 hover:text-emerald-900 font-semibold text-lg flex items-center gap-2"
            >
              Read My Story
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Build Posts */}
      <section className="py-20 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Build Steps
            </h2>
            <p className="text-xl text-gray-600">
              Key milestones in the transformation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/journal/${post.slug}`}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105"
              >
                <div className="aspect-video bg-gray-200 relative">
                  {/* Placeholder for image */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <span className="text-6xl">{post.imageCount || 0}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-sm text-emerald-700 font-semibold mb-2">
                    {formatDate(post.date)}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{post.readingTime} min read</span>
                    {post.imageCount && <span>• {post.imageCount} photos</span>}
                    {post.cost && <span>• ${post.cost.toLocaleString()}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/journal"
              className="inline-block bg-emerald-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-800 transition-colors shadow-lg"
            >
              View Complete Build Timeline
            </Link>
          </div>
        </div>
      </section>

      {/* Systems Overview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Built for Adventure
            </h2>
            <p className="text-xl text-gray-600">
              Premium systems engineered for full-time off-grid living
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {systems.map((system) => (
              <Link
                key={system.id}
                href={`/systems/${system.slug}`}
                className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-emerald-500 transition-all hover:shadow-lg group"
              >
                <div className="text-5xl mb-4">{system.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-900 transition-colors">
                  {system.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {system.description}
                </p>
                <div className="text-emerald-700 font-semibold">
                  ${system.totalCost.toLocaleString()} invested
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/systems"
              className="text-emerald-700 hover:text-emerald-900 font-semibold text-lg flex items-center justify-center gap-2"
            >
              Explore All Systems
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Cost Transparency Callout */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Complete Cost Transparency
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Every dollar accounted for. No hidden costs, no surprises.
          </p>
          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 md:p-12 mb-8">
            <div className="text-6xl md:text-7xl font-bold text-emerald-400 mb-4">
              ${totalCost.toLocaleString()}
            </div>
            <div className="text-2xl text-gray-300">
              Total Build Cost
            </div>
          </div>
          <p className="text-lg text-gray-400 mb-8">
            Compare to professional builds: <strong className="text-white">$60,000 - $120,000</strong>
          </p>
          <Link
            href="/costs"
            className="inline-block bg-emerald-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-400 transition-colors"
          >
            View Detailed Breakdown
          </Link>
        </div>
      </section>

      {/* Community / Resources */}
      <section className="py-20 px-6 bg-emerald-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Built with Community Knowledge
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              This build wouldn't have been possible without the generous knowledge shared by the vanlife community. I learned from these incredible resources:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-bold text-lg text-gray-900 mb-2">FarOutRide</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive guide for nearly every system in the van
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-bold text-lg text-gray-900 mb-2">EXPLORIST.life</h3>
              <p className="text-gray-600 text-sm">
                Essential for understanding electrical systems
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Orton Travel Transit</h3>
              <p className="text-gray-600 text-sm">
                Go-to resource for 80/20 builds and critical systems
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg text-gray-700 mb-6">
              Now it's my turn to pay it forward. Use this documentation to build your own adventure.
            </p>
            <Link
              href="/contact"
              className="inline-block text-emerald-700 hover:text-emerald-900 font-semibold text-lg flex items-center justify-center gap-2"
            >
              Get in Touch
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - For Sale */}
      <section className="py-20 px-6 bg-emerald-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            This Van is Currently For Sale
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Own this exact build — fully tested, refined, and ready for adventure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <span className="text-5xl font-bold">$75,000</span>
            <span className="text-2xl text-emerald-200">OBO</span>
          </div>
          <Link
            href="/for-sale"
            className="inline-block bg-white text-emerald-900 px-10 py-4 rounded-full text-lg font-semibold hover:bg-emerald-50 transition-all hover:scale-105 shadow-2xl"
          >
            View Listing Details
          </Link>
        </div>
      </section>
    </div>
  );
}
