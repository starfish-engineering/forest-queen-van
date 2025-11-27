import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Find NYC's Next
              <span className="block text-accent-primary mt-2">Investment Opportunity</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary mb-8 max-w-2xl leading-relaxed">
              Real-time intelligence on neighborhoods, construction activity, and emerging trends.
              Stop guessing. Start investing with data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/app"
                className="px-8 py-4 bg-accent-primary text-primary font-medium rounded text-center hover:bg-accent-primary/90 transition-colors"
              >
                Try Lookup Mode Free
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 bg-secondary text-primary font-medium rounded text-center border border-border hover:bg-secondary/80 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="bg-secondary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <div className="inline-block px-3 py-1 bg-danger/10 text-danger text-sm font-medium rounded mb-6">
                The Problem
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
                Manual Research is Killing Your Returns
              </h2>
              <ul className="space-y-4 text-secondary">
                <li className="flex items-start gap-3">
                  <span className="text-danger mt-1">×</span>
                  <span>Hours spent manually tracking construction permits across NYC agencies</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-danger mt-1">×</span>
                  <span>Missing early signals of neighborhood transformation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-danger mt-1">×</span>
                  <span>No systematic way to compare investment opportunities</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-danger mt-1">×</span>
                  <span>Outdated data leading to poor investment decisions</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="inline-block px-3 py-1 bg-accent-primary/10 text-accent-primary text-sm font-medium rounded mb-6">
                The Solution
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
                Automated Intelligence, Better Decisions
              </h2>
              <ul className="space-y-4 text-secondary">
                <li className="flex items-start gap-3">
                  <span className="text-accent-primary mt-1">✓</span>
                  <span>Real-time permit data aggregated from multiple NYC sources</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent-primary mt-1">✓</span>
                  <span>Algorithmic scoring identifies high-potential neighborhoods</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent-primary mt-1">✓</span>
                  <span>City-wide heatmaps reveal trends before they're obvious</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent-primary mt-1">✓</span>
                  <span>Due diligence on specific addresses in seconds, not hours</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-5xl font-bold mb-4">
              Bloomberg Terminal meets Real Estate
            </h2>
            <p className="text-secondary text-lg max-w-2xl mx-auto">
              Professional-grade tools designed for serious investors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-secondary border border-border/30 rounded-lg p-6 hover:border-accent-primary/50 transition-colors">
              <div className="w-12 h-12 bg-accent-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Interactive Maps</h3>
              <p className="text-secondary text-sm">
                City-wide heatmaps and detailed neighborhood views with real-time permit overlays
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-secondary border border-border/30 rounded-lg p-6 hover:border-accent-primary/50 transition-colors">
              <div className="w-12 h-12 bg-accent-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Permit Tracking</h3>
              <p className="text-secondary text-sm">
                Track construction, renovation, and development activity from DOB, DOT, and more
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-secondary border border-border/30 rounded-lg p-6 hover:border-accent-primary/50 transition-colors">
              <div className="w-12 h-12 bg-accent-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Smart Scoring</h3>
              <p className="text-secondary text-sm">
                Algorithmic neighborhood scores based on development velocity and business growth
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-secondary border border-border/30 rounded-lg p-6 hover:border-accent-primary/50 transition-colors">
              <div className="w-12 h-12 bg-accent-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Trend Detection</h3>
              <p className="text-secondary text-sm">
                Spot emerging neighborhoods before the market catches on with trend indicators
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-secondary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-5xl font-bold mb-4">
              From Research to Investment in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-primary/10 text-accent-primary font-display text-2xl font-bold rounded-full mb-6">
                1
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Explore or Search</h3>
              <p className="text-secondary">
                Use Scout Mode to scan the entire city, or Lookup Mode to investigate a specific address
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-primary/10 text-accent-primary font-display text-2xl font-bold rounded-full mb-6">
                2
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Analyze Data</h3>
              <p className="text-secondary">
                Review permit history, neighborhood scores, business activity, and construction trends
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-primary/10 text-accent-primary font-display text-2xl font-bold rounded-full mb-6">
                3
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Make Decisions</h3>
              <p className="text-secondary">
                Invest with confidence backed by real-time data and algorithmic intelligence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-5xl font-bold mb-4">
              Built for Real Estate Professionals
            </h2>
            <p className="text-secondary text-lg">
              Trusted by investors who need data, not hunches
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-secondary border border-border/30 rounded-lg p-8">
              <div className="font-mono text-4xl font-bold text-accent-primary mb-2">500K+</div>
              <div className="text-secondary">Permits Tracked</div>
            </div>
            <div className="bg-secondary border border-border/30 rounded-lg p-8">
              <div className="font-mono text-4xl font-bold text-accent-primary mb-2">240+</div>
              <div className="text-secondary">Neighborhoods Analyzed</div>
            </div>
            <div className="bg-secondary border border-border/30 rounded-lg p-8">
              <div className="font-mono text-4xl font-bold text-accent-primary mb-2">Real-Time</div>
              <div className="text-secondary">Data Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-br from-accent-primary/10 via-transparent to-transparent py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-5xl font-bold mb-6">
            Ready to Find Your Next Deal?
          </h2>
          <p className="text-secondary text-lg mb-8 max-w-2xl mx-auto">
            Start with Lookup Mode for free. Upgrade to Scout Mode when you're ready to discover city-wide opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app"
              className="px-8 py-4 bg-accent-primary text-primary font-medium rounded text-center hover:bg-accent-primary/90 transition-colors"
            >
              Launch Lookup Mode
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-secondary text-primary font-medium rounded text-center border border-border hover:bg-secondary/80 transition-colors"
            >
              Compare Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
