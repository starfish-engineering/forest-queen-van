import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Address, 
  CensusTractWithGeometry, 
  FilterState, 
  TimeHorizon, 
  PermitData,
  Coordinates,
  TractScoreData,
} from '@/types';

export type AppMode = 'lookup' | 'scout';

// Default filter state - all enabled
const defaultFilters: FilterState = {
  building: {
    multifamily: true,
    majorRenovation: true,
    commercialTi: true,
    newConstruction: true,
  },
  business: {
    restaurant: true,
    coffee: true,
    retail: true,
    fitness: true,
    coworking: true,
    grocery: true,
  },
  liquor: {
    bar: true,
    wineBar: true,
    restaurantLiquor: true,
  },
};

// NYC center coordinates (default map view)
const NYC_CENTER: Coordinates = {
  latitude: 40.7128,
  longitude: -73.9856,
};

interface AppState {
  // App mode
  mode: AppMode;
  
  // Subject property (Lookup mode)
  subjectAddress: Address | null;
  subjectTract: CensusTractWithGeometry | null;
  adjacentTracts: CensusTractWithGeometry[];
  tractScores: Record<TimeHorizon, TractScoreData> | null;
  
  // Scout mode
  selectedScoutTract: string | null; // geoid of tract being viewed in Scout
  
  // Filters
  activeFilters: FilterState;
  timeHorizon: TimeHorizon;
  includeAdjacentTracts: boolean;
  
  // UI state
  drawerOpen: boolean;
  selectedPermit: PermitData | null;
  filterPanelOpen: boolean;
  
  // Map state
  mapCenter: Coordinates;
  mapZoom: number;
  
  // Actions
  setMode: (mode: AppMode) => void;
  setSubjectAddress: (address: Address | null) => void;
  setSubjectTract: (tract: CensusTractWithGeometry | null) => void;
  setAdjacentTracts: (tracts: CensusTractWithGeometry[]) => void;
  setTractScores: (scores: Record<TimeHorizon, TractScoreData> | null) => void;
  setSelectedScoutTract: (geoid: string | null) => void;
  previewScoutLocation: (geoid: string, lat: number, lng: number) => void;
  setActiveFilters: (filters: FilterState) => void;
  toggleFilter: (category: keyof FilterState, subcategory: string) => void;
  setTimeHorizon: (horizon: TimeHorizon) => void;
  toggleIncludeAdjacentTracts: () => void;
  openDrawer: (permit: PermitData) => void;
  closeDrawer: () => void;
  toggleFilterPanel: () => void;
  setMapView: (center: Coordinates, zoom: number) => void;
  resetFilters: () => void;
  clearAll: () => void;
  drillIntoTract: (geoid: string, name: string, lat: number, lng: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
  // Initial state - default to Scout mode
  mode: 'scout',
  subjectAddress: null,
  subjectTract: null,
  adjacentTracts: [],
  tractScores: null,
  selectedScoutTract: null,
  activeFilters: defaultFilters,
  timeHorizon: '1yr',
  includeAdjacentTracts: false,
  drawerOpen: false,
  selectedPermit: null,
  filterPanelOpen: false, // Starts closed, desktop shows via CSS
  mapCenter: NYC_CENTER,
  mapZoom: 11,
  
  // Actions
  setMode: (mode) => set({ mode }),
  
  setSubjectAddress: (address) => set({ subjectAddress: address }),
  
  setSubjectTract: (tract) => set({ subjectTract: tract }),
  
  setAdjacentTracts: (tracts) => set({ adjacentTracts: tracts }),
  
  setTractScores: (scores) => set({ tractScores: scores }),
  
  setSelectedScoutTract: (geoid) => set({ selectedScoutTract: geoid }),
  
  // Preview a location in Scout mode - fly to it and show heatmap
  previewScoutLocation: (geoid, lat, lng) => set({
    selectedScoutTract: geoid,
    mapCenter: { latitude: lat, longitude: lng },
    mapZoom: 14, // Zoom in enough to show heatmap (min is 12)
  }),
  
  setActiveFilters: (filters) => set({ activeFilters: filters }),
  
  toggleFilter: (category, subcategory) => set((state) => ({
    activeFilters: {
      ...state.activeFilters,
      [category]: {
        ...state.activeFilters[category],
        [subcategory]: !state.activeFilters[category][subcategory as keyof typeof state.activeFilters[typeof category]],
      },
    },
  })),
  
  setTimeHorizon: (horizon) => set({ timeHorizon: horizon }),
  
  toggleIncludeAdjacentTracts: () => set((state) => ({
    includeAdjacentTracts: !state.includeAdjacentTracts,
  })),
  
  openDrawer: (permit) => set({ drawerOpen: true, selectedPermit: permit }),
  
  closeDrawer: () => set({ drawerOpen: false, selectedPermit: null }),
  
  toggleFilterPanel: () => set((state) => ({ filterPanelOpen: !state.filterPanelOpen })),
  
  setMapView: (center, zoom) => set({ mapCenter: center, mapZoom: zoom }),
  
  resetFilters: () => set({ activeFilters: defaultFilters }),
  
  clearAll: () => set({
    mode: 'lookup',
    subjectAddress: null,
    subjectTract: null,
    adjacentTracts: [],
    tractScores: null,
    selectedScoutTract: null,
    activeFilters: defaultFilters,
    timeHorizon: '1yr',
    includeAdjacentTracts: false,
    drawerOpen: false,
    selectedPermit: null,
    mapCenter: NYC_CENTER,
    mapZoom: 11,
  }),
  
  // Drill into a tract from Scout mode → switches to Lookup mode and flies to location
  drillIntoTract: (geoid, name, lat, lng) => set({
    mode: 'lookup',
    subjectAddress: {
      formatted: name,
      latitude: lat,
      longitude: lng,
    },
    subjectTract: null, // Will be populated by search
    selectedScoutTract: null,
    mapCenter: { latitude: lat, longitude: lng },
    mapZoom: 15,
  }),
}),
    {
      name: 'capex-scout-storage',
      partialize: (state) => ({ mode: state.mode }), // Only persist mode
    }
  )
);

