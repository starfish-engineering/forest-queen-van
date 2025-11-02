import Link from 'next/link';

export const metadata = {
  title: 'About Shaun - Forest Queen Van',
  description: 'The story behind Forest Queen Van - from zero experience to a complete DIY camper van conversion in 400 hours.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-teal-900 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-7xl mb-6 animate-bounce">👋</div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Hi, I'm Shaun
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100 leading-relaxed">
            Builder of things. Documenter of processes. Believer that anyone can build a van with
            enough YouTube tutorials and stubbornness.
          </p>
        </div>
      </section>

      {/* The Story */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">The Story</h2>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              In late 2019, I had a vision: build a mobile home and office that could take me anywhere
              in North America. The catch? I had <strong>zero tools</strong> and <strong>zero van-building
              experience</strong>.
            </p>

            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              In March 2019, I bought an empty white Ford Transit cargo van. It was just a metal shell
              with nothing but dreams inside.
            </p>

            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-8 rounded-r-2xl my-8">
              <p className="text-lg text-emerald-900 italic">
                "I started with nothing but an internet connection and determination. Every system, every
                cut, every wire was a first-time experience. If I could do it, anyone can."
              </p>
            </div>

            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              What followed was a <strong>400-hour journey</strong> spread across 4 years. I worked weekends,
              nights, and every spare moment. I made mistakes. I cut things twice. I learned to solder. I
              learned about battery chemistry. I learned that spray foam expands <em>a lot</em>.
            </p>

            <p className="text-xl text-gray-700 leading-relaxed">
              The van became more than a project—it became a teacher. Every challenge was a lesson in problem-solving,
              patience, and persistence.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">By the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-emerald-900 mb-2">0</div>
              <div className="text-gray-600">Prior Experience</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-emerald-900 mb-2">400+</div>
              <div className="text-gray-600">Hours of Work</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-emerald-900 mb-2">15</div>
              <div className="text-gray-600">Major Systems</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-emerald-900 mb-2">∞</div>
              <div className="text-gray-600">YouTube Tutorials</div>
            </div>
          </div>
        </div>
      </section>

      {/* Build Philosophy */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Build Philosophy</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200 hover:border-emerald-500 transition-all">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality Over Speed</h3>
              <p className="text-gray-700">
                Four years might seem long, but every system was built right the first time. No shortcuts,
                no "good enough for now."
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200 hover:border-emerald-500 transition-all">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Document Everything</h3>
              <p className="text-gray-700">
                I learned from generous builders who shared online. This site is my way of paying that
                knowledge forward.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200 hover:border-emerald-500 transition-all">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Thoughtful Design</h3>
              <p className="text-gray-700">
                Every decision considered full-time living. Not a weekend warrior van—a legitimate home
                that happens to have wheels.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200 hover:border-emerald-500 transition-all">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Continuous Improvement</h3>
              <p className="text-gray-700">
                The build evolved over time. What worked stayed. What didn't got redesigned. The van today
                is better than version 1.0.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources I Used */}
      <section className="py-20 px-6 bg-emerald-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How I Learned</h2>
          <p className="text-xl text-gray-600 mb-12">
            Three resources taught me (almost) everything
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <div className="text-4xl mb-4">🚐</div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">FarOutRide</h3>
              <p className="text-gray-600 text-sm mb-4">
                Comprehensive guide for nearly every system in the van. My electrical and plumbing knowledge
                came from here.
              </p>
              <div className="text-emerald-700 font-semibold text-sm">System Deep-Dives</div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">EXPLORIST.life</h3>
              <p className="text-gray-600 text-sm mb-4">
                Essential for understanding electrical systems. Their wiring diagrams and battery guides
                saved me countless headaches.
              </p>
              <div className="text-emerald-700 font-semibold text-sm">Electrical Mastery</div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">Orton Travel Transit</h3>
              <p className="text-gray-600 text-sm mb-4">
                Go-to resource for 80/20 builds and critical systems. Their floor design inspired my
                modular approach.
              </p>
              <div className="text-emerald-700 font-semibold text-sm">80/20 Expertise</div>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Timeline */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">The Timeline</h2>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-emerald-200 transform -translate-x-1/2 hidden md:block"></div>

            <div className="space-y-12">
              <div className="flex items-center gap-8">
                <div className="flex-1 text-right">
                  <div className="bg-white p-6 rounded-xl shadow-lg inline-block">
                    <div className="font-bold text-emerald-700 mb-2">Late 2019</div>
                    <div className="text-gray-900">Initial design concept begins</div>
                  </div>
                </div>
                <div className="w-4 h-4 bg-emerald-600 rounded-full ring-4 ring-white z-10"></div>
                <div className="flex-1"></div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex-1"></div>
                <div className="w-4 h-4 bg-emerald-600 rounded-full ring-4 ring-white z-10"></div>
                <div className="flex-1">
                  <div className="bg-white p-6 rounded-xl shadow-lg inline-block">
                    <div className="font-bold text-emerald-700 mb-2">March 2019</div>
                    <div className="text-gray-900">Purchased empty Ford Transit cargo van</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex-1 text-right">
                  <div className="bg-white p-6 rounded-xl shadow-lg inline-block">
                    <div className="font-bold text-emerald-700 mb-2">2020-2023</div>
                    <div className="text-gray-900">Build transformation across both coasts</div>
                  </div>
                </div>
                <div className="w-4 h-4 bg-emerald-600 rounded-full ring-4 ring-white z-10"></div>
                <div className="flex-1"></div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex-1"></div>
                <div className="w-4 h-4 bg-emerald-600 rounded-full ring-4 ring-white z-10"></div>
                <div className="flex-1">
                  <div className="bg-white p-6 rounded-xl shadow-lg inline-block">
                    <div className="font-bold text-emerald-700 mb-2">2024</div>
                    <div className="text-gray-900">Final touches, garden installation, documentation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Location */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-4">📍</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Where I Am Now</h3>
          <p className="text-xl text-gray-600">
            Washington State, USA
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-emerald-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Want to Connect?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Questions about the build? Thinking about starting your own? Let's talk.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-emerald-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-50 hover:scale-105 transition-all"
            >
              Get in Touch
            </Link>
            <Link
              href="/journal"
              className="bg-emerald-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-600 hover:scale-105 transition-all border-2 border-emerald-600"
            >
              Read the Build Journal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
