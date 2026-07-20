import Image from "next/image";
import Gallery from "@/components/Gallery";

export default function Home() {
  const galleryImages: Array<{ src: string; alt: string; width: number; height: number }> = [
    { src: '/images/01-hero-interior.jpeg', alt: 'Forest Queen Van completed interior with slatted wood ceiling, kitchen, and bed', width: 1200, height: 900 },
    { src: '/images/02-rear-doors-open.jpeg', alt: 'Relaxing on the bed with rear doors open to forest view', width: 1200, height: 900 },
    { src: '/images/03-indoor-garden.jpeg', alt: 'Indoor skylight garden with succulents and herbs', width: 1200, height: 900 },
    { src: '/images/04-kitchen-galley.jpeg', alt: 'Kitchen galley with butcher block countertop and subway tile backsplash', width: 1200, height: 900 },
    { src: '/images/05-butcher-block-extension.jpeg', alt: 'Expandable butcher block counter extension for extra workspace', width: 1200, height: 900 },
    { src: '/images/06-cabinets-construction.jpeg', alt: 'Building custom upper cabinets with 80/20 aluminum frame', width: 1200, height: 900 },
    { src: '/images/07-cabinet-storage.jpeg', alt: 'Overhead cabinet storage with kitchen supplies organized', width: 1200, height: 900 },
    { src: '/images/08-side-window.jpeg', alt: 'Installing side window for natural light and ventilation', width: 1200, height: 900 },
    { src: '/images/09-aluminum-framing.jpeg', alt: '80/20 aluminum frame construction for modular build', width: 1200, height: 900 },
    { src: '/images/10-electrical-system.jpeg', alt: 'Battle Born LiFePO4 batteries and Victron inverter electrical system', width: 1200, height: 900 },
    { src: '/images/11-water-plumbing.jpeg', alt: 'Fresh water plumbing system with heater and pump', width: 1200, height: 900 },
    { src: '/images/12-roof-solar-skylight.jpeg', alt: 'Rooftop solar panels and large skylight installation', width: 1200, height: 900 },
    { src: '/images/13-ac-ducts-bed.jpeg', alt: 'Convertible bed platform with air conditioning ducts', width: 1200, height: 900 },
    { src: '/images/14-propane-tank.jpeg', alt: 'Mounted propane tank for cooking and heating', width: 1200, height: 900 },
    { src: '/images/15-rear-systems.jpeg', alt: 'Rear systems compartment with propane and plumbing access', width: 1200, height: 900 },
    { src: '/images/16-skylight-kitchen-closeup.jpeg', alt: 'View through open skylight above kitchen sink and planter', width: 1200, height: 900 },
    { src: '/images/17-water-tank.jpeg', alt: '27-gallon fresh water tank mounted in aluminum frame', width: 1200, height: 900 },
    { src: '/images/18-ceiling-panel.jpeg', alt: 'Custom curved birch plywood ceiling panel fabrication', width: 1200, height: 900 },
    { src: '/images/19-cutting-roof.jpeg', alt: 'Cutting roof opening for skylight installation', width: 1200, height: 900 },
    { src: '/images/20-wall-panel-install.jpeg', alt: 'Installing birch plywood wall panels over insulation', width: 1200, height: 900 },
  ];


  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900">
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            Forest Queen Van
          </h1>
          <p className="text-2xl md:text-3xl text-emerald-100 mb-4">
            2019 Ford Transit 250 High Roof
          </p>
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-light">
            Premium Full-Time Off-Grid Adventure Build
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <span className="text-5xl font-bold text-white">$75,000</span>
            <span className="text-xl text-emerald-200">OBO</span>
          </div>
          <div className="mt-12">
            <a
              href="#contact"
              className="inline-block bg-white text-emerald-900 px-10 py-4 rounded-full text-lg font-semibold hover:bg-emerald-50 transition-all hover:scale-105 shadow-2xl"
            >
              Schedule a Viewing
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-900 mb-2">2019</div>
              <div className="text-gray-600">Model Year</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-900 mb-2">400W</div>
              <div className="text-gray-600">Solar Power</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-900 mb-2">400Ah</div>
              <div className="text-gray-600">Battery Bank</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-900 mb-2">4-Season</div>
              <div className="text-gray-600">Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
            Your Home On Wheels
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            Meet <strong>Forest Queen Van</strong>, a beautifully crafted, full-time-ready home on wheels built with care, precision, and love of the outdoors. This van was designed for people who want the freedom of the road without giving up comfort, craftsmanship, and function.
          </p>
          <p className="text-xl text-gray-700 leading-relaxed">
            This isn't a weekend conversion — it's a <strong>full-time living build</strong> engineered for balance between comfort, durability, and off-grid capability. Whether you're deep in the forest or working remotely on the coast, this van has everything you need for independent travel.
          </p>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16 text-center">
            Built For Adventure
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Electrical */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Electrical</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• 400Ah LiFePO4 batteries</li>
                <li>• Victron MultiPlus 3000 inverter</li>
                <li>• 400W solar array</li>
                <li>• DC-DC alternator charging</li>
                <li>• Smart battery monitoring</li>
              </ul>
            </div>

            {/* Interior */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Thoughtful Interior</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Custom birch wood paneling</li>
                <li>• Full-size bed with storage</li>
                <li>• Complete kitchenette</li>
                <li>• Dometic fridge + induction cooktop</li>
                <li>• 25-gal fresh/gray tanks</li>
              </ul>
            </div>

            {/* Climate */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">All-Season Comfort</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Full Thinsulate insulation</li>
                <li>• Diesel heater installed</li>
                <li>• MaxxAir ventilation fan</li>
                <li>• Heated flooring option</li>
                <li>• Four-season rated</li>
              </ul>
            </div>

            {/* Build Quality */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality Construction</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• 80/20 aluminum frame</li>
                <li>• Marine-grade plywood</li>
                <li>• Professional electrical work</li>
                <li>• High-end fixtures</li>
                <li>• Fully documented build</li>
              </ul>
            </div>

            {/* Storage */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Gear-Ready Storage</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Under-bed garage space</li>
                <li>• Overhead cabinets</li>
                <li>• Pull-out pantry</li>
                <li>• Fits bikes, boards, skis</li>
                <li>• Abundant clever storage</li>
              </ul>
            </div>

            {/* Lifestyle */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Live & Work</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Remote work ready</li>
                <li>• Starlink compatible</li>
                <li>• Convertible workspace</li>
                <li>• Stealth city parking</li>
                <li>• Full-time living tested</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Specs */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">
            Vehicle Details
          </h2>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Make & Model</h3>
                <p className="text-2xl font-bold text-gray-900">2019 Ford Transit 250</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Configuration</h3>
                <p className="text-2xl font-bold text-gray-900">High Roof, 148" WB</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Drivetrain</h3>
                <p className="text-2xl font-bold text-gray-900">RWD</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Engine</h3>
                <p className="text-2xl font-bold text-gray-900">3.7L V6</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Title</h3>
                <p className="text-2xl font-bold text-gray-900">Clean</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Location</h3>
                <p className="text-2xl font-bold text-gray-900">Nashville, TN</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Van Stands Out */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            Why This Van Stands Out
          </h2>
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-xl leading-relaxed text-gray-300 mb-6">
              This is more than a weekend warrior van—it's consciously built for long-term living and traveling in comfort and style. From the detailed electrical architecture to the interior aesthetic, it's a ready-to-go premium platform—no major modifications needed.
            </p>
            <p className="text-xl leading-relaxed text-gray-300">
              If you're looking for a van that's polished, functional, and built to explore, this is it. Forest Queen Van was designed to be <strong className="text-white">lived in</strong> — not just camped in. It's stealthy enough for urban life, capable enough for mountain trails, and beautiful enough to feel like home wherever you park it.
            </p>
          </div>
        </div>
      </section>

      {/* Ideal For */}
      <section className="py-20 px-6 bg-emerald-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
            Perfect For
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-3">Digital Nomads</h3>
              <p className="text-emerald-100">Remote workers needing a mobile office plus a comfortable home base.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-3">Outdoor Enthusiasts</h3>
              <p className="text-emerald-100">Gear storage for bikes, boards, and climbing equipment with a versatile living space.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-3">Urban Explorers</h3>
              <p className="text-emerald-100">Stealth design blends into neighborhoods while supporting full-time living.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-3">Adventure Seekers</h3>
              <p className="text-emerald-100">Buy and go—with a build that's done, tested, and refined for the road.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">
            Gallery
          </h2>
          <Gallery images={galleryImages} />
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
            Schedule a Viewing
          </h2>
          <p className="text-xl text-gray-700 text-center mb-12">
            Serious inquiries only. Located in Nashville, TN. Buyer arranges transport or local pickup.
          </p>

          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Tell us about yourself and your interest in Forest Queen Van..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-900 text-white py-4 rounded-lg text-lg font-semibold hover:bg-emerald-800 transition-colors"
            >
              Send Inquiry
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Or reach out directly:</p>
            <div className="space-y-2">
              <p className="text-lg">
                <a href="mailto:hello@forestqueenvan.com" className="text-emerald-900 hover:underline font-semibold">
                  hello@forestqueenvan.com
                </a>
              </p>
              <p className="text-sm text-gray-500">
                Visit the build journal: <a href="https://forestqueenvan.com" className="text-emerald-900 hover:underline">forestqueenvan.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Forest Queen Van</h3>
          <p className="text-gray-400 mb-6">2019 Ford Transit 250 • Nashville, TN • $75,000 OBO</p>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
