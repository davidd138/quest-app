'use client';

import { useState, useEffect, useRef } from 'react';

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
  description: string;
  icon: string;
}

interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
}

const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// WMO Weather interpretation codes
// https://open-meteo.com/en/docs
const weatherCodeMap: Record<number, { description: string; dayIcon: string; nightIcon: string }> = {
  0: { description: 'Clear sky', dayIcon: 'sun', nightIcon: 'moon' },
  1: { description: 'Mainly clear', dayIcon: 'sun', nightIcon: 'moon' },
  2: { description: 'Partly cloudy', dayIcon: 'cloud-sun', nightIcon: 'cloud-moon' },
  3: { description: 'Overcast', dayIcon: 'cloud', nightIcon: 'cloud' },
  45: { description: 'Foggy', dayIcon: 'cloud-fog', nightIcon: 'cloud-fog' },
  48: { description: 'Depositing rime fog', dayIcon: 'cloud-fog', nightIcon: 'cloud-fog' },
  51: { description: 'Light drizzle', dayIcon: 'cloud-drizzle', nightIcon: 'cloud-drizzle' },
  53: { description: 'Moderate drizzle', dayIcon: 'cloud-drizzle', nightIcon: 'cloud-drizzle' },
  55: { description: 'Dense drizzle', dayIcon: 'cloud-drizzle', nightIcon: 'cloud-drizzle' },
  56: { description: 'Freezing drizzle', dayIcon: 'cloud-drizzle', nightIcon: 'cloud-drizzle' },
  57: { description: 'Dense freezing drizzle', dayIcon: 'cloud-drizzle', nightIcon: 'cloud-drizzle' },
  61: { description: 'Slight rain', dayIcon: 'cloud-rain', nightIcon: 'cloud-rain' },
  63: { description: 'Moderate rain', dayIcon: 'cloud-rain', nightIcon: 'cloud-rain' },
  65: { description: 'Heavy rain', dayIcon: 'cloud-rain', nightIcon: 'cloud-rain' },
  66: { description: 'Freezing rain', dayIcon: 'cloud-rain', nightIcon: 'cloud-rain' },
  67: { description: 'Heavy freezing rain', dayIcon: 'cloud-rain', nightIcon: 'cloud-rain' },
  71: { description: 'Slight snowfall', dayIcon: 'snowflake', nightIcon: 'snowflake' },
  73: { description: 'Moderate snowfall', dayIcon: 'snowflake', nightIcon: 'snowflake' },
  75: { description: 'Heavy snowfall', dayIcon: 'snowflake', nightIcon: 'snowflake' },
  77: { description: 'Snow grains', dayIcon: 'snowflake', nightIcon: 'snowflake' },
  80: { description: 'Slight rain showers', dayIcon: 'cloud-rain', nightIcon: 'cloud-rain' },
  81: { description: 'Moderate rain showers', dayIcon: 'cloud-rain', nightIcon: 'cloud-rain' },
  82: { description: 'Violent rain showers', dayIcon: 'cloud-rain', nightIcon: 'cloud-rain' },
  85: { description: 'Slight snow showers', dayIcon: 'snowflake', nightIcon: 'snowflake' },
  86: { description: 'Heavy snow showers', dayIcon: 'snowflake', nightIcon: 'snowflake' },
  95: { description: 'Thunderstorm', dayIcon: 'cloud-lightning', nightIcon: 'cloud-lightning' },
  96: { description: 'Thunderstorm with hail', dayIcon: 'cloud-lightning', nightIcon: 'cloud-lightning' },
  99: { description: 'Thunderstorm with heavy hail', dayIcon: 'cloud-lightning', nightIcon: 'cloud-lightning' },
};

function mapWeatherCode(code: number, isDay: boolean): { description: string; icon: string } {
  const entry = weatherCodeMap[code] ?? weatherCodeMap[0];
  return {
    description: entry.description,
    icon: isDay ? entry.dayIcon : entry.nightIcon,
  };
}

interface CacheEntry {
  data: WeatherData;
  timestamp: number;
  key: string;
}

let weatherCache: CacheEntry | null = null;

export function useWeather(lat: number, lng: number): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;

    // Check cache
    if (
      weatherCache &&
      weatherCache.key === cacheKey &&
      Date.now() - weatherCache.timestamp < CACHE_DURATION_MS
    ) {
      setWeather(weatherCache.data);
      setLoading(false);
      return;
    }

    // Abort previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,is_day`;

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const code = data.current.weather_code as number;
        const isDay = data.current.is_day === 1;
        const mapped = mapWeatherCode(code, isDay);

        const weatherData: WeatherData = {
          temperature: data.current.temperature_2m,
          weatherCode: code,
          isDay,
          description: mapped.description,
          icon: mapped.icon,
        };

        weatherCache = {
          data: weatherData,
          timestamp: Date.now(),
          key: cacheKey,
        };

        setWeather(weatherData);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Failed to fetch weather data');
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [lat, lng]);

  return { weather, loading, error };
}
