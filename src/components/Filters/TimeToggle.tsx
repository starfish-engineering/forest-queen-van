'use client';

import { useAppStore } from '@/lib/store';
import type { TimeHorizon } from '@/types';

const TIME_OPTIONS: { value: TimeHorizon; label: string }[] = [
  { value: '6mo', label: '6mo' },
  { value: '1yr', label: '1yr' },
  { value: '3yr', label: '3yr' },
];

export function TimeToggle() {
  const { timeHorizon, setTimeHorizon } = useAppStore();

  return (
    <div className="glass border border-[var(--border-default)] rounded-lg p-1 shadow-xl">
      <div className="flex items-center gap-1">
        {TIME_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setTimeHorizon(option.value)}
            className={`relative px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              timeHorizon === option.value
                ? 'bg-[var(--accent-primary)] text-[var(--text-inverse)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            {option.label}
            {timeHorizon === option.value && (
              <span className="absolute inset-0 rounded-md bg-[var(--accent-primary)] animate-pulse opacity-20" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

