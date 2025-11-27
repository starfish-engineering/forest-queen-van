'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { FilterState } from '@/types';

const FILTER_CATEGORIES = {
  building: {
    label: 'Building Permits',
    icon: '🏗️',
    subfilters: [
      { id: 'multifamily', label: 'Multifamily Housing' },
      { id: 'majorRenovation', label: 'Major Renovations' },
      { id: 'commercialTi', label: 'Commercial TI' },
      { id: 'newConstruction', label: 'New Construction' },
    ],
  },
  business: {
    label: 'Business Licenses',
    icon: '🏪',
    subfilters: [
      { id: 'restaurant', label: 'Restaurants' },
      { id: 'coffee', label: 'Coffee Shops' },
      { id: 'retail', label: 'High-End Retail' },
      { id: 'fitness', label: 'Fitness / Wellness' },
      { id: 'coworking', label: 'Co-Working Spaces' },
      { id: 'grocery', label: 'Grocery Stores' },
    ],
  },
  liquor: {
    label: 'Liquor Licenses',
    icon: '🍷',
    subfilters: [
      { id: 'bar', label: 'Bars' },
      { id: 'wineBar', label: 'Wine Bars' },
      { id: 'restaurantLiquor', label: 'Restaurant (w/ liquor)' },
    ],
  },
} as const;

export function FilterPanel() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['building'])
  );
  
  const { activeFilters, toggleFilter, resetFilters, toggleFilterPanel } = useAppStore();

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const countActiveFilters = (category: keyof FilterState): number => {
    const filters = activeFilters[category];
    return Object.values(filters).filter(Boolean).length;
  };

  const selectAll = () => {
    // Enable all filters
    Object.keys(FILTER_CATEGORIES).forEach((category) => {
      const cat = category as keyof FilterState;
      Object.keys(activeFilters[cat]).forEach((subcat) => {
        if (!activeFilters[cat][subcat as keyof typeof activeFilters[typeof cat]]) {
          toggleFilter(cat, subcat);
        }
      });
    });
  };

  const clearAllFilters = () => {
    // Disable all filters
    Object.keys(FILTER_CATEGORIES).forEach((category) => {
      const cat = category as keyof FilterState;
      Object.keys(activeFilters[cat]).forEach((subcat) => {
        if (activeFilters[cat][subcat as keyof typeof activeFilters[typeof cat]]) {
          toggleFilter(cat, subcat);
        }
      });
    });
  };

  return (
    <div className="w-72 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-wide uppercase">
          Filters
        </h2>
        <button
          onClick={toggleFilterPanel}
          className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Filter Categories */}
      <div className="max-h-[60vh] overflow-y-auto">
        {Object.entries(FILTER_CATEGORIES).map(([categoryKey, category]) => {
          const key = categoryKey as keyof FilterState;
          const isExpanded = expandedCategories.has(categoryKey);
          const activeCount = countActiveFilters(key);
          const totalCount = category.subfilters.length;

          return (
            <div key={categoryKey} className="border-b border-[var(--border-subtle)] last:border-0">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {category.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    ({activeCount}/{totalCount})
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`text-[var(--text-tertiary)] transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </button>

              {/* Subfilters */}
              {isExpanded && (
                <div className="pb-2 animate-slide-in-up">
                  {category.subfilters.map((subfilter) => {
                    const isChecked = activeFilters[key][subfilter.id as keyof typeof activeFilters[typeof key]];
                    
                    return (
                      <label
                        key={subfilter.id}
                        className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFilter(key, subfilter.id)}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                              isChecked
                                ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
                                : 'border-[var(--border-strong)] bg-transparent'
                            }`}
                          >
                            {isChecked && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-inverse)" strokeWidth="3">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className={`text-sm ${isChecked ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                          {subfilter.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
        <button
          onClick={selectAll}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
        >
          Select All
        </button>
        <button
          onClick={clearAllFilters}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--color-danger)] transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}

