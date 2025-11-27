'use client';

import { useQuery } from '@tanstack/react-query';
import type { 
  SearchResponse, 
  PermitsResponse, 
  CensusResponse, 
  HeatmapResponse,
  TimeHorizon,
  FilterState,
  BoundingBox,
} from '@/types';

// ============================================
// Address Search
// ============================================

export function useSearchAddress(query: string) {
  return useQuery<SearchResponse>({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query || query.length < 3) {
        throw new Error('Query too short');
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: query.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================
// Permits Query
// ============================================

interface UsePermitsOptions {
  tractIds: string[];
  timeHorizon: TimeHorizon;
  filters: FilterState;
  subjectLat?: number;
  subjectLng?: number;
}

export function usePermits(options: UsePermitsOptions) {
  const { tractIds, timeHorizon, filters, subjectLat, subjectLng } = options;
  
  return useQuery<PermitsResponse>({
    queryKey: ['permits', tractIds, timeHorizon, filters, subjectLat, subjectLng],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('tract', tractIds.join(','));
      params.set('timeHorizon', timeHorizon);
      
      // Build filter string
      const activeTypes: string[] = [];
      Object.entries(filters).forEach(([category, subcats]) => {
        Object.entries(subcats).forEach(([subcat, enabled]) => {
          if (enabled) activeTypes.push(`${category}.${subcat}`);
        });
      });
      if (activeTypes.length > 0) {
        params.set('types', activeTypes.join(','));
      }
      
      if (subjectLat && subjectLng) {
        params.set('subjectLat', subjectLat.toString());
        params.set('subjectLng', subjectLng.toString());
      }
      
      const res = await fetch(`/api/permits?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch permits');
      return res.json();
    },
    enabled: tractIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================
// Census Tract Data
// ============================================

interface UseTractDataOptions {
  geoid: string;
  includeAdjacent?: boolean;
}

export function useTractData(options: UseTractDataOptions) {
  const { geoid, includeAdjacent = false } = options;
  
  return useQuery<CensusResponse>({
    queryKey: ['census', geoid, includeAdjacent],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (includeAdjacent) params.set('includeAdjacent', 'true');
      
      const res = await fetch(`/api/census/${geoid}?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch census tract');
      return res.json();
    },
    enabled: !!geoid,
    staleTime: 10 * 60 * 1000, // 10 minutes (census data rarely changes)
  });
}

// ============================================
// Heatmap Data
// ============================================

interface UseHeatmapDataOptions {
  bounds: BoundingBox;
  timeHorizon: TimeHorizon;
  filters: FilterState;
}

export function useHeatmapData(options: UseHeatmapDataOptions) {
  const { bounds, timeHorizon, filters } = options;
  
  return useQuery<HeatmapResponse>({
    queryKey: ['heatmap', bounds, timeHorizon, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('bounds', `${bounds.sw.longitude},${bounds.sw.latitude},${bounds.ne.longitude},${bounds.ne.latitude}`);
      params.set('timeHorizon', timeHorizon);
      
      const res = await fetch(`/api/heatmap?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch heatmap data');
      return res.json();
    },
    enabled: !!bounds,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// ============================================
// Mapbox Geocoding (for autocomplete)
// ============================================

interface GeocodeSuggestion {
  place_name: string;
  center: [number, number];
  context?: Array<{ id: string; text: string }>;
}

// NYC borough/area names to filter results
const NYC_AREAS = [
  'new york', 'manhattan', 'brooklyn', 'queens', 'bronx', 'staten island',
  'new york city', 'nyc'
];

function isNYCAddress(suggestion: GeocodeSuggestion): boolean {
  const placeName = suggestion.place_name.toLowerCase();
  
  // Check if place_name contains NYC area AND "new york" state (not New Jersey)
  const hasNYState = placeName.includes(', new york');
  const hasNYCArea = NYC_AREAS.some(area => placeName.includes(area));
  
  // Exclude New Jersey results
  if (placeName.includes('new jersey') || placeName.includes(', nj')) {
    return false;
  }
  
  return hasNYState || hasNYCArea;
}

export function useGeocodeAutocomplete(query: string) {
  return useQuery<GeocodeSuggestion[]>({
    queryKey: ['geocode', query],
    queryFn: async () => {
      if (!query || query.length < 3) return [];
      
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
      if (!token) throw new Error('Mapbox token not configured');
      
      // NYC bounding box + proximity to Manhattan for better results
      const bbox = '-74.259,40.477,-73.700,40.917';
      const proximity = '-73.9857,40.7484'; // Midtown Manhattan
      
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${token}&` +
        `bbox=${bbox}&` +
        `proximity=${proximity}&` +
        `types=address&` +
        `limit=10` // Fetch more, then filter
      );
      
      if (!res.ok) throw new Error('Geocoding failed');
      const data = await res.json();
      
      // Filter to only NYC addresses and limit to 5
      const nycResults = (data.features || [])
        .filter(isNYCAddress)
        .slice(0, 5);
      
      return nycResults;
    },
    enabled: query.length >= 3,
    staleTime: 30 * 1000, // 30 seconds
  });
}

