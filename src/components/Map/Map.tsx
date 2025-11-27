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
      const url = `/api/permits/nearby?lat=${lat}&lng=${lng}&radius=0.015&limit=300${filterTypes ? `&types=${filterTypes}` : ''}`;
      
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
      console.log(`Loaded ${geojson.features.length} permit markers`);
    } catch (error) {
      console.error('Error loading permits:', error);
      setPermitCount(0);
    } finally {
      setPermitsLoading(false);
    }
  }, [mapLoaded, getActiveFilterTypes]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Set access token at runtime
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
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

  // Fetch and display heatmap data
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    // Only show heatmap when zoomed out (no subject address selected)
    // When subject is selected, we show individual markers instead
    if (subjectAddress) {
      // Clear heatmap when address is selected
      const source = map.current.getSource('permits-heatmap') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({ type: 'FeatureCollection', features: [] });
      }
      return;
    }

    const fetchHeatmapData = async () => {
      try {
        const bounds = map.current?.getBounds();
        if (!bounds) return;

        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const boundsParam = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;

        const response = await fetch(
          `/api/heatmap?bounds=${boundsParam}&timeHorizon=${timeHorizon}`
        );

        if (!response.ok) throw new Error('Heatmap fetch failed');

        const data = await response.json();

        const source = map.current?.getSource('permits-heatmap') as mapboxgl.GeoJSONSource;
        if (source && data.points) {
          source.setData({
            type: 'FeatureCollection',
            features: data.points.map((p: { latitude: number; longitude: number; weight: number }) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [p.longitude, p.latitude],
              },
              properties: {
                weight: p.weight,
              },
            })),
          });
          console.log(`Heatmap updated with ${data.points.length} points`);
        }
      } catch (error) {
        console.error('Failed to fetch heatmap:', error);
      }
    };

    // Fetch initial heatmap data
    fetchHeatmapData();

    // Update heatmap when map moves (debounced)
    let timeoutId: NodeJS.Timeout;
    const handleMoveEnd = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(fetchHeatmapData, 500);
    };

    map.current.on('moveend', handleMoveEnd);

    return () => {
      clearTimeout(timeoutId);
      map.current?.off('moveend', handleMoveEnd);
    };
  }, [mapLoaded, subjectAddress, timeHorizon]);

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

  // Refetch permits when filters change (if subject address exists)
  useEffect(() => {
    if (!subjectAddress || !mapLoaded) return;
    
    // Small delay to batch filter changes
    const timeoutId = setTimeout(() => {
      fetchNearbyPermits(subjectAddress.latitude, subjectAddress.longitude);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [activeFilters, subjectAddress, mapLoaded, fetchNearbyPermits]);

  return (
    <>
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full"
        style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}
      />
      
      {/* Loading indicator */}
      {permitsLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="glass px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
               style={{ border: '1px solid var(--border-default)' }}>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Loading permits...
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

