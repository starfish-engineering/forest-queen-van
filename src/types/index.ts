import type { Feature, Point, MultiPolygon } from 'geojson';

// ============================================
// Core Domain Types
// ============================================

export type TimeHorizon = '6mo' | '1yr' | '3yr';

export type PermitCategory = 'building' | 'business' | 'restaurant' | 'liquor';

// ============================================
// Geographic Types
// ============================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  sw: Coordinates; // Southwest corner
  ne: Coordinates; // Northeast corner
}

export interface Address extends Coordinates {
  formatted: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  borough?: string;
}

// ============================================
// Census Tract Types
// ============================================

export interface CensusTractInfo {
  geoid: string;
  name: string;
  countyFips: string;
  landAreaSqm?: number;
}

export interface CensusTractWithGeometry extends CensusTractInfo {
  geometry: Feature<MultiPolygon>;
}

export interface CensusTractWithScores extends CensusTractInfo {
  scores: {
    [K in TimeHorizon]: TractScoreData;
  };
}

export interface TractScoreData {
  permitCount: number;
  permitValue: number;
  permitDensity: number;
  businessCount: number;
  highEndBusinessCount: number;
  compositeScore: number;
}

// ============================================
// Permit Types
// ============================================

export interface PermitData {
  id: string;
  permitNumber: string;
  permitType: string;
  permitSubtype?: string;
  description?: string;
  filingDate: string;
  issuanceDate?: string;
  estimatedCost?: number;
  address: string;
  borough?: string;
  latitude: number;
  longitude: number;
  distanceFromSubject?: number; // miles
  category: PermitCategory;
}

export interface PermitSummary {
  permits: PermitData[];
  total: number;
  byType: Record<string, number>;
  byCategory: Record<PermitCategory, number>;
}

// ============================================
// Business Types
// ============================================

export interface BusinessData {
  id: string;
  licenseNumber: string;
  businessName?: string;
  businessType: string;
  licenseStatus?: string;
  issueDate?: string;
  address: string;
  borough?: string;
  latitude: number;
  longitude: number;
  isHighEndIndicator: boolean;
  distanceFromSubject?: number; // miles
}

// ============================================
// Filter Types
// ============================================

export interface FilterState {
  building: {
    multifamily: boolean;
    majorRenovation: boolean;
    commercialTi: boolean;
    newConstruction: boolean;
  };
  business: {
    restaurant: boolean;
    coffee: boolean;
    retail: boolean;
    fitness: boolean;
    coworking: boolean;
    grocery: boolean;
  };
  liquor: {
    bar: boolean;
    wineBar: boolean;
    restaurantLiquor: boolean;
  };
}

export interface FilterCategory {
  id: string;
  label: string;
  icon: string;
  subfilters: FilterSubcategory[];
}

export interface FilterSubcategory {
  id: string;
  label: string;
  count?: number;
}

// ============================================
// API Response Types
// ============================================

export interface SearchResponse {
  address: Address;
  censusTract: CensusTractWithGeometry;
  adjacentTracts: CensusTractInfo[];
}

export interface PermitsResponse {
  permits: PermitData[];
  total: number;
  byType: Record<string, number>;
}

export interface CensusResponse {
  tract: CensusTractWithGeometry & {
    scores: Record<TimeHorizon, TractScoreData>;
  };
  adjacentTracts?: CensusTractWithGeometry[];
}

export interface HeatmapResponse {
  points: Array<{
    latitude: number;
    longitude: number;
    weight: number;
  }>;
}

// ============================================
// UI State Types
// ============================================

export interface AppState {
  // Subject property
  subjectAddress: Address | null;
  subjectTract: CensusTractWithGeometry | null;
  
  // Filters
  activeFilters: FilterState;
  timeHorizon: TimeHorizon;
  includeAdjacentTracts: boolean;
  
  // UI state
  drawerOpen: boolean;
  selectedPermit: PermitData | null;
  
  // Map state
  mapCenter: Coordinates;
  mapZoom: number;
}

// ============================================
// Marker Types (for Mapbox)
// ============================================

export interface MarkerConfig {
  color: string;
  icon: string;
}

export const MARKER_CONFIGS: Record<PermitCategory, MarkerConfig> = {
  building: { color: '#00d4ff', icon: 'construction' },
  business: { color: '#00e676', icon: 'store' },
  restaurant: { color: '#ffc400', icon: 'restaurant' },
  liquor: { color: '#e040fb', icon: 'wine' },
};

