'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Navigation,
  Filter,
  Play,
  MapPin,
  Clock,
  Zap,
  Compass,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@/hooks/useGraphQL';
import { LIST_QUESTS } from '@/lib/graphql/queries';
import {
  MAPBOX_TOKEN,
  QUEST_CATEGORIES,
  QUEST_DIFFICULTIES,
} from '@/lib/constants';
import { haversineDistance, formatDistance, estimateWalkTime } from '@/lib/geo';
import type { Quest, QuestConnection, QuestCategory } from '@/types';

// Category marker colours
const CATEGORY_COLORS: Record<string, string> = {
  adventure: '#8b5cf6',
  mystery: '#64748b',
  cultural: '#f59e0b',
  educational: '#3b82f6',
  culinary: '#ef4444',
  nature: '#10b981',
  urban: '#6366f1',
  team_building: '#ec4899',
};

interface QuestPopup {
  quest: Quest;
  x: number;
  y: number;
}

export default function QuestMapPage() {
  const { data, loading, execute } = useQuery<QuestConnection>(LIST_QUESTS);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    execute({ limit: 200 });
  }, [execute]);

  // Try to get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          /* silently ignore */
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 },
      );
    }
  }, []);

  const filteredQuests = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((q) => {
      if (categoryFilter && q.category !== categoryFilter) return false;
      if (difficultyFilter && q.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [data, categoryFilter, difficultyFilter]);

  // Group nearby quests into clusters (simple grid-based clustering)
  const clusters = useMemo(() => {
    if (filteredQuests.length === 0) return [];
    // For simplicity, return individual markers for now
    // A production implementation would use supercluster or similar
    return filteredQuests.map((quest) => ({
      id: quest.id,
      quest,
      count: 1,
      lat: quest.location.latitude,
      lng: quest.location.longitude,
    }));
  }, [filteredQuests]);

  const handleMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          /* ignore */
        },
      );
    }
  }, []);

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 bg-navy-900"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
          </div>
        ) : (
          /* Map with markers (visual representation) */
          <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
            {/* Grid lines for visual map effect */}
            <div className="absolute inset-0 opacity-5">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Quest markers */}
            {clusters.map((cluster) => {
              const color = CATEGORY_COLORS[cluster.quest.category] || '#8b5cf6';
              // Position markers in a grid layout for the static representation
              const hashX = ((cluster.lat * 1000) % 80) + 10;
              const hashY = ((cluster.lng * 1000) % 80) + 10;

              return (
                <button
                  key={cluster.id}
                  type="button"
                  onClick={() => setSelectedQuest(cluster.quest)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{
                    left: `${hashX}%`,
                    top: `${hashY}%`,
                  }}
                  aria-label={`Quest: ${cluster.quest.title}`}
                >
                  {cluster.count > 1 ? (
                    /* Cluster marker */
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                      style={{ backgroundColor: color }}
                    >
                      {cluster.count}
                    </div>
                  ) : (
                    /* Single marker */
                    <div className="relative">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all group-hover:scale-110"
                        style={{ backgroundColor: color }}
                      >
                        <MapPin size={14} className="text-white" />
                      </div>
                      {/* Pulse */}
                      <div
                        className="absolute inset-0 rounded-full animate-ping opacity-20"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  )}
                </button>
              );
            })}

            {/* User location marker */}
            {userPosition && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ left: '50%', top: '50%' }}
              >
                <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-500/30 shadow-lg" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter panel overlay */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-4 left-4 z-30 w-72 glass rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold text-white">Filtros</h3>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">
                Categoría
              </label>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none w-full pl-3 pr-8 py-2 rounded-xl bg-navy-800/60 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                >
                  <option value="">Todas</option>
                  {QUEST_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">
                Dificultad
              </label>
              <div className="relative">
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="appearance-none w-full pl-3 pr-8 py-2 rounded-xl bg-navy-800/60 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                >
                  <option value="">Todas</option>
                  {QUEST_DIFFICULTIES.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Category legend */}
            <div>
              <label className="text-xs text-slate-400 font-medium mb-2 block">Leyenda</label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                  <div key={cat} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] text-slate-400 capitalize truncate">
                      {cat.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {(categoryFilter || difficultyFilter) && (
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('');
                  setDifficultyFilter('');
                }}
                className="w-full py-2 rounded-xl bg-navy-800/60 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        {/* Filter toggle */}
        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors ${
            showFilters
              ? 'bg-violet-600 text-white'
              : 'glass text-slate-300 hover:text-white'
          }`}
          aria-label="Toggle filters"
        >
          <Filter size={18} />
        </button>

        {/* My location */}
        <button
          type="button"
          onClick={handleMyLocation}
          className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-300 hover:text-white shadow-lg transition-colors"
          aria-label="My location"
        >
          <Navigation size={18} />
        </button>
      </div>

      {/* Quest count badge */}
      <div className="absolute bottom-4 left-4 z-30">
        <div className="glass rounded-xl px-4 py-2 text-sm text-slate-300">
          <span className="font-semibold text-white">{filteredQuests.length}</span>{' '}
          aventura{filteredQuests.length !== 1 ? 's' : ''} en el mapa
        </div>
      </div>

      {/* Quest popup card */}
      <AnimatePresence>
        {selectedQuest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 right-4 z-30 w-80 glass rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div
              className="h-24 relative"
              style={{
                background: `linear-gradient(135deg, ${CATEGORY_COLORS[selectedQuest.category] || '#8b5cf6'}40, transparent)`,
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedQuest(null)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-navy-900/60 text-slate-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-3 left-4">
                <span className="text-xs px-2 py-0.5 rounded-lg bg-navy-900/60 text-slate-300 capitalize">
                  {selectedQuest.category.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-heading text-base font-semibold text-white line-clamp-1">
                  {selectedQuest.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {selectedQuest.description}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Zap size={12} className="text-violet-400" />
                  {selectedQuest.totalPoints} pts
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-emerald-400" />
                  {selectedQuest.estimatedDuration} min
                </span>
                <span className="flex items-center gap-1">
                  <Compass size={12} className="text-amber-400" />
                  {selectedQuest.stages?.length || 0} etapas
                </span>
              </div>

              {/* Distance from user */}
              {userPosition && (
                <div className="text-xs text-slate-400">
                  <MapPin size={12} className="inline mr-1 text-violet-400" />
                  A {formatDistance(
                    haversineDistance(
                      userPosition.lat,
                      userPosition.lng,
                      selectedQuest.location.latitude,
                      selectedQuest.location.longitude,
                    ),
                  )}{' '}
                  de ti ({estimateWalkTime(
                    haversineDistance(
                      userPosition.lat,
                      userPosition.lng,
                      selectedQuest.location.latitude,
                      selectedQuest.location.longitude,
                    ),
                  )} andando)
                </div>
              )}

              {/* Start quest button */}
              <Link
                href={`/quests/${selectedQuest.id}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
              >
                <Play size={14} />
                Comenzar aventura
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
