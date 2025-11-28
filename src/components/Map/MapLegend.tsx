'use client';

export function MapLegend() {
  return (
    <div className="glass rounded-lg px-4 py-2 border border-[var(--border-default)]">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium">
          Permit Activity
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[var(--text-tertiary)]">Low</span>
          <div 
            className="w-32 h-3 rounded-sm"
            style={{
              background: 'linear-gradient(to right, #4a1486, #6a51a3, #3182bd, #31a354, #addd8e, #f7f720, #fd8d3c, #e31a1c, #b10026)',
            }}
          />
          <span className="text-[10px] text-[var(--text-tertiary)]">High</span>
        </div>
      </div>
    </div>
  );
}

