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
      <nav className="border-b border-border/30 bg-primary/80 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-display text-xl font-bold tracking-tight">
              <span className="text-accent-primary">CapEx</span>
              <span className="text-primary"> Scout</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/app"
                className="text-secondary hover:text-primary transition-colors"
              >
                Lookup Mode
              </Link>
              <Link
                href="/pricing"
                className="text-secondary hover:text-primary transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/app"
                className="px-4 py-2 bg-accent-primary text-primary font-medium rounded hover:bg-accent-primary/90 transition-colors"
              >
                Launch App
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link
                href="/app"
                className="px-4 py-2 bg-accent-primary text-primary text-sm font-medium rounded"
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
      <footer className="border-t border-border/30 bg-secondary mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="font-display text-xl font-bold tracking-tight mb-4">
                <span className="text-accent-primary">CapEx</span>
                <span className="text-primary"> Scout</span>
              </div>
              <p className="text-secondary text-sm max-w-md">
                NYC investment intelligence powered by real-time permit data,
                business activity, and construction trends.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-primary mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-secondary">
                <li>
                  <Link href="/app" className="hover:text-primary transition-colors">
                    Lookup Mode
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-primary transition-colors">
                    Scout Mode
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-primary mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-secondary">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/30">
            <p className="text-sm text-secondary text-center">
              &copy; 2025 CapEx Scout. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
