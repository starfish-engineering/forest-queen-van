'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getCostsData, getCategorySummary, getAllCostItems } from '@/lib/costs';

export default function CostsPage() {
  const costsData = getCostsData();
  const categorySummary = getCategorySummary();
  const allItems = getAllCostItems();

  const [sortBy, setSortBy] = useState<'cost' | 'category' | 'name'>('cost');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Sort items
  const sortedItems = [...allItems].sort((a, b) => {
    if (sortBy === 'cost') return b.cost - a.cost;
    if (sortBy === 'category') return a.category.localeCompare(b.category);
    return a.item.localeCompare(b.item);
  });

  // Filter items
  const filteredItems = filterCategory === 'all'
    ? sortedItems
    : sortedItems.filter(item => item.category === filterCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-green-900 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
            💰 Complete Transparency
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            The Real Cost
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto mb-12">
            Every dollar, every bolt, every decision. No hidden costs, no "forgot to mention" moments.
          </p>

          {/* Big Total */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 inline-block">
            <div className="text-sm text-emerald-200 mb-2">Total Build Cost</div>
            <div className="text-7xl font-bold mb-4">${costsData.total.toLocaleString()}</div>
            <div className="text-emerald-200">
              {allItems.length} line items • 4 years of purchases
            </div>
          </div>
        </div>

        {/* Floating Money Emoji */}
        <div className="absolute top-20 left-20 text-6xl opacity-20 animate-bounce">💵</div>
        <div className="absolute bottom-20 right-20 text-6xl opacity-20 animate-pulse">💸</div>
      </section>

      {/* Comparison Bar */}
      <section className="py-12 px-6 bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-3xl mb-2">🛠️</div>
              <div className="text-2xl font-bold text-emerald-700">${costsData.total.toLocaleString()}</div>
              <div className="text-sm text-gray-600">DIY Build Cost</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-3xl mb-2">🏭</div>
              <div className="text-2xl font-bold text-gray-900">$60k - $120k</div>
              <div className="text-sm text-gray-600">Professional Conversion</div>
            </div>
            <div className="bg-emerald-50 p-6 rounded-2xl shadow-sm border-2 border-emerald-500">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-emerald-900">
                ${((60000 - costsData.total) / 1000).toFixed(0)}k+ Saved
              </div>
              <div className="text-sm text-emerald-700 font-semibold">By building yourself</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Breakdown */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Category Breakdown</h2>
          <p className="text-xl text-gray-600 mb-12">Where the money went</p>

          <div className="space-y-4">
            {categorySummary.map((category) => (
              <div
                key={category.name}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:scale-102 border-2 border-gray-200 hover:border-emerald-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {category.name}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {category.percentage.toFixed(1)}% of total build
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-emerald-700">
                    ${category.total.toLocaleString()}
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="relative bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                    style={{
                      width: `${category.percentage}%`,
                      backgroundColor: category.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Items List */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Every Line Item</h2>
              <p className="text-xl text-gray-600">All {filteredItems.length} purchases</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-medium focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="cost">Sort by Cost</option>
                <option value="category">Sort by Category</option>
                <option value="name">Sort by Name</option>
              </select>

              {/* Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-medium focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="all">All Categories</option>
                {categorySummary.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Grid */}
          <div className="space-y-3">
            {filteredItems.map((item, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:scale-102 border-l-4"
                style={{ borderLeftColor: categorySummary.find(c => c.name === item.category)?.color || '#gray' }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.item}
                    </h3>
                    <p className="text-sm text-gray-600 italic">
                      {item.notes}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-700 whitespace-nowrap">
                      ${item.cost.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {((item.cost / costsData.total) * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Spending Timeline</h2>
          <p className="text-xl text-gray-600 mb-12">When the money was spent</p>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-emerald-200"></div>

            {/* Timeline Items */}
            <div className="space-y-8">
              {costsData.timeline.map((entry, index) => (
                <div key={index} className="relative pl-16">
                  {/* Dot */}
                  <div className="absolute left-4 top-2 w-5 h-5 bg-emerald-600 rounded-full ring-4 ring-white"></div>

                  {/* Card */}
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-200">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="text-sm font-semibold text-emerald-700 mb-1">
                          {new Date(entry.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className="text-gray-700">
                          {entry.items.join(', ')}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 whitespace-nowrap">
                        ${entry.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lessons Learned */}
      <section className="py-20 px-6 bg-gradient-to-br from-emerald-900 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">💡</div>
            <h2 className="text-4xl font-bold mb-6">Money Lessons</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Would Spend More */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <div className="text-2xl mb-4">📈 Would Spend More</div>
              <ul className="space-y-3 text-emerald-100">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Better floor insulation (spray foam upgrade)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Professional electrical inspection for peace of mind</span>
                </li>
              </ul>
            </div>

            {/* Would Spend Less */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <div className="text-2xl mb-4">📉 Would Spend Less</div>
              <ul className="space-y-3 text-emerald-100">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Bought too much 80/20 aluminum (overestimated needs)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Ordered excess poplar for slats (204 sq ft, needed ~100 sq ft)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your Build?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Use this breakdown to plan your own van conversion budget
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/systems"
              className="bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 hover:scale-105 transition-all"
            >
              Explore Systems
            </Link>
            <Link
              href="/journal"
              className="bg-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-500 hover:scale-105 transition-all"
            >
              Read Build Journal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
