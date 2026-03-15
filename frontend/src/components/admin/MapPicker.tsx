'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Map, { Marker, type MapRef, type MapMouseEvent } from 'react-map-gl';
import { Search, MapPin } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface MapPickerLocation {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
}

interface MapPickerProps {
  value?: MapPickerLocation;
  onChange: (location: MapPickerLocation) => void;
  mapboxToken?: string;
  className?: string;
}

const DEFAULT_CENTER = { latitude: 48.8566, longitude: 2.3522 }; // Paris

const MapPicker: React.FC<MapPickerProps> = ({
  value,
  onChange,
  mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '',
  className = '',
}) => {
  const mapRef = useRef<MapRef>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    value ? { lat: value.latitude, lng: value.longitude } : null,
  );
  const [viewport, setViewport] = useState({
    latitude: value?.latitude ?? DEFAULT_CENTER.latitude,
    longitude: value?.longitude ?? DEFAULT_CENTER.longitude,
    zoom: 13,
  });

  // Sync external value changes
  useEffect(() => {
    if (value && (value.latitude !== 0 || value.longitude !== 0)) {
      setMarker({ lat: value.latitude, lng: value.longitude });
      setViewport((prev) => ({
        ...prev,
        latitude: value.latitude,
        longitude: value.longitude,
      }));
    }
  }, [value]);

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      const { lngLat } = event;
      const newMarker = { lat: lngLat.lat, lng: lngLat.lng };
      setMarker(newMarker);
      onChange({
        latitude: lngLat.lat,
        longitude: lngLat.lng,
        name: value?.name ?? '',
        address: value?.address,
      });
    },
    [onChange, value],
  );

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !mapboxToken) return;
    setSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery,
        )}.json?access_token=${mapboxToken}&limit=1`,
      );
      const data = await response.json();
      if (data.features?.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        const placeName = feature.place_name ?? searchQuery;

        setMarker({ lat, lng });
        setViewport((prev) => ({ ...prev, latitude: lat, longitude: lng, zoom: 15 }));
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 15 });

        onChange({
          latitude: lat,
          longitude: lng,
          name: feature.text ?? '',
          address: placeName,
        });
      }
    } catch {
      // Silently fail on search errors
    } finally {
      setSearching(false);
    }
  }, [searchQuery, mapboxToken, onChange]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div
      className={`rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden ${className}`}
    >
      {/* Search bar */}
      <div className="p-3 border-b border-white/10 flex gap-2">
        <div className="flex-1">
          <Input
            variant="search"
            placeholder="Search for an address..."
            leftIcon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSearch}
          loading={searching}
        >
          Search
        </Button>
      </div>

      {/* Map */}
      <div className="h-80 relative">
        {mapboxToken ? (
          <Map
            ref={mapRef}
            {...viewport}
            onMove={(evt) => setViewport(evt.viewState)}
            onClick={handleMapClick}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={mapboxToken}
            style={{ width: '100%', height: '100%' }}
          >
            {marker && (
              <Marker
                latitude={marker.lat}
                longitude={marker.lng}
                draggable
                onDragEnd={(event) => {
                  const { lngLat } = event;
                  setMarker({ lat: lngLat.lat, lng: lngLat.lng });
                  onChange({
                    latitude: lngLat.lat,
                    longitude: lngLat.lng,
                    name: value?.name ?? '',
                    address: value?.address,
                  });
                }}
              >
                <div className="text-violet-400 animate-bounce">
                  <MapPin size={28} fill="currentColor" />
                </div>
              </Marker>
            )}
          </Map>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Set NEXT_PUBLIC_MAPBOX_TOKEN to enable map
          </div>
        )}
      </div>

      {/* Coordinates display */}
      {marker && (
        <div className="p-3 border-t border-white/10 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-violet-400" />
            {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
          </span>
          {value?.name && (
            <span className="text-slate-300">{value.name}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default MapPicker;
