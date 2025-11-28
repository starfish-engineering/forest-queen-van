'use client';

import { Map } from '@/components/Map/Map';
import { SearchBar } from '@/components/Search/SearchBar';
import { FilterPanel } from '@/components/Filters/FilterPanel';
import { TimeToggle } from '@/components/Filters/TimeToggle';
import { DetailDrawer } from '@/components/Drawer/DetailDrawer';
import { PropertyPanel } from '@/components/Property/PropertyPanel';
import { ModeToggle } from '@/components/ModeToggle';
import { RankingsPanel } from '@/components/Scout/RankingsPanel';
import { MapLegend } from '@/components/Map/MapLegend';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const { mode, subjectAddress, drawerOpen, filterPanelOpen } = useAppStore();

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* Map Layer */}
      <Map />
      
      {/* Top Bar - Mode Toggle + Search */}
      <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-3 sm:px-4">
        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <div className="hidden sm:block shrink-0">
            <ModeToggle />
          </div>
          
          {/* Search Bar (Lookup mode) or Scout Title (Scout mode) */}
          <div className="flex-1">
            {mode === 'lookup' ? (
              <SearchBar />
            ) : (
              <div className="h-12 glass px-4 rounded-lg border border-[var(--border-default)] flex items-center">
                <span className="text-[var(--text-secondary)]">
                  🎯 Find promising neighborhoods
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Mode Toggle */}
      <div className="sm:hidden absolute top-[72px] left-3 z-20">
        <ModeToggle />
      </div>
      
      {/* LOOKUP MODE UI */}
      {mode === 'lookup' && (
        <>
          {/* Left Panel - Filters (desktop only) */}
          <div className="hidden sm:block absolute top-24 left-4 lg:left-6 z-10 animate-slide-in-up">
            <FilterPanel />
          </div>
          
          {/* Mobile Filter Button */}
          <button 
            className="sm:hidden absolute top-32 left-3 z-10 p-3 glass rounded-xl border border-[var(--border-default)]"
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
          
          {/* Property Panel - Shows when address is looked up */}
          {subjectAddress && (
            <PropertyPanel />
          )}
        </>
      )}
      
      {/* SCOUT MODE UI */}
      {mode === 'scout' && (
        <>
          {/* Rankings Panel - Left Side (Manhattan slopes right-to-left) */}
          <div className="hidden sm:block absolute top-24 left-4 lg:left-6 z-10 animate-slide-in-up">
            <RankingsPanel />
          </div>
          
          {/* Mobile Rankings - Bottom Sheet (simplified) */}
          <div className="sm:hidden absolute bottom-24 left-3 right-3 z-10">
            <div className="glass rounded-xl border border-[var(--border-default)] p-3">
              <p className="text-xs text-[var(--text-secondary)] text-center">
                View rankings on desktop for full experience
              </p>
            </div>
          </div>
        </>
      )}
      
      {/* Bottom Controls - Legend + Time Toggle */}
      <div className="absolute bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        {mode === 'scout' && <MapLegend />}
        <TimeToggle />
      </div>
      
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
