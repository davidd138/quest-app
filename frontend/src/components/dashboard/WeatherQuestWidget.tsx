'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CloudSun,
  Thermometer,
  MapPin,
  Compass,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useWeather } from '@/hooks/useWeather';
import { useGeolocation } from '@/hooks/useGeolocation';
import DashboardWidget from './DashboardWidget';

// ---------- Quest recommendations based on weather ----------

interface QuestRecommendation {
  type: string;
  label: string;
  description: string;
  gradient: string;
}

function getRecommendation(weatherCode: number, temp: number, isDay: boolean): QuestRecommendation {
  const isRainy = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode);
  const isStormy = [95, 96, 99].includes(weatherCode);
  const isSnowy = [71, 73, 75, 77, 85, 86].includes(weatherCode);

  if (!isDay) {
    return {
      type: 'mystery',
      label: 'Night Mysteries',
      description: 'Perfect night for spooky quests and hidden secrets',
      gradient: 'from-indigo-500/20 to-violet-600/20',
    };
  }

  if (isStormy || isRainy) {
    return {
      type: 'cultural',
      label: 'Indoor Adventures',
      description: 'Rainy day? Explore museums and indoor treasures',
      gradient: 'from-blue-500/20 to-cyan-600/20',
    };
  }

  if (isSnowy || temp < 5) {
    return {
      type: 'culinary',
      label: 'Culinary Quest',
      description: 'Warm up with a food and cafe discovery quest',
      gradient: 'from-amber-500/20 to-orange-600/20',
    };
  }

  if (temp > 30) {
    return {
      type: 'urban',
      label: 'Shaded Paths',
      description: 'Stay cool with quests through parks and shaded areas',
      gradient: 'from-emerald-500/20 to-teal-600/20',
    };
  }

  return {
    type: 'adventure',
    label: 'Outdoor Exploration',
    description: 'Great weather for an adventure quest!',
    gradient: 'from-violet-500/20 to-fuchsia-600/20',
  };
}

// ---------- Component ----------

export default function WeatherQuestWidget() {
  const { position, loading: geoLoading, requestLocation } = useGeolocation();
  const { weather, loading: weatherLoading } = useWeather(
    position?.lat ?? 0,
    position?.lng ?? 0
  );

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const loading = geoLoading || (position && weatherLoading);

  if (!position && !geoLoading) {
    return (
      <DashboardWidget title="Weather & Quests" draggable>
        <button
          onClick={requestLocation}
          className="flex items-center gap-3 text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          Enable location for weather-based quest suggestions
        </button>
      </DashboardWidget>
    );
  }

  if (loading) {
    return (
      <DashboardWidget title="Weather & Quests" draggable>
        <div className="flex items-center justify-center gap-3 py-6">
          <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
          <span className="text-sm text-slate-400">Loading weather...</span>
        </div>
      </DashboardWidget>
    );
  }

  if (!weather) {
    return (
      <DashboardWidget title="Weather & Quests" draggable>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <AlertCircle className="w-4 h-4" />
          <span>Weather data unavailable</span>
        </div>
      </DashboardWidget>
    );
  }

  const recommendation = getRecommendation(weather.weatherCode, weather.temperature, weather.isDay);

  return (
    <DashboardWidget title="Weather & Quests" onRefresh={requestLocation} draggable>
      {/* Current weather */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 flex items-center justify-center">
          <CloudSun className="w-7 h-7 text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-slate-500" />
            <span className="text-2xl font-bold text-white">
              {Math.round(weather.temperature)}&deg;C
            </span>
          </div>
          <p className="text-sm text-slate-400">{weather.description}</p>
        </div>
        {position && (
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <MapPin className="w-3 h-3" />
            <span>
              {position.lat.toFixed(1)}, {position.lng.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Recommendation */}
      <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold mb-2">
        Perfect weather for...
      </p>

      <Link href={`/quests?category=${recommendation.type}`}>
        <motion.div
          whileHover={{ scale: 1.02, x: 4 }}
          className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${recommendation.gradient} border border-white/5 hover:border-white/10 cursor-pointer transition-colors`}
        >
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <Compass className="w-5 h-5 text-white/70" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{recommendation.label}</p>
            <p className="text-xs text-slate-400 line-clamp-1">{recommendation.description}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </motion.div>
      </Link>
    </DashboardWidget>
  );
}
