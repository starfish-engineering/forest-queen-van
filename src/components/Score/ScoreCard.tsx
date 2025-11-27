'use client';

import { useAppStore } from '@/lib/store';
import { getScoreLabel, getScoreColor } from '@/lib/utils/scoring';

export function ScoreCard() {
  const { subjectTract, timeHorizon } = useAppStore();

  // Mock score for now - will be fetched from API
  const score = 72;
  const scoreLabel = getScoreLabel(score);
  const scoreColor = getScoreColor(score);

  if (!subjectTract) return null;

  return (
    <div className="w-64 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
        <h2 className="text-xs font-semibold text-[var(--text-tertiary)] tracking-wide uppercase">
          Neighborhood Score
        </h2>
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
              width: `${score}%`,
              backgroundColor: scoreColor,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
          <span>0</span>
          <span>{score}/100</span>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-tertiary)]">
            <path d="M3 3v18h18" />
            <path d="M18 17V9M13 17V5M8 17v-3" />
          </svg>
          <span className="text-xs font-medium text-[var(--text-tertiary)]">
            Score Drivers
          </span>
        </div>
        <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
          <li className="flex items-center gap-2">
            <span className="text-[var(--color-success)]">+</span>
            High permit density
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[var(--color-success)]">+</span>
            3 new coffee shops
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[var(--color-success)]">+</span>
            $2.1M in renovations
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-tertiary)]">vs. NYC Average:</span>
          <span className="text-[var(--text-secondary)] font-medium">50</span>
        </div>
      </div>
    </div>
  );
}

