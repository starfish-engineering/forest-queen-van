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
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4">
        <SearchBar />
      </div>
      
      {/* Left Panel - Filters */}
      {filterPanelOpen && (
        <div className="absolute top-24 left-6 z-10 animate-slide-in-up">
          <FilterPanel />
        </div>
      )}
      
      {/* Time Toggle - Bottom Center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <TimeToggle />
      </div>
      
      {/* Score Card - Shows when tract is selected */}
      {subjectTract && (
        <div className="absolute top-24 right-6 z-10 animate-slide-in-up space-y-3">
          <ScoreCard />
          <AdjacentTractsPanel />
        </div>
      )}
      
      {/* Detail Drawer */}
      {drawerOpen && <DetailDrawer />}
      
      {/* Attribution */}
      <div className="absolute bottom-6 right-6 z-10">
        <span className="text-xs text-[var(--text-tertiary)]">
          Data: NYC Open Data
        </span>
      </div>
    </main>
  );
}
