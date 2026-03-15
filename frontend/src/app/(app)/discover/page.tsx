'use client';

import { useState, useMemo, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Filter,
  Navigation,
  Star,
  Clock,
  Zap,
  Check,
  Lock,
  X,
  Compass,
  Search,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { MAPBOX_TOKEN, QUEST_CATEGORIES, QUEST_DIFFICULTIES } from '@/lib/constants';
import type { QuestCategory, QuestDifficulty } from '@/types';
import 'mapbox-gl/dist/mapbox-gl.css';

// ---------- Mock quest markers ----------

interface QuestMarker {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  lat: number;
  lng: number;
  points: number;
  duration: number;
  stages: number;
  rating: number;
  completions: number;
  status: 'completed' | 'available' | 'locked';
}

const mockQuests: QuestMarker[] = [
  { id: '1', title: 'The Lost Temple of Sol', description: 'Uncover ancient secrets hidden beneath the bustling streets', category: 'adventure', difficulty: 'hard', lat: 40.4168, lng: -3.7038, points: 850, duration: 90, stages: 5, rating: 4.8, completions: 342, status: 'available' },
  { id: '2', title: 'Culinary Secrets of La Latina', description: 'Discover hidden flavors and legendary recipes', category: 'culinary', difficulty: 'easy', lat: 40.4115, lng: -3.7120, points: 400, duration: 45, stages: 3, rating: 4.5, completions: 891, status: 'completed' },
  { id: '3', title: 'Mystery at the Prado', description: 'A priceless painting holds a coded message', category: 'mystery', difficulty: 'legendary', lat: 40.4138, lng: -3.6921, points: 1200, duration: 120, stages: 7, rating: 4.9, completions: 127, status: 'available' },
  { id: '4', title: 'Urban Explorer: Gran Via', description: 'Navigate the architectural wonders of the grand boulevard', category: 'urban', difficulty: 'medium', lat: 40.4200, lng: -3.7025, points: 600, duration: 60, stages: 4, rating: 4.3, completions: 564, status: 'available' },
  { id: '5', title: 'Retiro Park Treasures', description: 'A nature quest through the emerald heart of the city', category: 'nature', difficulty: 'easy', lat: 40.4153, lng: -3.6845, points: 350, duration: 40, stages: 3, rating: 4.6, completions: 1205, status: 'completed' },
  { id: '6', title: 'The Royal Palace Conspiracy', description: 'Shadows linger in the halls of power', category: 'mystery', difficulty: 'hard', lat: 40.4180, lng: -3.7142, points: 900, duration: 100, stages: 6, rating: 4.7, completions: 298, status: 'available' },
  { id: '7', title: 'Knowledge Quest: Complutense', description: 'Test your wits across the historic university', category: 'educational', difficulty: 'medium', lat: 40.4490, lng: -3.7267, points: 550, duration: 55, stages: 4, rating: 4.2, completions: 423, status: 'locked' },
  { id: '8', title: 'Team Rally: Salamanca District', description: 'Work together to solve puzzles across the elegant barrio', category: 'team_building', difficulty: 'medium', lat: 40.4290, lng: -3.6822, points: 700, duration: 75, stages: 5, rating: 4.4, completions: 187, status: 'available' },
  { id: '9', title: 'Cultural Tapestry of Lavapies', description: 'Immerse yourself in the most diverse neighborhood', category: 'cultural', difficulty: 'easy', lat: 40.4075, lng: -3.7010, points: 380, duration: 50, stages: 4, rating: 4.1, completions: 756, status: 'available' },
  { id: '10', title: 'Legendary Night Quest', description: 'Only the bravest dare explore the city after dark', category: 'adventure', difficulty: 'legendary', lat: 40.4230, lng: -3.7110, points: 1500, duration: 150, stages: 8, rating: 5.0, completions: 43, status: 'locked' },
];

// ---------- Helpers ----------

const statusColors = {
  completed: { marker: 'bg-emerald-500 border-emerald-400 shadow-emerald-500/40', glow: 'shadow-emerald-500/30' },
  available: { marker: 'bg-violet-500 border-violet-400 shadow-violet-500/40', glow: 'shadow-violet-500/30' },
  locked: { marker: 'bg-slate-600 border-slate-500 shadow-slate-500/20', glow: '' },
};

const difficultyColors: Record<QuestDifficulty, string> = {
  easy: 'bg-emerald-500/20 text-emerald-400',
  medium: 'bg-amber-500/20 text-amber-400',
  hard: 'bg-rose-500/20 text-rose-400',
  legendary: 'bg-violet-500/20 text-violet-400',
};

const categoryLabels: Record<string, string> = {
  adventure: 'Adventure',
  mystery: 'Mystery',
  cultural: 'Cultural',
  educational: 'Educational',
  culinary: 'Culinary',
  nature: 'Nature',
  urban: 'Urban',
  team_building: 'Team Building',
};

// ---------- Component ----------

export default function DiscoverPage() {
  const [selectedQuest, setSelectedQuest] = useState<QuestMarker | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<QuestCategory>>(new Set());
  const [selectedDifficulties, setSelectedDifficulties] = useState<Set<QuestDifficulty>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const filteredQuests = useMemo(() => {
    return mockQuests.filter(q => {
      if (selectedCategories.size > 0 && !selectedCategories.has(q.category)) return false;
      if (selectedDifficulties.size > 0 && !selectedDifficulties.has(q.difficulty)) return false;
      if (searchQuery && !q.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [selectedCategories, selectedDifficulties, searchQuery]);

  const toggleCategory = useCallback((cat: QuestCategory) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const toggleDifficulty = useCallback((diff: QuestDifficulty) => {
    setSelectedDifficulties(prev => {
      const next = new Set(prev);
      if (next.has(diff)) next.delete(diff);
      else next.add(diff);
      return next;
    });
  }, []);

  const handleLocateMe = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { /* permission denied - silently fail */ },
      );
    }
  }, []);

  const activeFilterCount = selectedCategories.size + selectedDifficulties.size;

  return (
    <div className="-m-4 md:-m-6 lg:-m-8 relative" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Full-screen map */}
      <Map
        initialViewState={{ longitude: -3.7038, latitude: 40.4168, zoom: 13, pitch: 45, bearing: -10 }}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" showCompass showZoom />

        {/* Quest markers */}
        {filteredQuests.map(quest => {
          const sc = statusColors[quest.status];
          return (
            <Marker
              key={quest.id}
              longitude={quest.lng}
              latitude={quest.lat}
              anchor="center"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedQuest(quest);
              }}
            >
              <div className="relative cursor-pointer group">
                {/* Pulse ring for available quests */}
                {quest.status === 'available' && (
                  <motion.div
                    className="absolute inset-[-5px] rounded-full bg-violet-500/25"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <motion.div
                  whileHover={{ scale: 1.3 }}
                  className={`relative w-10 h-10 rounded-full ${sc.marker} border-2 flex items-center justify-center shadow-lg z-10`}
                >
                  {quest.status === 'completed' ? (
                    <Check size={18} className="text-white" />
                  ) : quest.status === 'locked' ? (
                    <Lock size={14} className="text-slate-300" />
                  ) : (
                    <MapPin size={16} className="text-white" />
                  )}
                </motion.div>
                {/* Hover label */}
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <span className="text-[10px] font-medium text-white bg-navy-900/90 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">
                    {quest.title}
                  </span>
                </div>
              </div>
            </Marker>
          );
        })}

        {/* User location */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <div className="relative">
              <motion.div
                className="absolute inset-[-8px] rounded-full bg-cyan-500/20"
                animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="w-4 h-4 rounded-full bg-cyan-400 border-3 border-white shadow-lg shadow-cyan-500/50 z-10 relative" />
            </div>
          </Marker>
        )}

        {/* Quest popup */}
        <AnimatePresence>
          {selectedQuest && (
            <Popup
              longitude={selectedQuest.lng}
              latitude={selectedQuest.lat}
              anchor="bottom"
              onClose={() => setSelectedQuest(null)}
              closeButton={false}
              closeOnClick={false}
              offset={28}
              className="quest-discover-popup"
              maxWidth="320px"
            >
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="p-4 min-w-[280px]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${difficultyColors[selectedQuest.difficulty]}`}>
                        {selectedQuest.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {categoryLabels[selectedQuest.category]}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-sm text-navy-900 leading-tight">
                      {selectedQuest.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedQuest(null)}
                    className="text-slate-400 hover:text-slate-600 transition-colors ml-2"
                  >
                    <X size={14} />
                  </button>
                </div>

                <p className="text-xs text-slate-600 mb-3">{selectedQuest.description}</p>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center bg-slate-50 rounded-lg p-2">
                    <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
                      <Star size={10} fill="currentColor" />
                      <span className="text-xs font-bold">{selectedQuest.rating}</span>
                    </div>
                    <p className="text-[9px] text-slate-500">{selectedQuest.completions} plays</p>
                  </div>
                  <div className="text-center bg-slate-50 rounded-lg p-2">
                    <div className="flex items-center justify-center gap-1 text-violet-500 mb-0.5">
                      <Clock size={10} />
                      <span className="text-xs font-bold">{selectedQuest.duration}m</span>
                    </div>
                    <p className="text-[9px] text-slate-500">{selectedQuest.stages} stages</p>
                  </div>
                  <div className="text-center bg-slate-50 rounded-lg p-2">
                    <div className="flex items-center justify-center gap-1 text-emerald-500 mb-0.5">
                      <Zap size={10} />
                      <span className="text-xs font-bold">{selectedQuest.points}</span>
                    </div>
                    <p className="text-[9px] text-slate-500">points</p>
                  </div>
                </div>

                {selectedQuest.status === 'available' && (
                  <button className="w-full py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-colors shadow-sm">
                    Start Quest
                  </button>
                )}
                {selectedQuest.status === 'completed' && (
                  <div className="flex items-center justify-center gap-1.5 py-2 text-emerald-600 text-xs font-semibold">
                    <Check size={14} />
                    Completed
                  </div>
                )}
                {selectedQuest.status === 'locked' && (
                  <div className="flex items-center justify-center gap-1.5 py-2 text-slate-400 text-xs font-semibold">
                    <Lock size={14} />
                    Complete prerequisites to unlock
                  </div>
                )}
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </Map>

      {/* Top overlay controls */}
      <div className="absolute top-4 left-4 right-4 flex items-start gap-3 z-10 pointer-events-none">
        {/* Search bar */}
        <div className="pointer-events-auto flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search quests on the map..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-navy-900/90 backdrop-blur-xl border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm shadow-2xl"
            />
          </div>
        </div>

        {/* Filter button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilterOpen(!filterOpen)}
          className="pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-2xl bg-navy-900/90 backdrop-blur-xl border border-white/15 text-white text-sm font-medium shadow-2xl hover:bg-navy-800/90 transition-colors relative"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 right-4 z-20 w-72 glass rounded-2xl border border-white/15 p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-white text-sm">Filter Quests</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setSelectedCategories(new Set()); setSelectedDifficulties(new Set()); }}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="mb-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {QUEST_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                      selectedCategories.has(cat)
                        ? 'bg-violet-600 text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {categoryLabels[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Difficulty</p>
              <div className="flex flex-wrap gap-1.5">
                {QUEST_DIFFICULTIES.map(diff => (
                  <button
                    key={diff}
                    onClick={() => toggleDifficulty(diff)}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                      selectedDifficulties.has(diff)
                        ? 'bg-violet-600 text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-500">
              Showing {filteredQuests.length} of {mockQuests.length} quests
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <div className="absolute bottom-6 left-4 right-4 flex items-end justify-between z-10 pointer-events-none">
        {/* Quest near me */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLocateMe}
          className="pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold shadow-2xl shadow-violet-600/30"
        >
          <Navigation className="w-4 h-4" />
          Quests Near Me
        </motion.button>

        {/* Legend */}
        <div className="pointer-events-auto glass rounded-2xl border border-white/15 px-4 py-3 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-slate-400">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-violet-500" />
              <span className="text-[11px] text-slate-400">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-600" />
              <span className="text-[11px] text-slate-400">Locked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-navy-950/80 to-transparent pointer-events-none z-[5]" />
      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-navy-950/80 to-transparent pointer-events-none z-[5]" />
    </div>
  );
}
