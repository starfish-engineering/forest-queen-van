'use client';

import { useAppStore } from '@/lib/store';
import { getScoreLabel, getScoreColor } from '@/lib/utils/scoring';

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function ScoreCard() {
  const { subjectTract, tractScores, timeHorizon } = useAppStore();

  if (!subjectTract) return null;

  // Get score for current time horizon
  const currentScores = tractScores?.[timeHorizon];
  const score = currentScores?.compositeScore ?? 0;
  const permitCount = currentScores?.permitCount ?? 0;
  const permitValue = currentScores?.permitValue ?? 0;
  const permitDensity = currentScores?.permitDensity ?? 0;

  const scoreLabel = getScoreLabel(score);
  const scoreColor = getScoreColor(score);

  return (
    <div className="w-64 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
        <h2 className="text-xs font-semibold text-[var(--text-tertiary)] tracking-wide uppercase">
          Neighborhood Score
        </h2>
        <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
          {subjectTract.name} • {timeHorizon}
        </p>
      </div>

      {/* Score Display */}
      <div className="p-6 text-center">
        {/* Large Score Number */}
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl border-2 mb-3"
          style={{ 
            borderColor: scoreColor,
            backgroundColor: `${scoreColor}15`,
          }}
        >
          <span 
            className="font-mono text-4xl font-bold"
            style={{ color: scoreColor }}
          >
            {score}
          </span>
        </div>

        {/* Score Label */}
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-4">
          {scoreLabel}
        </p>

        {/* Progress Bar */}
        <div className="relative h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden mb-2">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min(score, 100)}%`,
              backgroundColor: scoreColor,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
          <span>0</span>
          <span>{score}/100</span>
        </div>
      </div>

      {/* Score Breakdown - Real Data */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-tertiary)]">
            <path d="M3 3v18h18" />
            <path d="M18 17V9M13 17V5M8 17v-3" />
          </svg>
          <span className="text-xs font-medium text-[var(--text-tertiary)]">
            Activity Metrics
          </span>
        </div>
        <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
          <li className="flex items-center justify-between">
            <span>Permits in tract</span>
            <span className="font-medium text-[var(--text-primary)]">{permitCount}</span>
          </li>
          <li className="flex items-center justify-between">
            <span>Total permit value</span>
            <span className="font-medium text-[var(--text-primary)]">{formatCurrency(permitValue)}</span>
          </li>
          <li className="flex items-center justify-between">
            <span>Density (per km²)</span>
            <span className="font-medium text-[var(--text-primary)]">{permitDensity.toFixed(1)}</span>
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-tertiary)]">vs. NYC Average:</span>
          <span className="text-[var(--text-secondary)] font-medium">~50</span>
        </div>
      </div>
    </div>
  );
}

