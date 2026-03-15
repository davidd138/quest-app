'use client';

import { useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Location } from '@/types';
import { MAPBOX_TOKEN } from '@/lib/constants';

mapboxgl.accessToken = MAPBOX_TOKEN;

interface MarkerOptions {
  id: string;
  location: Location;
  color?: string;
  element?: HTMLElement;
}

interface RouteOptions {
  id: string;
  coordinates: [number, number][];
  color?: string;
  dashArray?: number[];
  width?: number;
}

export function useMap() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  const flyTo = useCallback((location: Location, zoom?: number) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [location.longitude, location.latitude],
      zoom: zoom ?? 15,
      pitch: 45,
      bearing: 0,
      duration: 2000,
      essential: true,
    });
  }, []);

  const addMarker = useCallback(({ id, location, color = '#8b5cf6', element }: MarkerOptions) => {
    if (!mapRef.current) return;

    // Remove existing marker with same id
    const existing = markersRef.current.get(id);
    if (existing) {
      existing.remove();
    }

    const marker = new mapboxgl.Marker({
      color: element ? undefined : color,
      element: element ?? undefined,
    })
      .setLngLat([location.longitude, location.latitude])
      .addTo(mapRef.current);

    markersRef.current.set(id, marker);
    return marker;
  }, []);

  const removeMarker = useCallback((id: string) => {
    const marker = markersRef.current.get(id);
    if (marker) {
      marker.remove();
      markersRef.current.delete(id);
    }
  }, []);

  const drawRoute = useCallback(({ id, coordinates, color = '#8b5cf6', dashArray, width = 3 }: RouteOptions) => {
    const map = mapRef.current;
    if (!map) return;

    const sourceId = `route-source-${id}`;
    const layerId = `route-layer-${id}`;

    // Remove existing layer/source
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }

    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paint: Record<string, any> = {
      'line-color': color,
      'line-width': width,
      'line-opacity': 0.8,
    };
    if (dashArray) {
      paint['line-dasharray'] = dashArray;
    }

    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint,
    });
  }, []);

  return { mapRef, flyTo, addMarker, removeMarker, drawRoute };
}
