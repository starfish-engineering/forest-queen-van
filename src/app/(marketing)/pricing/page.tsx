'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const prices = {
    pro: {
      monthly: 49,
      annual: 490,
    },
  };

  const tiers = [
    {
      name: 'Free',
      description: 'Perfect for casual investors exploring neighborhoods',
      price: 0,
      billingLabel: 'Forever free',
      cta: 'Get Started',
      ctaLink: '/lookup',
      popular: false,
      features: [
        'Address search & geocoding',
        'Census tract identification',
        'Basic neighborhood score',
        'Permit history view',
        'Adjacent tracts toggle',
        'Time horizon filtering',
      ],
    },
    {
      name: 'Pro',
      description: 'For serious investors seeking data-driven insights',
      price: billingCycle === 'monthly' ? prices.pro.monthly : prices.pro.annual,
      billingLabel: billingCycle === 'monthly' ? 'per month' : 'per year',
      cta: 'Start Free Trial',
      ctaLink: '/signup?plan=pro',
      popular: true,
      features: [
        'Everything in Free',
        'City-wide opportunity heatmap',
        'Full neighborhood rankings',
        'Sortable data tables',
        'Trend indicators (rising/steady/cooling)',
        'Smart filters (gentrification signals)',
        'High-value permit filters',
        'Export to CSV',
        'Priority email support',
      ],
    },
    {
      name: 'Enterprise',
      description: 'For teams and organizations with custom needs',
      price: null,
      billingLabel: 'Custom pricing',
      cta: 'Contact Sales',
      ctaLink: '/contact?plan=enterprise',
      popular: false,
      features: [
        'Everything in Pro',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Priority support (24/7)',
        'Team accounts & permissions',
        'Custom data exports',
        'SLA guarantee',
      ],
    },
  ];

  const comparisonFeatures = [
    {
      category: 'Core Features',
      features: [
        { name: 'Address search & geocoding', free: true, pro: true, enterprise: true },
        { name: 'Census tract identification', free: true, pro: true, enterprise: true },
        { name: 'Basic neighborhood score', free: true, pro: true, enterprise: true },
        { name: 'Permit history view', free: true, pro: true, enterprise: true },
        { name: 'Adjacent tracts toggle', free: true, pro: true, enterprise: true },
        { name: 'Time horizon filtering', free: true, pro: true, enterprise: true },
      ],
    },
    {
      category: 'Advanced Analytics',
      features: [
        { name: 'City-wide opportunity heatmap', free: false, pro: true, enterprise: true },
        { name: 'Full neighborhood rankings', free: false, pro: true, enterprise: true },
        { name: 'Trend indicators', free: false, pro: true, enterprise: true },
        { name: 'Smart filters', free: false, pro: true, enterprise: true },
        { name: 'High-value permit filters', free: false, pro: true, enterprise: true },
      ],
    },
    {
      category: 'Data Export',
      features: [
        { name: 'Export to CSV', free: false, pro: true, enterprise: true },
        { name: 'Custom data exports', free: false, pro: false, enterprise: true },
        { name: 'API access', free: false, pro: false, enterprise: true },
      ],
    },
    {
      category: 'Support & Integration',
      features: [
        { name: 'Email support', free: false, pro: true, enterprise: true },
        { name: '24/7 priority support', free: false, pro: false, enterprise: true },
        { name: 'Custom integrations', free: false, pro: false, enterprise: true },
        { name: 'Team accounts', free: false, pro: false, enterprise: true },
        { name: 'SLA guarantee', free: false, pro: false, enterprise: true },
      ],
    },
  ];

  const faqs = [
    {
      question: 'What does the free trial include?',
      answer: 'The Pro free trial gives you full access to all Pro features for 14 days. No credit card required. After the trial, you can choose to subscribe or continue using the Free tier.',
    },
    {
      question: 'Can I change plans later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. When upgrading, you\'ll get immediate access to new features. When downgrading, changes take effect at the end of your current billing period.',
    },
    {
      question: 'How does annual billing work?',
      answer: 'Annual billing gives you 2 months free (12 months for the price of 10). You pay $490 upfront for the year instead of $588 ($49 × 12 months). You can switch to annual billing at any time.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) and ACH transfers for annual plans. Enterprise customers can also pay via invoice.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes. We use industry-standard encryption for all data transmission and storage. We never share your search history or analysis data with third parties. See our Privacy Policy for details.',
    },
    {
      question: 'Can I get a refund?',
      answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied for any reason, contact us within 30 days of your purchase for a full refund.',
    },
  ];

  return (
    <div className="min-h-screen bg-primary text-primary">
      {/* Header */}
      <div className="border-b border-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="font-['Space_Mono'] text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-lg sm:text-xl text-secondary max-w-2xl mx-auto">
              Choose the plan that fits your investment strategy. Start free, upgrade when you need more power.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="mt-12 flex items-center justify-center gap-4">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-primary' : 'text-secondary'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-14 h-7 bg-tertiary rounded-full transition-colors hover:bg-opacity-80"
              aria-label="Toggle billing cycle"
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-accent-primary rounded-full transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-7' : ''
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'annual' ? 'text-primary' : 'text-secondary'}`}>
              Annual
            </span>
            <span className="text-xs text-accent-primary font-medium bg-accent-primary/10 px-2 py-1 rounded">
              Save 17%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-secondary border rounded-lg p-8 flex flex-col ${
                tier.popular
                  ? 'border-accent-primary shadow-lg shadow-accent-primary/20 scale-105'
                  : 'border-tertiary'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-accent-primary text-primary text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="font-['Space_Mono'] text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-sm text-secondary mb-6">{tier.description}</p>

                <div className="flex items-baseline gap-2">
                  {tier.price !== null ? (
                    <>
                      <span className="text-4xl font-bold">${tier.price}</span>
                      <span className="text-secondary text-sm">/ {tier.billingLabel}</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold">{tier.billingLabel}</span>
                  )}
                </div>

                {billingCycle === 'annual' && tier.price !== null && tier.price > 0 && (
                  <p className="text-xs text-secondary mt-2">
                    Billed annually (${tier.price} / year)
                  </p>
                )}
              </div>

              <Link
                href={tier.ctaLink}
                className={`block text-center py-3 px-6 rounded font-medium transition-all mb-8 ${
                  tier.popular
                    ? 'bg-accent-primary text-primary hover:bg-accent-primary/90'
                    : 'bg-tertiary text-primary hover:bg-opacity-80'
                }`}
              >
                {tier.cta}
              </Link>

              <ul className="space-y-3 flex-1">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <svg
                      className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="border-t border-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <h2 className="font-['Space_Mono'] text-3xl font-bold text-center mb-12">
            Compare all features
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-tertiary">
                  <th className="text-left py-4 px-4 text-sm font-medium text-secondary">Feature</th>
                  <th className="text-center py-4 px-4 text-sm font-medium">Free</th>
                  <th className="text-center py-4 px-4 text-sm font-medium">Pro</th>
                  <th className="text-center py-4 px-4 text-sm font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((category) => (
                  <>
                    <tr key={category.category} className="border-t border-tertiary">
                      <td colSpan={4} className="py-4 px-4">
                        <span className="font-['Space_Mono'] text-sm font-bold text-accent-primary">
                          {category.category}
                        </span>
                      </td>
                    </tr>
                    {category.features.map((feature) => (
                      <tr key={feature.name} className="border-t border-tertiary/50">
                        <td className="py-3 px-4 text-sm text-secondary">{feature.name}</td>
                        <td className="py-3 px-4 text-center">
                          {feature.free ? (
                            <svg className="w-5 h-5 text-accent-primary inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-tertiary">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {feature.pro ? (
                            <svg className="w-5 h-5 text-accent-primary inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-tertiary">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {feature.enterprise ? (
                            <svg className="w-5 h-5 text-accent-primary inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-tertiary">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="border-t border-tertiary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <h2 className="font-['Space_Mono'] text-3xl font-bold text-center mb-12">
            Frequently asked questions
          </h2>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-tertiary pb-8 last:border-0">
                <h3 className="font-['Space_Mono'] text-lg font-bold mb-3">{faq.question}</h3>
                <p className="text-secondary leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="border-t border-tertiary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h2 className="font-['Space_Mono'] text-3xl sm:text-4xl font-bold mb-4">
            Ready to find your next investment opportunity?
          </h2>
          <p className="text-lg text-secondary mb-8">
            Start exploring NYC neighborhoods today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/lookup"
              className="bg-accent-primary text-primary py-3 px-8 rounded font-medium hover:bg-accent-primary/90 transition-all"
            >
              Start for Free
            </Link>
            <Link
              href="/signup?plan=pro"
              className="bg-tertiary text-primary py-3 px-8 rounded font-medium hover:bg-opacity-80 transition-all"
            >
              Try Pro Free for 14 Days
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
