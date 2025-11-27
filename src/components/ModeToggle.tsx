'use client';

import { useAppStore, type AppMode } from '@/lib/store';

export function ModeToggle() {
  const { mode, setMode } = useAppStore();

  return (
    <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl shadow-lg">
      <ModeButton
        mode="lookup"
        label="Lookup"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        }
        active={mode === 'lookup'}
        onClick={() => setMode('lookup')}
      />
      <ModeButton
        mode="scout"
        label="Scout"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        }
        active={mode === 'scout'}
        onClick={() => setMode('scout')}
        badge="PRO"
      />
    </div>
  );
}

interface ModeButtonProps {
  mode: AppMode;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  badge?: string;
}

function ModeButton({ label, icon, active, onClick, badge }: ModeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        transition-all duration-200
        ${active 
          ? 'bg-[var(--accent-primary)] text-[var(--text-inverse)] shadow-md' 
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
        }
      `}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className={`
          text-[10px] font-bold px-1.5 py-0.5 rounded
          ${active 
            ? 'bg-white/20 text-white' 
            : 'bg-amber-500/20 text-amber-400'
          }
        `}>
          {badge}
        </span>
      )}
    </button>
  );
}

