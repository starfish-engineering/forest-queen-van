'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAppStore } from '@/lib/store';

// NYC bounds
const NYC_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-74.259, 40.477], // SW
  [-73.700, 40.917], // NE
];

export function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const { 
    mapCenter, 
    mapZoom, 
    setMapView,
    subjectAddress,
    subjectTract 
  } = useAppStore();

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

    if (subjectTract) {
      source.setData({
        type: 'FeatureCollection',
        features: [
          {
            ...subjectTract.geometry,
            properties: {
              ...subjectTract.geometry.properties,
              isSubject: true,
              geoid: subjectTract.geoid,
            },
          },
        ],
      });
    } else {
      source.setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
  }, [subjectTract, mapLoaded]);

  // Fly to subject address when selected
  useEffect(() => {
    if (!map.current || !subjectAddress) return;

    map.current.flyTo({
      center: [subjectAddress.longitude, subjectAddress.latitude],
      zoom: 14,
      duration: 1500,
    });

    // Remove old marker if exists
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Add marker for subject property
    markerRef.current = new mapboxgl.Marker({
      color: '#00d4ff',
    })
      .setLngLat([subjectAddress.longitude, subjectAddress.latitude])
      .addTo(map.current);
  }, [subjectAddress]);

  return (
    <div 
      ref={mapContainer} 
      className="absolute inset-0 w-full h-full"
      style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}
    />
  );
}

