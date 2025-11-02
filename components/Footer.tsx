import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Forest Queen Van</h3>
            <p className="text-gray-400 mb-4">
              A complete DIY Ford Transit conversion documenting the journey from empty cargo van to full-time home on wheels.
            </p>
            <p className="text-gray-500 text-sm">
              Built with passion in Washington State
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/journal" className="hover:text-white transition-colors">Build Journal</Link></li>
              <li><Link href="/systems" className="hover:text-white transition-colors">Systems</Link></li>
              <li><Link href="/costs" className="hover:text-white transition-colors">Cost Breakdown</Link></li>
              <li><Link href="/for-sale" className="hover:text-white transition-colors">For Sale</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Shaun</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li>
                <a
                  href="https://instagram.com/forestqueenvan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>© {currentYear} Forest Queen Van. All rights reserved.</p>
          <p className="mt-2">
            2019 Ford Transit 250 • $30,500 Build • 400 Hours of Work
          </p>
        </div>
      </div>
    </footer>
  );
}
