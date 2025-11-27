'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAppStore } from '@/lib/store';

// NYC bounds
const NYC_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-74.259, 40.477], // SW
  [-73.700, 40.917], // NE
];

// Permit type colors
const PERMIT_COLORS: Record<string, string> = {
  'NB': '#22c55e',  // New Building - green
  'A1': '#f59e0b',  // Alteration Type 1 - amber
  'A2': '#3b82f6',  // Alteration Type 2 - blue
  'A3': '#8b5cf6',  // Alteration Type 3 - purple
  'DM': '#ef4444',  // Demolition - red
  'EW': '#06b6d4',  // Equipment Work - cyan
  'EQ': '#06b6d4',  // Equipment - cyan
  'default': '#94a3b8', // Default - gray
};

function getPermitColor(type: string): string {
  return PERMIT_COLORS[type] || PERMIT_COLORS.default;
}

export function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const permitMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [permitsLoading, setPermitsLoading] = useState(false);
  const [permitCount, setPermitCount] = useState(0);
  
  const { 
    mapCenter, 
    mapZoom, 
    setMapView,
    subjectAddress,
    subjectTract,
    adjacentTracts,
    includeAdjacentTracts,
    timeHorizon,
    activeFilters,
    mode,
  } = useAppStore();

  // Build filter types string from active filters
  const getActiveFilterTypes = useCallback(() => {
    const types: string[] = [];
    
    // Map filter checkboxes to permit type IDs
    if (activeFilters.building.newConstruction) types.push('newConstruction');
    if (activeFilters.building.majorRenovation) types.push('majorRenovation');
    if (activeFilters.building.commercialTi) types.push('commercialTi');
    if (activeFilters.building.multifamily) types.push('multifamily');
    
    return types.length > 0 ? types.join(',') : '';
  }, [activeFilters]);

  // Fetch nearby permits
  const fetchNearbyPermits = useCallback(async (lat: number, lng: number) => {
    if (!map.current || !mapLoaded) return;
    
    setPermitsLoading(true);
    
    try {
      const filterTypes = getActiveFilterTypes();
      const url = `/api/permits/nearby?lat=${lat}&lng=${lng}&radius=0.015&limit=300&timeHorizon=${timeHorizon}${filterTypes ? `&types=${filterTypes}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch permits');
      
      const geojson = await response.json();
      
      // Clear old markers
      permitMarkersRef.current.forEach(m => m.remove());
      permitMarkersRef.current = [];
      
      // Add new markers
      geojson.features.forEach((feature: any) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties;
        
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'permit-marker';
        el.style.cssText = `
          width: 12px;
          height: 12px;
          background: ${getPermitColor(props.permitType)};
          border: 2px solid rgba(255,255,255,0.8);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;
        
        // Create popup
        const popup = new mapboxgl.Popup({
          offset: 15,
          closeButton: true,
          closeOnClick: true,
          className: 'permit-popup',
          maxWidth: '280px',
        }).setHTML(`
          <div style="font-family: system-ui; font-size: 13px; padding: 4px;">
            <div style="font-weight: 600; color: #00d4ff; margin-bottom: 6px; font-size: 14px;">
              ${props.permitType} Permit
            </div>
            <div style="color: #f0f0f5; margin-bottom: 6px; line-height: 1.4;">
              ${props.address || 'Address N/A'}
            </div>
            <div style="color: #a0a0b0; font-size: 12px;">
              📅 Filed: ${props.filingDate || 'N/A'}
            </div>
            ${props.description ? `
              <div style="color: #a0a0b0; font-size: 12px; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1);">
                ${props.description}
              </div>
            ` : ''}
          </div>
        `);
        
        el.addEventListener('mouseenter', () => {
          el.style.boxShadow = '0 0 0 4px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.4)';
          el.style.zIndex = '10';
        });
        el.addEventListener('mouseleave', () => {
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
          el.style.zIndex = '1';
        });
        
        // Click to toggle popup
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          // Close any other open popups first
          permitMarkersRef.current.forEach(m => {
            if (m.getPopup()?.isOpen()) m.togglePopup();
          });
          marker.togglePopup();
        });
        
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current!);
        
        permitMarkersRef.current.push(marker);
      });
      
      setPermitCount(geojson.features.length);
      console.log(`Loaded ${geojson.features.length} permit markers (${timeHorizon})`);
    } catch (error) {
      console.error('Error loading permits:', error);
      setPermitCount(0);
    } finally {
      setPermitsLoading(false);
    }
  }, [mapLoaded, getActiveFilterTypes, timeHorizon]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Set access token at runtime
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
    if (!token) {
      console.error('Mapbox token not found');
      return;
    }
    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [mapCenter.longitude, mapCenter.latitude],
      zoom: mapZoom,
      maxBounds: NYC_BOUNDS,
      attributionControl: false,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add custom layers for census tracts
      map.current?.addSource('census-tracts', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Subject tract fill
      map.current?.addLayer({
        id: 'subject-tract-fill',
        type: 'fill',
        source: 'census-tracts',
        filter: ['==', ['get', 'isSubject'], true],
        paint: {
          'fill-color': '#00d4ff',
          'fill-opacity': 0.15,
        },
      });

      // Subject tract outline
      map.current?.addLayer({
        id: 'subject-tract-outline',
        type: 'line',
        source: 'census-tracts',
        filter: ['==', ['get', 'isSubject'], true],
        paint: {
          'line-color': '#00d4ff',
          'line-width': 2,
        },
      });

      // Adjacent tract fill
      map.current?.addLayer({
        id: 'adjacent-tract-fill',
        type: 'fill',
        source: 'census-tracts',
        filter: ['==', ['get', 'isSubject'], false],
        paint: {
          'fill-color': '#ffffff',
          'fill-opacity': 0.05,
        },
      });

      // Adjacent tract outline
      map.current?.addLayer({
        id: 'adjacent-tract-outline',
        type: 'line',
        source: 'census-tracts',
        filter: ['==', ['get', 'isSubject'], false],
        paint: {
          'line-color': '#ffffff',
          'line-width': 1,
          'line-dasharray': [4, 4],
        },
      });

      // Heatmap layer placeholder
      map.current?.addSource('permits-heatmap', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.current?.addLayer({
        id: 'permits-heat',
        type: 'heatmap',
        source: 'permits-heatmap',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'weight'],
            0, 0,
            10, 1,
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 1,
            15, 3,
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, '#2c7bb6',
            0.4, '#abd9e9',
            0.6, '#ffffbf',
            0.8, '#fdae61',
            1, '#d7191c',
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 15,
            15, 30,
          ],
          'heatmap-opacity': 0.7,
        },
      });

      // Individual permit markers for high zoom (Scout mode)
      map.current?.addSource('scout-permits', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Permit type colors
      // NB = New Building (green), A1 = Major Alteration (orange), 
      // A2 = Minor Alteration (blue), A3 = Renovation (purple), DM = Demolition (red)
      map.current?.addLayer({
        id: 'scout-permits-circles',
        type: 'circle',
        source: 'scout-permits',
        layout: {
          'visibility': 'none', // Hidden by default, shown at granular zoom
        },
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            14, 6,
            16, 10,
            18, 14,
          ],
          'circle-color': [
            'match',
            ['get', 'permitType'],
            'NB', '#22c55e',      // New Building - green
            'A1', '#f59e0b',      // Major Alteration - orange
            'A2', '#3b82f6',      // Minor Alteration - blue
            'A3', '#8b5cf6',      // Renovation - purple
            'DM', '#ef4444',      // Demolition - red
            '#6b7280',            // default - gray
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      });

      // Symbol layer for permit type icons
      map.current?.addLayer({
        id: 'scout-permits-labels',
        type: 'symbol',
        source: 'scout-permits',
        minzoom: 16,
        layout: {
          'visibility': 'none', // Hidden by default, shown at granular zoom
          'text-field': ['get', 'permitType'],
          'text-size': 9,
          'text-offset': [0, 0],
          'text-anchor': 'center',
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
        },
        paint: {
          'text-color': '#ffffff',
        },
      });
    });

    // Update store on map move
    map.current.on('moveend', () => {
      if (!map.current) return;
      const center = map.current.getCenter();
      const zoom = map.current.getZoom();
      setMapView(
        { latitude: center.lat, longitude: center.lng },
        zoom
      );
    });

    // Click handler for scout permit markers
    map.current.on('click', 'scout-permits-circles', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const props = feature.properties;
      const coords = (feature.geometry as GeoJSON.Point).coordinates;
      
      // Create popup with permit details
      new mapboxgl.Popup({ closeButton: true, maxWidth: '300px' })
        .setLngLat(coords as [number, number])
        .setHTML(`
          <div style="font-family: system-ui; padding: 8px;">
            <div style="font-weight: 600; color: #00d4ff; margin-bottom: 4px;">
              ${props?.permitType || 'Permit'} - ${props?.permitNumber || 'N/A'}
            </div>
            <div style="font-size: 12px; color: #888; margin-bottom: 8px;">
              ${props?.address || 'Unknown address'}
            </div>
            <div style="font-size: 11px; color: #666;">
              ${props?.description ? `<div style="margin-bottom: 4px;">${props.description}</div>` : ''}
              ${props?.estimatedCost ? `<div><strong>Est. Cost:</strong> $${Number(props.estimatedCost).toLocaleString()}</div>` : ''}
              ${props?.filingDate ? `<div><strong>Filed:</strong> ${props.filingDate}</div>` : ''}
            </div>
          </div>
        `)
        .addTo(map.current!);
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'scout-permits-circles', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'scout-permits-circles', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update tract layers when subject tract changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const source = map.current.getSource('census-tracts') as mapboxgl.GeoJSONSource;
    if (!source) return;

    const features: GeoJSON.Feature[] = [];

    if (subjectTract && subjectTract.geometry) {
      // Handle both Feature and raw Geometry formats from API
      const geom = subjectTract.geometry as unknown;
      const isFeature = (geom as { type?: string }).type === 'Feature';
      
      const subjectFeature: GeoJSON.Feature = isFeature ? {
        ...(geom as GeoJSON.Feature),
            properties: {
          ...((geom as { properties?: object }).properties || {}),
              isSubject: true,
              geoid: subjectTract.geoid,
            },
      } : {
        type: 'Feature',
        geometry: geom as GeoJSON.Geometry,
        properties: {
          isSubject: true,
          geoid: subjectTract.geoid,
          name: subjectTract.name,
        },
      };

      features.push(subjectFeature);
      
      // Add adjacent tracts if enabled and available
      if (includeAdjacentTracts && adjacentTracts.length > 0) {
        adjacentTracts.forEach((tract) => {
          if (tract.geometry) {
            const adjGeom = tract.geometry as unknown;
            const adjIsFeature = (adjGeom as { type?: string }).type === 'Feature';
            
            const adjFeature: GeoJSON.Feature = adjIsFeature ? {
              ...(adjGeom as GeoJSON.Feature),
              properties: {
                ...((adjGeom as { properties?: object }).properties || {}),
                isSubject: false,
                geoid: tract.geoid,
              },
            } : {
              type: 'Feature',
              geometry: adjGeom as GeoJSON.Geometry,
              properties: {
                isSubject: false,
                geoid: tract.geoid,
                name: tract.name,
              },
            };
            
            features.push(adjFeature);
          }
        });
      }
      
      console.log('Census tract overlay updated:', subjectTract.geoid, `(+${features.length - 1} adjacent)`);
    }

      source.setData({
        type: 'FeatureCollection',
      features,
    });
  }, [subjectTract, adjacentTracts, includeAdjacentTracts, mapLoaded]);

  // Track if we're currently flying to prevent feedback loops
  const isFlyingRef = useRef(false);
  const flyToTargetRef = useRef<{ lat: number; lng: number } | null>(null);

  // Fly to location when mapCenter changes (e.g., from Scout drill-in)
  // Only fly if the change is significant (not from user pan/zoom)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    const currentCenter = map.current.getCenter();
    const targetLat = mapCenter.latitude;
    const targetLng = mapCenter.longitude;
    
    // Check if this is a significant change (not just from moveend feedback)
    const distance = Math.sqrt(
      Math.pow(currentCenter.lat - targetLat, 2) + 
      Math.pow(currentCenter.lng - targetLng, 2)
    );
    
    // Only fly if distance is significant (> ~100m) and not already flying to this target
    const isSignificantMove = distance > 0.001;
    const isSameTarget = flyToTargetRef.current?.lat === targetLat && 
                         flyToTargetRef.current?.lng === targetLng;
    
    if (isSignificantMove && !isFlyingRef.current && !isSameTarget) {
      isFlyingRef.current = true;
      flyToTargetRef.current = { lat: targetLat, lng: targetLng };
      
      map.current.flyTo({
        center: [targetLng, targetLat],
        zoom: mapZoom,
        duration: 1500,
        essential: true,
      });
      
      // Reset flying flag after animation
      setTimeout(() => {
        isFlyingRef.current = false;
      }, 1600);
    }
  }, [mapCenter.latitude, mapCenter.longitude, mapZoom, mapLoaded]);

  // Fetch and display heatmap data - ONLY in Scout mode
  // Multi-level LOD for smooth transitions:
  // - Borough level (zoom < 10): ~5 points
  // - Neighborhood level (zoom 10-12): ~200 points  
  // - Tract level (zoom 12-14): ~500 points
  // - Granular permits (zoom >= 14): individual permits
  type HeatmapLOD = 'borough' | 'neighborhood' | 'tract' | 'granular';
  
  const getLODLevel = (zoom: number): HeatmapLOD => {
    if (zoom >= 13) return 'granular';  // Show individual permits earlier
    if (zoom >= 11) return 'tract';
    if (zoom >= 9) return 'neighborhood';
    return 'borough';
  };

  const [heatmapVisible, setHeatmapVisible] = useState(false);
  const [heatmapLOD, setHeatmapLOD] = useState<HeatmapLOD>('neighborhood');
  const heatmapFetchRef = useRef<AbortController | null>(null);
  const lastLODRef = useRef<HeatmapLOD | null>(null);
  
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    const clearHeatmap = () => {
      const source = map.current?.getSource('permits-heatmap') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({ type: 'FeatureCollection', features: [] });
      }
      setHeatmapVisible(false);
    };

    // Only show heatmap in Scout mode
    if (mode === 'lookup') {
      clearHeatmap();
      return;
    }

    const fetchHeatmapData = async (forceRefetch = false) => {
      const currentZoom = map.current?.getZoom() || 0;
      const lodLevel = getLODLevel(currentZoom);
      
      console.log(`[Heatmap] zoom=${currentZoom.toFixed(1)}, LOD=${lodLevel}, last=${lastLODRef.current}, force=${forceRefetch}`);
      
      // Skip fetch if LOD level hasn't changed (except for granular which needs bounds)
      if (!forceRefetch && lodLevel === lastLODRef.current && lodLevel !== 'granular') {
        console.log('[Heatmap] Skipping - same LOD level');
        return;
      }
      
      // Cancel previous request
      if (heatmapFetchRef.current) {
        heatmapFetchRef.current.abort();
      }
      const controller = new AbortController();
      heatmapFetchRef.current = controller;

      try {
        setHeatmapLOD(lodLevel);
        lastLODRef.current = lodLevel;
        console.log(`[Heatmap] Fetching ${lodLevel} data...`);

        let features: GeoJSON.Feature[] = [];

        if (lodLevel === 'granular') {
          // Zoomed in: show individual permit markers instead of heatmap
          const bounds = map.current?.getBounds();
          if (!bounds) return;

          const center = bounds.getCenter();
          
          // Fetch actual permits with type info
          const response = await fetch(
            `/api/permits/nearby?lat=${center.lat}&lng=${center.lng}&radius=0.02&timeHorizon=${timeHorizon}&limit=500`,
            { signal: controller.signal }
          );

          if (!response.ok) throw new Error('Permit fetch failed');
          const data = await response.json();

          // Update scout-permits source with individual markers
          const scoutSource = map.current?.getSource('scout-permits') as mapboxgl.GeoJSONSource;
          if (scoutSource && data.features) {
            scoutSource.setData(data);
            console.log(`[Scout] Showing ${data.features.length} individual permits`);
          }

          // Hide heatmap, show markers
          console.log('[Scout] Hiding heatmap, showing markers...');
          try {
            map.current?.setLayoutProperty('permits-heat', 'visibility', 'none');
            map.current?.setLayoutProperty('scout-permits-circles', 'visibility', 'visible');
            map.current?.setLayoutProperty('scout-permits-labels', 'visibility', 'visible');
            console.log('[Scout] Layer visibility updated successfully');
          } catch (e) {
            console.error('[Scout] Error setting layer visibility:', e);
          }
          
          setHeatmapVisible(data.features?.length > 0);
          return; // Don't update heatmap source
        } else {
          // Hide markers, show heatmap for aggregated levels
          console.log('[Heatmap] Showing heatmap, hiding markers...');
          try {
            map.current?.setLayoutProperty('permits-heat', 'visibility', 'visible');
            map.current?.setLayoutProperty('scout-permits-circles', 'visibility', 'none');
            map.current?.setLayoutProperty('scout-permits-labels', 'visibility', 'none');
          } catch (e) {
            console.error('[Heatmap] Error setting layer visibility:', e);
          }
          
          // Clear scout permits
          const scoutSource = map.current?.getSource('scout-permits') as mapboxgl.GeoJSONSource;
          if (scoutSource) {
            scoutSource.setData({ type: 'FeatureCollection', features: [] });
          }
          // Aggregated levels: borough, neighborhood, or tract
          const response = await fetch(
            `/api/heatmap/aggregated?timeHorizon=${timeHorizon}&level=${lodLevel}`,
            { signal: controller.signal }
          );

          if (!response.ok) throw new Error('Aggregated heatmap fetch failed');
          const data = await response.json();

          // Convert aggregated data to heatmap points with capital-based weights
          const points = data.points || [];
          const maxCapital = Math.max(...points.map((t: { totalCapital: number }) => t.totalCapital), 1);
          const maxCount = Math.max(...points.map((t: { permitCount: number }) => t.permitCount), 1);
          
          features = points.map((t: { lat: number; lng: number; totalCapital: number; permitCount: number }) => {
            // Normalize weights relative to max values (0-1 range, then scale to 1-10)
            const capitalNorm = t.totalCapital / maxCapital;
            const countNorm = t.permitCount / maxCount;
            
            // Weight more by capital, but also consider count
            const weight = 1 + (capitalNorm * 6) + (countNorm * 3);

            return {
              type: 'Feature' as const,
              geometry: { type: 'Point' as const, coordinates: [t.lng, t.lat] },
              properties: { weight },
            };
          });

          const totalPermits = points.reduce((s: number, t: { permitCount: number }) => s + t.permitCount, 0);
          console.log(`Heatmap (${lodLevel}): ${features.length} points, ~${totalPermits} permits`);
        }

        const source = map.current?.getSource('permits-heatmap') as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData({ type: 'FeatureCollection', features });
          setHeatmapVisible(features.length > 0);
          
          // Adjust heatmap layer properties based on LOD level
          // Larger radius for coarser aggregation, smaller for finer detail
          const radiusConfig: Record<HeatmapLOD, mapboxgl.Expression> = {
            borough: ['interpolate', ['linear'], ['zoom'], 8, 80, 10, 120],
            neighborhood: ['interpolate', ['linear'], ['zoom'], 10, 50, 12, 80],
            tract: ['interpolate', ['linear'], ['zoom'], 12, 30, 14, 50],
            granular: ['interpolate', ['linear'], ['zoom'], 14, 15, 16, 25],
          };
          
          const intensityConfig: Record<HeatmapLOD, mapboxgl.Expression> = {
            borough: ['interpolate', ['linear'], ['zoom'], 8, 0.3, 10, 0.6],
            neighborhood: ['interpolate', ['linear'], ['zoom'], 10, 0.5, 12, 1],
            tract: ['interpolate', ['linear'], ['zoom'], 12, 0.8, 14, 1.5],
            granular: ['interpolate', ['linear'], ['zoom'], 14, 1, 16, 3],
          };

          map.current?.setPaintProperty('permits-heat', 'heatmap-radius', radiusConfig[lodLevel] as unknown as number);
          map.current?.setPaintProperty('permits-heat', 'heatmap-intensity', intensityConfig[lodLevel] as unknown as number);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Heatmap fetch error:', error);
        }
      }
    };

    // Fetch initial heatmap data
    console.log('[Heatmap] Initial fetch triggered');
    fetchHeatmapData(true);

    // Update heatmap when map moves (debounced)
    let moveTimeoutId: NodeJS.Timeout;
    const handleMoveEnd = () => {
      clearTimeout(moveTimeoutId);
      moveTimeoutId = setTimeout(() => fetchHeatmapData(), 300);
    };

    // Also listen for zoom changes to detect LOD transitions faster
    let zoomTimeoutId: NodeJS.Timeout;
    const handleZoom = () => {
      clearTimeout(zoomTimeoutId);
      zoomTimeoutId = setTimeout(() => fetchHeatmapData(), 200);
    };

    map.current.on('moveend', handleMoveEnd);
    map.current.on('zoomend', handleZoom);

    return () => {
      clearTimeout(moveTimeoutId);
      clearTimeout(zoomTimeoutId);
      if (heatmapFetchRef.current) heatmapFetchRef.current.abort();
      map.current?.off('moveend', handleMoveEnd);
      map.current?.off('zoomend', handleZoom);
      lastLODRef.current = null; // Reset LOD on cleanup so data refetches
    };
  }, [mapLoaded, mode, timeHorizon]);

  // Fly to subject address when selected
  useEffect(() => {
    if (!map.current || !subjectAddress) return;

    map.current.flyTo({
      center: [subjectAddress.longitude, subjectAddress.latitude],
      zoom: 15,
      duration: 1500,
    });

    // Remove old marker if exists
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Add marker for subject property
    markerRef.current = new mapboxgl.Marker({
      color: '#00d4ff',
      scale: 1.2,
    })
      .setLngLat([subjectAddress.longitude, subjectAddress.latitude])
      .addTo(map.current);
    
    // Fetch nearby permits after a short delay for map to settle
    setTimeout(() => {
      fetchNearbyPermits(subjectAddress.latitude, subjectAddress.longitude);
    }, 1800);
  }, [subjectAddress, fetchNearbyPermits]);

  // Refetch permits when filters or time horizon change (if subject address exists)
  useEffect(() => {
    if (!subjectAddress || !mapLoaded) return;
    
    // Small delay to batch filter changes
    const timeoutId = setTimeout(() => {
      fetchNearbyPermits(subjectAddress.latitude, subjectAddress.longitude);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [activeFilters, timeHorizon, subjectAddress, mapLoaded, fetchNearbyPermits]);

  return (
    <>
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full"
        style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}
      />
      
      {/* Initial map loading state */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-[var(--bg-primary)] flex items-center justify-center z-40">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-[var(--border-default)]" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">Loading map...</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Initializing NYC data</p>
          </div>
        </div>
      )}
      
      {/* Permits loading indicator */}
      {permitsLoading && mapLoaded && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="glass px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
               style={{ border: '1px solid var(--border-default)' }}>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Loading permits...
          </div>
        </div>
      )}
      
      {/* Scout mode: Show LOD level indicator */}
      {mode === 'scout' && mapLoaded && heatmapVisible && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="glass px-3 py-1.5 rounded-full text-xs"
               style={{ border: '1px solid var(--border-default)', opacity: 0.8 }}>
            {heatmapLOD === 'borough' && (
              <span className="text-[var(--text-secondary)]">
                🏙️ City-wide • Zoom for neighborhoods
              </span>
            )}
            {heatmapLOD === 'neighborhood' && (
              <span className="text-[var(--text-secondary)]">
                🗺️ Neighborhoods • Zoom for tracts
              </span>
            )}
            {heatmapLOD === 'tract' && (
              <span className="text-amber-400">
                📊 Census tracts • Zoom for permits
              </span>
            )}
            {heatmapLOD === 'granular' && (
              <span className="text-cyan-400">
                📍 Individual permits • Click for details
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Permit count badge */}
      {permitCount > 0 && !permitsLoading && (
        <div className="absolute bottom-20 left-4 z-50">
          <div className="glass px-3 py-2 rounded-lg text-xs"
               style={{ border: '1px solid var(--border-default)' }}>
            <div className="font-semibold text-cyan-400 mb-1">
              {permitCount} Permits
            </div>
            <div className="flex gap-2 flex-wrap" style={{ maxWidth: '200px' }}>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} /> NB
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} /> A1
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} /> A2
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: '#8b5cf6' }} /> A3
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

