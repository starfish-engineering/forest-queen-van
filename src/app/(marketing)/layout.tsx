import Link from 'next/link';
import '../globals.css';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-primary text-primary">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50">
        <div className="absolute inset-0 bg-primary/80 backdrop-blur-xl border-b border-border/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-accent-primary" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight">
                <span className="text-accent-primary">CapEx</span>
                <span className="text-primary"> Scout</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/app"
                className="px-4 py-2 text-sm text-secondary hover:text-primary rounded-lg hover:bg-secondary/50 transition-colors"
              >
                Lookup
              </Link>
              <Link
                href="/pricing"
                className="px-4 py-2 text-sm text-secondary hover:text-primary rounded-lg hover:bg-secondary/50 transition-colors"
              >
                Pricing
              </Link>
              <div className="w-px h-4 bg-border/50 mx-2" />
              <Link
                href="/app"
                className="group px-4 py-2 text-sm font-medium text-inverse bg-accent-primary rounded-lg hover:bg-accent-primary/90 transition-colors flex items-center gap-2"
              >
                Launch App
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link
                href="/app"
                className="px-4 py-2 text-sm font-medium text-inverse bg-accent-primary rounded-lg"
              >
                Launch
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/20">
        <div className="absolute inset-0 bg-secondary/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Brand column */}
            <div className="md:col-span-5">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-sm bg-accent-primary" />
                </div>
                <span className="font-display text-lg font-bold tracking-tight">
                  <span className="text-accent-primary">CapEx</span>
                  <span className="text-primary"> Scout</span>
                </span>
              </Link>
              <p className="text-secondary text-sm max-w-sm leading-relaxed mb-6">
                NYC investment intelligence powered by real-time permit data, 
                business activity, and construction trends. Find opportunities before the market.
              </p>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-mono text-tertiary">Data synced daily from NYC Open Data</span>
              </div>
            </div>

            {/* Links columns */}
            <div className="md:col-span-2">
              <h3 className="font-medium text-primary text-sm mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-secondary">
                <li>
                  <Link href="/app" className="hover:text-accent-primary transition-colors">
                    Lookup Mode
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-accent-primary transition-colors inline-flex items-center gap-1.5">
                    Scout Mode
                    <span className="text-[10px] font-mono text-warning bg-warning/10 px-1.5 py-0.5 rounded">PRO</span>
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-accent-primary transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-medium text-primary text-sm mb-4">Data</h3>
              <ul className="space-y-3 text-sm text-secondary">
                <li className="text-tertiary">NYC DOB Permits</li>
                <li className="text-tertiary">DCA Businesses</li>
                <li className="text-tertiary">SLA Liquor Licenses</li>
                <li className="text-tertiary">Census Tracts</li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h3 className="font-medium text-primary text-sm mb-4">Get Started</h3>
              <div className="space-y-3">
                <Link
                  href="/app"
                  className="flex items-center gap-2 px-4 py-2.5 bg-accent-primary/10 border border-accent-primary/30 rounded-lg text-sm font-medium text-accent-primary hover:bg-accent-primary/20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Try Free Lookup
                </Link>
                <p className="text-xs text-tertiary">
                  No signup required. Enter any NYC address.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/20 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-tertiary">
              © {new Date().getFullYear()} CapEx Scout. Built for NYC investors.
            </p>
            <div className="flex items-center gap-6 text-xs text-tertiary">
              <Link href="/privacy" className="hover:text-secondary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-secondary transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
