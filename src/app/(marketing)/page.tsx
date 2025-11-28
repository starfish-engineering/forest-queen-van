import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-primary overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Animated grid background */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 212, 255, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 212, 255, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
          {/* Radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-accent-primary/5 rounded-full blur-3xl" />
          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-accent-primary/10 via-transparent to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text content */}
            <div className="space-y-8">
              {/* Terminal badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/80 border border-border/50 rounded-full backdrop-blur-sm">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-xs font-mono text-secondary uppercase tracking-wider">Live NYC Data</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
                <span className="block text-primary">Real Estate</span>
                <span className="block text-primary">Intelligence for</span>
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-cyan-400 to-accent-primary">
                    NYC Investors
                  </span>
                  <span className="absolute -inset-x-2 bottom-0 h-4 bg-accent-primary/20 -z-10 -skew-x-6" />
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-secondary max-w-xl leading-relaxed">
                Track permits. Score neighborhoods. Spot trends before the market.
                <span className="block mt-2 text-tertiary">
                  Data-driven due diligence in seconds, not hours.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/app"
                  className="group relative px-8 py-4 font-medium rounded-lg text-center overflow-hidden"
                >
                  <span className="absolute inset-0 bg-accent-primary" />
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <span className="relative text-inverse flex items-center justify-center gap-2">
                    Launch App
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/pricing"
                  className="px-8 py-4 font-medium rounded-lg text-center border border-border/50 hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all duration-300 text-primary"
                >
                  View Pricing
                </Link>
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-border/30">
                <div>
                  <div className="font-mono text-2xl font-bold text-accent-primary">500K+</div>
                  <div className="text-xs text-tertiary uppercase tracking-wider mt-1">Permits Indexed</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-accent-primary">240+</div>
                  <div className="text-xs text-tertiary uppercase tracking-wider mt-1">Neighborhoods</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-success">LIVE</div>
                  <div className="text-xs text-tertiary uppercase tracking-wider mt-1">Data Updates</div>
                </div>
              </div>
            </div>

            {/* Right: Terminal mockup */}
            <div className="hidden lg:block relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-accent-primary/20 to-transparent rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-secondary/80 backdrop-blur border border-border/50 rounded-xl overflow-hidden shadow-2xl">
                {/* Terminal header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-tertiary/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-danger/80" />
                    <div className="w-3 h-3 rounded-full bg-warning/80" />
                    <div className="w-3 h-3 rounded-full bg-success/80" />
                  </div>
                  <span className="text-xs font-mono text-tertiary ml-2">capex-scout — neighborhood-analysis</span>
                </div>
                
                {/* Terminal content */}
                <div className="p-6 font-mono text-sm space-y-4">
                  {/* Search */}
                  <div className="flex items-center gap-2 text-secondary">
                    <span className="text-accent-primary">❯</span>
                    <span>lookup</span>
                    <span className="text-accent-primary">&quot;123 Atlantic Ave, Brooklyn&quot;</span>
                  </div>
                  
                  {/* Output */}
                  <div className="pl-4 border-l-2 border-border/50 space-y-3">
                    <div className="text-tertiary text-xs uppercase tracking-wider">Census Tract 0285.00</div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-tertiary text-xs">Investment Score</div>
                        <div className="text-3xl font-bold text-accent-primary">78</div>
                      </div>
                      <div>
                        <div className="text-tertiary text-xs">6mo Permits</div>
                        <div className="text-3xl font-bold text-primary">47</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-tertiary text-xs">Activity Trend</div>
                      <div className="flex items-center gap-2">
                        <span className="text-success">▲</span>
                        <span className="text-success font-medium">+23%</span>
                        <span className="text-tertiary">vs prev. 6mo</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="px-2 py-1 text-xs bg-accent-primary/10 text-accent-primary rounded">New Construction</span>
                      <span className="px-2 py-1 text-xs bg-success/10 text-success rounded">High Growth</span>
                      <span className="px-2 py-1 text-xs bg-warning/10 text-warning rounded">Emerging</span>
                    </div>
                  </div>
                  
                  {/* Cursor */}
                  <div className="flex items-center gap-2 text-secondary">
                    <span className="text-accent-primary">❯</span>
                    <span className="w-2 h-4 bg-accent-primary animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / Trust bar */}
      <section className="relative py-12 border-y border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <span className="text-xs text-tertiary uppercase tracking-widest">Data Sources</span>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
              <span className="font-mono text-sm text-secondary">NYC DOB</span>
              <span className="font-mono text-sm text-secondary">DOT</span>
              <span className="font-mono text-sm text-secondary">DCA</span>
              <span className="font-mono text-sm text-secondary">SLA</span>
              <span className="font-mono text-sm text-secondary">Census Bureau</span>
            </div>
          </div>
        </div>
      </section>

      {/* Two Modes Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/50 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Two Ways to Find Your Edge
            </h2>
            <p className="text-secondary text-lg max-w-2xl mx-auto">
              Whether you're researching a specific property or scanning for city-wide opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Lookup Mode */}
            <div className="group relative">
              <div className="absolute -inset-px bg-gradient-to-br from-accent-primary/50 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-full bg-secondary border border-border/30 rounded-2xl p-8 hover:border-accent-primary/30 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-primary">Lookup Mode</h3>
                    <span className="text-xs font-mono text-success uppercase tracking-wider">Free</span>
                  </div>
                </div>
                
                <p className="text-secondary mb-6 leading-relaxed">
                  Got an address? Get instant due diligence. Neighborhood scores, permit history, and trends for any NYC property.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {['Address search & geocoding', 'Neighborhood investment score', 'Recent permit activity', 'Adjacent tract comparison'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-secondary">
                      <svg className="w-4 h-4 text-accent-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 text-accent-primary font-medium hover:gap-3 transition-all"
                >
                  Try Lookup Free
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Scout Mode */}
            <div className="group relative">
              <div className="absolute -inset-px bg-gradient-to-br from-warning/50 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-full bg-secondary border border-border/30 rounded-2xl p-8 hover:border-warning/30 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-primary">Scout Mode</h3>
                    <span className="text-xs font-mono text-warning uppercase tracking-wider">Pro</span>
                  </div>
                </div>
                
                <p className="text-secondary mb-6 leading-relaxed">
                  Don&apos;t know where to look? Let the data guide you. City-wide heatmaps and rankings surface hidden opportunities.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {['City-wide opportunity heatmap', 'Neighborhood rankings', 'Trend & momentum indicators', 'Smart gentrification filters'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-secondary">
                      <svg className="w-4 h-4 text-warning flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 text-warning font-medium hover:gap-3 transition-all"
                >
                  Unlock Scout Mode
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/80 border border-border/50 rounded-full mb-6">
              <span className="text-xs font-mono text-tertiary uppercase tracking-wider">Platform Capabilities</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Your Unfair Advantage
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                ),
                title: 'Interactive Heatmaps',
                description: 'See investment activity at a glance with real-time permit density visualization.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Permit Intelligence',
                description: 'DOB, DOT, alteration, demolition — all permit types in one unified view.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ),
                title: 'Proprietary Scoring',
                description: 'Algorithmic neighborhood scores combining permit velocity, business growth & more.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                title: 'Trend Detection',
                description: 'Rising, steady, or cooling — know a neighborhood\'s trajectory at a glance.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Time Filtering',
                description: 'Analyze 6-month, 1-year, or 3-year windows to match your investment horizon.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: 'Adjacent Analysis',
                description: 'Compare neighboring tracts to understand the broader investment landscape.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-secondary/50 border border-border/20 rounded-xl p-6 hover:border-accent-primary/30 hover:bg-secondary/80 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 text-primary">{feature.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-secondary/30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Research in Minutes, Not Days
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Enter Address',
                description: 'Type any NYC address or click anywhere on the map to start your analysis.',
              },
              {
                step: '02',
                title: 'Review Data',
                description: 'Instantly see neighborhood scores, permit history, and development trends.',
              },
              {
                step: '03',
                title: 'Decide',
                description: 'Make confident investment decisions backed by real-time intelligence.',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-border/50 to-transparent" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 mb-6">
                  <span className="font-mono text-xl font-bold text-accent-primary">{item.step}</span>
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Edge */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Why Permits Matter
              </h2>
              <p className="text-secondary text-lg mb-8 leading-relaxed">
                Construction permits are <span className="text-primary font-medium">leading indicators</span>. 
                They predict neighborhood appreciation 12-18 months before price changes appear in sales data.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    label: 'Permit filed',
                    description: 'Developer activity signal — you see it here first',
                    color: 'accent-primary',
                  },
                  {
                    label: 'Construction begins',
                    description: 'Physical transformation starts, still early',
                    color: 'success',
                  },
                  {
                    label: 'Price appreciation',
                    description: 'Market catches on — too late for first-mover advantage',
                    color: 'warning',
                  },
                ].map((item, index) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full bg-${item.color}`} style={{ backgroundColor: item.color === 'accent-primary' ? '#00d4ff' : item.color === 'success' ? '#00e676' : '#ffc400' }} />
                      {index < 2 && <div className="w-px h-full bg-border/50 mt-2" />}
                    </div>
                    <div className="pb-6">
                      <div className="font-medium text-primary">{item.label}</div>
                      <div className="text-sm text-secondary">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-transparent rounded-2xl" />
              <div className="relative bg-secondary/80 border border-border/30 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <div className="text-xs text-tertiary uppercase tracking-wider mb-2">Information Advantage</div>
                  <div className="font-mono text-6xl font-bold text-accent-primary">12-18</div>
                  <div className="text-secondary">months ahead</div>
                </div>
                
                <div className="h-32 flex items-end justify-center gap-3">
                  {[20, 35, 50, 65, 85, 95, 100].map((height, i) => (
                    <div
                      key={i}
                      className="w-8 rounded-t transition-all duration-500"
                      style={{
                        height: `${height}%`,
                        backgroundColor: i < 2 ? '#00d4ff' : i < 5 ? '#00e676' : '#ffc400',
                        opacity: 0.3 + (i * 0.1),
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-tertiary mt-4">
                  <span>Permit Filed</span>
                  <span>Price Peak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-primary/5 to-transparent" />
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 212, 255, 1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 212, 255, 1) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
          />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Start Finding Opportunities
          </h2>
          <p className="text-secondary text-lg mb-10 max-w-2xl mx-auto">
            Join investors who use data, not hunches. Lookup mode is free forever — 
            upgrade to Scout when you&apos;re ready to discover city-wide opportunities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app"
              className="group relative px-10 py-4 font-medium rounded-lg text-center overflow-hidden"
            >
              <span className="absolute inset-0 bg-accent-primary" />
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <span className="relative text-inverse font-semibold">Launch Free App</span>
            </Link>
            <Link
              href="/pricing"
              className="px-10 py-4 font-medium rounded-lg text-center border border-border/50 hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all duration-300 text-primary"
            >
              Compare Plans
            </Link>
          </div>
          
          <p className="text-xs text-tertiary mt-8">
            No credit card required • Instant access • NYC data updated daily
          </p>
        </div>
      </section>
    </div>
  );
}
