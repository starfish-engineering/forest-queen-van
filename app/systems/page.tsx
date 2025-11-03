import Link from 'next/link';
import { getAllSystems } from '@/lib/systems';
import { getTotalSystemsCost } from '@/lib/systems';

export const metadata = {
  title: 'Systems - Forest Queen Van Build',
  description: 'Deep dive into the electrical, plumbing, HVAC, solar, propane, and structural systems that make the Forest Queen Van a world-class off-grid home.',
};

export default function SystemsPage() {
  const systems = getAllSystems();
  const totalCost = getTotalSystemsCost();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-24 px-6">
        <div className="absolute inset-0">
          <img
            src="/images/posts/electrical/IMG_3859.jpeg"
            alt="Electrical system"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-teal-800/85 to-green-900/90"></div>
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
            🔧 Technical Deep Dive
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            The Systems
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto mb-8">
            Every bolt, wire, and pipe documented. This is how you build a mobile home that actually works.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold">6</div>
              <div className="text-emerald-200 text-sm md:text-base">Major Systems</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold">${(totalCost / 1000).toFixed(1)}k</div>
              <div className="text-emerald-200 text-sm md:text-base">Total Investment</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold">100%</div>
              <div className="text-emerald-200 text-sm md:text-base">Off-Grid Capable</div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-6xl opacity-10 animate-bounce">⚡</div>
        <div className="absolute bottom-10 right-10 text-6xl opacity-10 animate-pulse">💧</div>
      </section>

      {/* Systems Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {systems.map((system, index) => (
              <Link
                key={system.id}
                href={`/systems/${system.slug}`}
                className="group relative bg-white rounded-3xl border-2 border-gray-200 p-8 hover:border-emerald-500 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Icon */}
                <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {system.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                  {system.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {system.description}
                </p>

                {/* Stats Bar */}
                <div className="space-y-3">
                  {/* Cost */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Investment</span>
                    <span className="font-bold text-emerald-700">${system.totalCost.toLocaleString()}</span>
                  </div>

                  {/* Components Count */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Components</span>
                    <span className="font-semibold text-gray-900">{system.components.length}</span>
                  </div>

                  {/* Related Posts */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Build Posts</span>
                    <span className="font-semibold text-gray-900">{system.relatedPosts.length}</span>
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* Progress Bar at Bottom */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-1000 group-hover:bg-emerald-500"
                        style={{ width: `${Math.min((system.totalCost / totalCost) * 100 * 6, 100)}%` }}
                      ></div>
                    </div>
                    <span className="font-medium">{((system.totalCost / totalCost) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Cost Comparison */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Cost Breakdown
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            See where every dollar went
          </p>

          {/* Visual Cost Bars */}
          <div className="space-y-4 mb-12">
            {systems.map((system) => (
              <div key={system.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{system.icon}</span>
                    <span className="font-semibold text-gray-900">{system.name}</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-700">
                    ${system.totalCost.toLocaleString()}
                  </span>
                </div>
                <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-1000 hover:from-emerald-600 hover:to-teal-600"
                    style={{ width: `${(system.totalCost / totalCost) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-emerald-500">
            <div className="text-sm text-gray-500 mb-2">Total Systems Cost</div>
            <div className="text-5xl font-bold text-emerald-900 mb-4">${totalCost.toLocaleString()}</div>
            <div className="text-gray-600">
              Part of the total ${(totalCost + 11300).toLocaleString()} build
            </div>
          </div>

          <div className="mt-12">
            <Link
              href="/costs"
              className="inline-block bg-emerald-900 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-emerald-800 hover:scale-105 transition-all shadow-lg"
            >
              View Complete Cost Breakdown →
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white rounded-3xl p-12 text-center">
            <div className="text-5xl mb-6">💡</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Build Philosophy
            </h2>
            <p className="text-xl text-emerald-100 leading-relaxed">
              Every system was chosen for reliability, repairability, and proven performance in the field.
              No proprietary black boxes. No mystery parts. Just solid engineering that you can understand,
              maintain, and fix anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* CTA to Journal */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            See How It All Came Together
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Follow the complete build timeline from first cut to final bolt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/journal"
              className="bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 hover:scale-105 transition-all"
            >
              Read Build Journal
            </Link>
            <Link
              href="/for-sale"
              className="bg-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-500 hover:scale-105 transition-all"
            >
              This Van is For Sale
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
