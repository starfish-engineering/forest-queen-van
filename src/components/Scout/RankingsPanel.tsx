'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import type { RankedTract } from '@/app/api/rankings/route';

const BOROUGHS = [
  { id: 'all', label: 'All NYC' },
  { id: 'manhattan', label: 'Manhattan' },
  { id: 'brooklyn', label: 'Brooklyn' },
  { id: 'queens', label: 'Queens' },
  { id: 'bronx', label: 'Bronx' },
  { id: 'staten-island', label: 'Staten Island' },
];

function getTrendIcon(trend: 'rising' | 'steady' | 'cooling') {
  switch (trend) {
    case 'rising':
      return <span className="text-emerald-400">📈</span>;
    case 'cooling':
      return <span className="text-red-400">📉</span>;
    default:
      return <span className="text-[var(--text-tertiary)]">➡️</span>;
  }
}

function formatValue(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function RankingsPanel() {
  const { timeHorizon, drillIntoTract, setSelectedScoutTract, selectedScoutTract } = useAppStore();
  const [selectedBorough, setSelectedBorough] = useState('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['rankings', timeHorizon, selectedBorough],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeHorizon,
        limit: '30',
      });
      if (selectedBorough !== 'all') {
        params.set('borough', selectedBorough);
      }
      const res = await fetch(`/api/rankings?${params}`);
      if (!res.ok) throw new Error('Failed to fetch rankings');
      return res.json() as Promise<{ tracts: RankedTract[]; count: number }>;
    },
    staleTime: 60 * 1000,
  });

  const handleTractClick = (tract: RankedTract) => {
    // Highlight on map first
    setSelectedScoutTract(tract.geoid);
  };

  const handleDrillIn = (tract: RankedTract) => {
    drillIntoTract(tract.geoid, tract.name, tract.lat, tract.lng);
  };

  return (
    <div className="w-80 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden shadow-xl flex flex-col max-h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            🎯 Top Neighborhoods
          </h2>
          <span className="text-xs text-[var(--text-tertiary)]">
            {timeHorizon}
          </span>
        </div>
        
        {/* Borough Filter */}
        <select
          value={selectedBorough}
          onChange={(e) => setSelectedBorough(e.target.value)}
          className="w-full px-3 py-1.5 text-xs bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)]"
        >
          {BOROUGHS.map((b) => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select>
      </div>

      {/* Column Headers */}
      <div className="px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
        <div className="flex items-center text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
          <span className="w-8">#</span>
          <span className="flex-1">Tract</span>
          <span className="w-12 text-right">Score</span>
          <span className="w-16 text-right">Permits</span>
          <span className="w-8 text-center">Δ</span>
        </div>
      </div>

      {/* Rankings List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-[var(--bg-tertiary)] rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-400">
            Failed to load rankings
          </div>
        ) : data?.tracts.length === 0 ? (
          <div className="p-4 text-sm text-[var(--text-tertiary)]">
            No tracts with activity found
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {data?.tracts.map((tract) => (
              <div
                key={tract.geoid}
                onClick={() => handleTractClick(tract)}
                onDoubleClick={() => handleDrillIn(tract)}
                className={`
                  w-full px-4 py-3 text-left transition-colors cursor-pointer
                  hover:bg-[var(--bg-hover)]
                  ${selectedScoutTract === tract.geoid ? 'bg-[var(--accent-primary-dim)]' : ''}
                `}
              >
                <div className="flex items-center">
                  <span className={`
                    w-8 text-xs font-mono
                    ${tract.rank <= 3 ? 'text-amber-400 font-bold' : 'text-[var(--text-tertiary)]'}
                  `}>
                    {tract.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] truncate">
                      {tract.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      {tract.borough}
                    </p>
                  </div>
                  <span className={`
                    w-12 text-right text-sm font-mono font-semibold
                    ${tract.score >= 70 ? 'text-emerald-400' : 
                      tract.score >= 40 ? 'text-amber-400' : 
                      'text-[var(--text-secondary)]'}
                  `}>
                    {tract.score}
                  </span>
                  <span className="w-16 text-right text-xs text-[var(--text-secondary)]">
                    {tract.permitCount}
                  </span>
                  <span className="w-8 text-center text-sm">
                    {getTrendIcon(tract.trend)}
                  </span>
                </div>
                {selectedScoutTract === tract.geoid && (
                  <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                      <span>Total permit value</span>
                      <span className="text-[var(--text-secondary)]">
                        {formatValue(tract.permitValue)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDrillIn(tract);
                      }}
                      className="mt-2 w-full py-1.5 text-xs font-medium bg-[var(--accent-primary)] text-[var(--text-inverse)] rounded-lg hover:opacity-90 transition-opacity"
                    >
                      View Details →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
        <p className="text-[10px] text-[var(--text-tertiary)]">
          {data?.count || 0} tracts • Click to preview, double-click for details
        </p>
      </div>
    </div>
  );
}

