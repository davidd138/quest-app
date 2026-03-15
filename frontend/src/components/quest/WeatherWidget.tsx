'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Thermometer,
  MapPin,
  Compass,
  TreePine,
  BookOpen,
  Flashlight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import type { WeatherData } from '@/hooks/useWeather';

// ---------- Types ----------

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  className?: string;
}

// ---------- Icon Mapping ----------

const weatherIcons: Record<string, React.ElementType> = {
  sun: Sun,
  moon: Moon,
  cloud: Cloud,
  'cloud-sun': Cloud,
  'cloud-moon': Cloud,
  'cloud-rain': CloudRain,
  'cloud-drizzle': CloudDrizzle,
  'cloud-fog': CloudFog,
  snowflake: CloudSnow,
  'cloud-lightning': CloudLightning,
};

// ---------- Suggestions ----------

interface QuestSuggestion {
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
}

function getSuggestions(weather: WeatherData): QuestSuggestion[] {
  const { weatherCode, isDay, temperature } = weather;
  const isRainy = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode);
  const isSnowy = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isStormy = [95, 96, 99].includes(weatherCode);
  const isCold = temperature < 10;

  if (!isDay) {
    return [
      {
        title: 'Night Mystery Quests',
        description: 'The city reveals its secrets under moonlight. Try our night mystery quests!',
        icon: Flashlight,
        gradient: 'from-indigo-600/30 to-violet-600/30',
      },
    ];
  }

  if (isRainy || isStormy) {
    return [
      {
        title: 'Indoor Mystery Quests',
        description: 'Perfect weather for solving indoor mysteries and cultural discoveries!',
        icon: BookOpen,
        gradient: 'from-blue-600/30 to-cyan-600/30',
      },
    ];
  }

  if (isSnowy || isCold) {
    return [
      {
        title: 'Cultural Warm-Up Quests',
        description: 'Warm up with a cultural quest in museums, cafes, and historic spots!',
        icon: BookOpen,
        gradient: 'from-amber-600/30 to-orange-600/30',
      },
    ];
  }

  return [
    {
      title: 'Nature Exploration',
      description: 'Great day for nature and urban exploration quests!',
      icon: TreePine,
      gradient: 'from-emerald-600/30 to-teal-600/30',
    },
    {
      title: 'Urban Adventure',
      description: 'Perfect weather to discover hidden gems in the city!',
      icon: Compass,
      gradient: 'from-violet-600/30 to-fuchsia-600/30',
    },
  ];
}

// ---------- Animated Weather Icon ----------

function AnimatedWeatherIcon({ iconName, size = 40 }: { iconName: string; size?: number }) {
  const Icon = weatherIcons[iconName] ?? Sun;

  if (iconName === 'sun') {
    return (
      <div className="relative" style={{ width: size + 16, height: size + 16 }}>
        {/* Sun rays */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
              className="absolute w-0.5 h-4 bg-yellow-400/40 rounded-full origin-center"
              style={{
                transform: `rotate(${i * 45}deg) translateY(-${size / 2 + 4}px)`,
              }}
            />
          ))}
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Icon size={size} className="text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]" />
        </motion.div>
      </div>
    );
  }

  if (iconName === 'moon') {
    return (
      <div className="relative" style={{ width: size + 16, height: size + 16 }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-indigo-400/10 blur-md"
        />
        <motion.div
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Icon size={size} className="text-indigo-300 drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]" />
        </motion.div>
        {/* Stars */}
        {[
          { x: '15%', y: '20%', delay: 0 },
          { x: '75%', y: '15%', delay: 1 },
          { x: '80%', y: '70%', delay: 0.5 },
        ].map((star, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: star.delay }}
            className="absolute w-1 h-1 rounded-full bg-indigo-200"
            style={{ left: star.x, top: star.y }}
          />
        ))}
      </div>
    );
  }

  if (iconName.includes('rain') || iconName.includes('drizzle')) {
    return (
      <div className="relative" style={{ width: size + 16, height: size + 16 }}>
        <motion.div
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Icon size={size} className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]" />
        </motion.div>
        {/* Rain drops */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: size * 0.6, opacity: 0 }}
            animate={{ y: size + 12, opacity: [0, 0.6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
            className="absolute w-0.5 h-2 bg-blue-400/50 rounded-full"
            style={{ left: `${20 + i * 12}%` }}
          />
        ))}
      </div>
    );
  }

  if (iconName === 'snowflake') {
    return (
      <div className="relative" style={{ width: size + 16, height: size + 16 }}>
        <motion.div
          animate={{ rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Icon size={size} className="text-sky-300 drop-shadow-[0_0_8px_rgba(125,211,252,0.4)]" />
        </motion.div>
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: size * 0.5, opacity: 0 }}
            animate={{
              y: size + 10,
              x: [0, (i % 2 === 0 ? 5 : -5)],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-sky-200/40"
            style={{ left: `${15 + i * 15}%` }}
          />
        ))}
      </div>
    );
  }

  if (iconName === 'cloud-lightning') {
    return (
      <div className="relative" style={{ width: size + 16, height: size + 16 }}>
        <motion.div
          animate={{ y: [-1, 1, -1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Icon size={size} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]" />
        </motion.div>
        <motion.div
          animate={{ opacity: [0, 1, 0, 0, 0, 1, 0, 0, 0, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-lg bg-yellow-400/10"
        />
      </div>
    );
  }

  // Default cloud/fog
  return (
    <motion.div
      animate={{ x: [-3, 3, -3], y: [-1, 1, -1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: size + 16, height: size + 16 }}
      className="flex items-center justify-center"
    >
      <Icon size={size} className="text-slate-400 drop-shadow-[0_0_8px_rgba(148,163,184,0.3)]" />
    </motion.div>
  );
}

// ---------- Main Component ----------

export default function WeatherWidget({ latitude, longitude, className = '' }: WeatherWidgetProps) {
  const { weather, loading, error } = useWeather(latitude, longitude);

  if (loading) {
    return (
      <div className={`glass rounded-2xl border border-white/10 p-6 ${className}`}>
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
          <span className="text-sm text-slate-400">Loading weather data...</span>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={`glass rounded-2xl border border-white/10 p-6 ${className}`}>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <AlertCircle size={16} />
          <span>{error || 'Unable to load weather data'}</span>
        </div>
      </div>
    );
  }

  const suggestions = getSuggestions(weather);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`glass rounded-2xl border border-white/10 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-4">
          <AnimatedWeatherIcon iconName={weather.icon} size={36} />

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <Thermometer size={14} className="text-slate-500" />
              <span className="text-2xl font-bold text-white">
                {Math.round(weather.temperature)}°C
              </span>
            </div>
            <p className="text-sm text-slate-400">{weather.description}</p>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-600">
            <MapPin size={10} />
            <span>{latitude.toFixed(1)}, {longitude.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="border-t border-white/5 p-4">
        <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold mb-3">
          Suggested for this weather
        </p>

        <AnimatePresence>
          <div className="space-y-2.5">
            {suggestions.map((suggestion, i) => {
              const SugIcon = suggestion.icon;
              return (
                <motion.div
                  key={suggestion.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl cursor-pointer
                    bg-gradient-to-r ${suggestion.gradient}
                    border border-white/5 hover:border-white/10
                    transition-colors
                  `}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <SugIcon size={18} className="text-white/70" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{suggestion.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">{suggestion.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
