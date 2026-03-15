'use client';

import { useState, useCallback, useRef } from 'react';

interface GeolocationPosition {
  lat: number;
  lng: number;
}

interface UseGeolocationReturn {
  position: GeolocationPosition | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
}

const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheTimestamp = useRef<number>(0);

  const requestLocation = useCallback(() => {
    // Return cached position if still fresh
    if (position && Date.now() - cacheTimestamp.current < CACHE_DURATION_MS) {
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(newPosition);
        cacheTimestamp.current = Date.now();
        setLoading(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access in your browser settings.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An unknown error occurred while getting your location.');
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: CACHE_DURATION_MS,
      }
    );
  }, [position]);

  return { position, loading, error, requestLocation };
}
