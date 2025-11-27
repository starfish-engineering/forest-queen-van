'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';

export function AdjacentTractsPanel() {
  const { 
    subjectTract, 
    adjacentTracts, 
    includeAdjacentTracts,
    toggleIncludeAdjacentTracts,
    setAdjacentTracts,
  } = useAppStore();
  
  const [loading, setLoading] = useState(false);

  // Fetch adjacent tract geometries when toggle is enabled
  useEffect(() => {
    if (!includeAdjacentTracts || !subjectTract || adjacentTracts.length === 0) return;
    
    // Check if we already have geometries
    if (adjacentTracts.some(t => t.geometry)) return;
    
    const fetchAdjacentGeometries = async () => {
      setLoading(true);
      try {
        const tractsWithGeometry = await Promise.all(
          adjacentTracts.map(async (tract) => {
            try {
              const res = await fetch(`/api/census/${tract.geoid}`);
              if (res.ok) {
                const data = await res.json();
                return {
                  ...tract,
                  geometry: data.tract?.geometry || null,
                };
              }
            } catch (e) {
              console.error(`Failed to fetch tract ${tract.geoid}:`, e);
            }
            return tract;
          })
        );
        setAdjacentTracts(tractsWithGeometry);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdjacentGeometries();
  }, [includeAdjacentTracts, subjectTract, adjacentTracts, setAdjacentTracts]);

  if (!subjectTract || adjacentTracts.length === 0) return null;

  return (
    <div className="w-64 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden shadow-xl">
      {/* Header with toggle */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <h2 className="text-xs font-semibold text-[var(--text-tertiary)] tracking-wide uppercase">
              Adjacent Tracts
            </h2>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
              {adjacentTracts.length} neighboring areas
            </p>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={includeAdjacentTracts}
              onChange={toggleIncludeAdjacentTracts}
              className="sr-only"
            />
            <div className={`w-10 h-5 rounded-full transition-colors ${
              includeAdjacentTracts ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-tertiary)]'
            }`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                includeAdjacentTracts ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </div>
          </div>
        </label>
      </div>

      {/* Adjacent tracts list */}
      {includeAdjacentTracts && (
        <div className="px-4 py-3">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
              <div className="w-3 h-3 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
              Loading tracts...
            </div>
          ) : (
            <ul className="space-y-2 max-h-32 overflow-y-auto">
              {adjacentTracts.map((tract) => (
                <li 
                  key={tract.geoid}
                  className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"
                >
                  <span 
                    className="w-2 h-2 rounded-full border border-white/50"
                    style={{ backgroundColor: 'transparent', borderStyle: 'dashed' }}
                  />
                  <span className="truncate">{tract.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

