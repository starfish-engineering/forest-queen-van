'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('submitting');

    // Simulate form submission
    setTimeout(() => {
      setFormState('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-teal-900 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-7xl mb-6 animate-bounce">💬</div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Let's Talk
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100 leading-relaxed">
            Questions about the build? Want to buy the van? Just want to say hi?
            <br />
            I'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 px-6 bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/for-sale"
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg hover:scale-105 transition-all text-center border-2 border-transparent hover:border-emerald-500"
            >
              <div className="text-4xl mb-3">🚐</div>
              <div className="font-bold text-gray-900 mb-2">Want to Buy?</div>
              <div className="text-sm text-gray-600">View the full listing details</div>
            </Link>

            <Link
              href="/journal"
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg hover:scale-105 transition-all text-center border-2 border-transparent hover:border-emerald-500"
            >
              <div className="text-4xl mb-3">🔧</div>
              <div className="font-bold text-gray-900 mb-2">Build Questions?</div>
              <div className="text-sm text-gray-600">Read the complete journal</div>
            </Link>

            <Link
              href="/systems"
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg hover:scale-105 transition-all text-center border-2 border-transparent hover:border-emerald-500"
            >
              <div className="text-4xl mb-3">⚡</div>
              <div className="font-bold text-gray-900 mb-2">Technical Specs?</div>
              <div className="text-sm text-gray-600">Explore all systems</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            Send a Message
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            I typically respond within 24-48 hours
          </p>

          {formState === 'success' ? (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-6">✅</div>
              <h3 className="text-3xl font-bold text-emerald-900 mb-4">Message Sent!</h3>
              <p className="text-lg text-emerald-700 mb-8">
                Thanks for reaching out. I'll get back to you soon.
              </p>
              <button
                onClick={() => setFormState('idle')}
                className="bg-emerald-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-800 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-gray-900"
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-gray-900"
                  placeholder="your@email.com"
                />
              </div>

              {/* Purpose */}
              <div>
                <label htmlFor="purpose" className="block text-sm font-semibold text-gray-700 mb-2">
                  What's this about? *
                </label>
                <select
                  id="purpose"
                  name="purpose"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-gray-900"
                >
                  <option value="">Select a topic...</option>
                  <option value="for-sale">Interested in buying the van</option>
                  <option value="build-question">Question about the build</option>
                  <option value="technical">Technical/system question</option>
                  <option value="collaboration">Partnership or collaboration</option>
                  <option value="general">General inquiry</option>
                  <option value="other">Something else</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-gray-900 resize-none"
                  placeholder="Tell me what's on your mind..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={formState === 'submitting'}
                className="w-full bg-emerald-900 text-white py-4 rounded-full text-lg font-semibold hover:bg-emerald-800 hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {formState === 'submitting' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Direct Contact Info */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Other Ways to Reach Me</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Email */}
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">Email</h3>
              <a
                href="mailto:shaun@shaunrob.com"
                className="text-emerald-700 hover:text-emerald-900 font-semibold transition-colors"
              >
                shaun@shaunrob.com
              </a>
            </div>

            {/* Instagram */}
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">Instagram</h3>
              <a
                href="https://instagram.com/forestqueenvan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-900 font-semibold transition-colors"
              >
                @forestqueenvan
              </a>
            </div>

            {/* Location */}
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">Location</h3>
              <p className="text-gray-600">Washington State, USA</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Callout */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white rounded-3xl p-12 text-center">
            <div className="text-5xl mb-6">💡</div>
            <h2 className="text-3xl font-bold mb-6">
              Common Questions
            </h2>
            <div className="text-left max-w-2xl mx-auto space-y-4 text-emerald-100">
              <div>
                <strong className="text-white">Is the van still for sale?</strong>
                <p>Check the <Link href="/for-sale" className="underline hover:text-white">for-sale page</Link> for current status and details.</p>
              </div>
              <div>
                <strong className="text-white">Can I use your build as a guide?</strong>
                <p>Absolutely! That's why I documented everything. Browse the <Link href="/journal" className="underline hover:text-white">build journal</Link> and <Link href="/systems" className="underline hover:text-white">systems</Link> pages.</p>
              </div>
              <div>
                <strong className="text-white">Do you offer consulting for van builds?</strong>
                <p>I'm happy to answer questions via email, but I don't offer formal consulting services.</p>
              </div>
              <div>
                <strong className="text-white">Where did you buy your parts?</strong>
                <p>Most vendors are listed in the <Link href="/systems" className="underline hover:text-white">systems</Link> breakdown. Common sources: Amazon, Battle Born, Victron, 80/20 Inc.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
