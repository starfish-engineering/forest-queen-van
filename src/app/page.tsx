'use client';

import { Map } from '@/components/Map/Map';
import { SearchBar } from '@/components/Search/SearchBar';
import { FilterPanel } from '@/components/Filters/FilterPanel';
import { TimeToggle } from '@/components/Filters/TimeToggle';
import { DetailDrawer } from '@/components/Drawer/DetailDrawer';
import { ScoreCard } from '@/components/Score/ScoreCard';
import { AdjacentTractsPanel } from '@/components/Score/AdjacentTractsPanel';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const { subjectTract, drawerOpen, filterPanelOpen } = useAppStore();

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* Map Layer */}
      <Map />
      
      {/* Search Bar - Top Center */}
      <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-3 sm:px-4">
        <SearchBar />
      </div>
      
      {/* Left Panel - Filters (desktop only, always visible) */}
      <div className="hidden sm:block absolute top-24 left-4 lg:left-6 z-10 animate-slide-in-up">
        <FilterPanel />
      </div>
      
      {/* Mobile Filter Button */}
      <button 
        className="sm:hidden absolute top-20 left-3 z-10 p-3 glass rounded-xl border border-[var(--border-default)]"
        onClick={() => useAppStore.getState().toggleFilterPanel()}
        aria-label="Toggle filters"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-secondary)]">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
        </svg>
      </button>
      
      {/* Mobile Filter Panel Overlay */}
      {filterPanelOpen && (
        <div className="sm:hidden fixed inset-0 z-30 bg-black/50" onClick={() => useAppStore.getState().toggleFilterPanel()}>
          <div 
            className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <FilterPanel />
          </div>
        </div>
      )}
      
      {/* Time Toggle - Bottom Center */}
      <div className="absolute bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-10">
        <TimeToggle />
      </div>
      
      {/* Score Card - Shows when tract is selected */}
      {subjectTract && (
        <div className="absolute top-20 sm:top-24 right-3 sm:right-4 lg:right-6 z-10 animate-slide-in-up space-y-2 sm:space-y-3 max-w-[calc(100vw-24px)] sm:max-w-none">
          <ScoreCard />
          <div className="hidden sm:block">
            <AdjacentTractsPanel />
          </div>
        </div>
      )}
      
      {/* Detail Drawer */}
      {drawerOpen && <DetailDrawer />}
      
      {/* Attribution */}
      <div className="absolute bottom-2 sm:bottom-6 right-3 sm:right-6 z-10">
        <span className="text-[10px] sm:text-xs text-[var(--text-tertiary)]">
          Data: NYC Open Data
        </span>
      </div>
    </main>
  );
}
