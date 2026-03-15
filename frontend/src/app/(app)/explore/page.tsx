'use client';

import React, { useState, useRef, useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Star,
  Clock,
  Layers,
  ChevronRight,
  Compass,
  Sparkles,
  Globe,
  Camera,
  TrendingUp,
} from 'lucide-react';
import { MAPBOX_TOKEN, QUEST_CATEGORIES } from '@/lib/constants';
import type { QuestCategory } from '@/types';
import 'mapbox-gl/dist/mapbox-gl.css';

// ---------- Mock data ----------

interface FeaturedCity {
  name: string;
  country: string;
  lat: number;
  lng: number;
  questCount: number;
  imageGradient: string;
}

interface NearbyQuest {
  id: string;
  title: string;
  category: QuestCategory;
  difficulty: string;
  rating: number;
  duration: number;
  distance: string;
  stages: number;
  gradient: string;
}

const featuredCities: FeaturedCity[] = [
  { name: 'Barcelona', country: 'Spain', lat: 41.3874, lng: 2.1686, questCount: 42, imageGradient: 'from-orange-600/60 to-rose-600/60' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, questCount: 38, imageGradient: 'from-pink-600/60 to-violet-600/60' },
  { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, questCount: 55, imageGradient: 'from-slate-600/60 to-blue-600/60' },
  { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.006, questCount: 67, imageGradient: 'from-amber-600/60 to-emerald-600/60' },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, questCount: 49, imageGradient: 'from-indigo-600/60 to-cyan-600/60' },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, questCount: 36, imageGradient: 'from-red-600/60 to-amber-600/60' },
];

const nearbyQuests: NearbyQuest[] = [
  { id: '1', title: 'Gothic Quarter Secrets', category: 'mystery', difficulty: 'hard', rating: 4.8, duration: 90, distance: '0.5 km', stages: 6, gradient: 'from-slate-600/40 to-zinc-700/40' },
  { id: '2', title: 'La Boqueria Flavors', category: 'culinary', difficulty: 'easy', rating: 4.6, duration: 45, distance: '1.2 km', stages: 4, gradient: 'from-rose-600/40 to-pink-600/40' },
  { id: '3', title: 'Gaudi Architecture Walk', category: 'cultural', difficulty: 'medium', rating: 4.9, duration: 120, distance: '2.1 km', stages: 7, gradient: 'from-amber-600/40 to-orange-600/40' },
  { id: '4', title: 'Montjuic Trail', category: 'nature', difficulty: 'medium', rating: 4.4, duration: 75, distance: '3.5 km', stages: 5, gradient: 'from-emerald-600/40 to-teal-600/40' },
  { id: '5', title: 'Born District Adventure', category: 'adventure', difficulty: 'easy', rating: 4.3, duration: 50, distance: '0.8 km', stages: 4, gradient: 'from-violet-600/40 to-indigo-600/40' },
];

const popularDestinations = [
  { name: 'Sagrada Familia', quests: 12, gradient: 'from-amber-500/30 to-orange-500/30' },
  { name: 'Park Guell', quests: 8, gradient: 'from-emerald-500/30 to-teal-500/30' },
  { name: 'Las Ramblas', quests: 15, gradient: 'from-violet-500/30 to-indigo-500/30' },
  { name: 'Camp Nou', quests: 5, gradient: 'from-blue-500/30 to-cyan-500/30' },
  { name: 'Barceloneta Beach', quests: 9, gradient: 'from-rose-500/30 to-pink-500/30' },
  { name: 'El Raval', quests: 7, gradient: 'from-slate-500/30 to-zinc-500/30' },
];

const userPhotos = [
  { id: '1', user: 'Alex M.', city: 'Barcelona', gradient: 'from-violet-600/40 to-indigo-600/40' },
  { id: '2', user: 'Sara K.', city: 'Tokyo', gradient: 'from-pink-600/40 to-rose-600/40' },
  { id: '3', user: 'James R.', city: 'London', gradient: 'from-slate-600/40 to-blue-600/40' },
  { id: '4', user: 'Maria L.', city: 'Paris', gradient: 'from-amber-600/40 to-orange-600/40' },
];

const categoryLabels: Record<string, string> = {
  adventure: 'Adventure',
  mystery: 'Mystery',
  cultural: 'Cultural',
  educational: 'Educational',
  culinary: 'Culinary',
  nature: 'Nature',
  urban: 'Urban',
  team_building: 'Team',
};

// ---------- Component ----------

const ExplorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredQuests = useMemo(() => {
    return nearbyQuests.filter((q) => {
      const matchesSearch =
        !searchQuery || q.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || q.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Hero map section */}
      <div className="relative h-[50vh] min-h-[400px]">
        <Map
          initialViewState={{ longitude: 2.1686, latitude: 41.3874, zoom: 12, pitch: 45, bearing: -15 }}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          attributionControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" showCompass showZoom />

          {nearbyQuests.map((q, i) => (
            <Marker
              key={q.id}
              longitude={2.1686 + (i - 2) * 0.008}
              latitude={41.3874 + (i % 3 - 1) * 0.005}
              anchor="center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
                className="w-8 h-8 rounded-full bg-violet-500 border-2 border-violet-400 flex items-center justify-center shadow-lg shadow-violet-500/30 cursor-pointer"
              >
                <MapPin size={14} className="text-white" />
              </motion.div>
            </Marker>
          ))}
        </Map>

        {/* Overlay gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-navy-950 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy-950 to-transparent" />
        </div>

        {/* Floating search bar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quests, cities, or destinations..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400/30"
            />
          </motion.div>
        </div>

        {/* Category quick filters */}
        <div className="absolute bottom-8 left-0 right-0 z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-2 justify-center flex-wrap"
          >
            {QUEST_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={[
                  'px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer',
                  'backdrop-blur-xl border',
                  selectedCategory === cat
                    ? 'bg-violet-500/30 text-violet-300 border-violet-400/30'
                    : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/15 hover:text-white',
                ].join(' ')}
              >
                {categoryLabels[cat] || cat}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Content sections */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Nearby quests — horizontal scroll */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Compass size={20} className="text-violet-400" />
              <h2 className="text-lg font-bold text-white">Nearby Quests</h2>
            </div>
            <button className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors cursor-pointer">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {filteredQuests.map((quest, i) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex-shrink-0 w-72 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-violet-500/10 transition-all cursor-pointer group"
              >
                <div className={`h-28 bg-gradient-to-br ${quest.gradient} relative`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent)]" />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-sm text-[10px] font-medium text-white">
                    {quest.distance}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-navy-950/80 to-transparent" />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-violet-300 transition-colors">
                    {quest.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Star size={10} className="text-amber-400" /> {quest.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {quest.duration}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers size={10} /> {quest.stages}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured cities */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Globe size={20} className="text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Explore Cities</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredCities.map((city, i) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group cursor-pointer"
              >
                <div
                  className={`aspect-square rounded-2xl bg-gradient-to-br ${city.imageGradient} relative overflow-hidden border border-white/10 hover:border-white/20 transition-all hover:shadow-lg`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06),transparent)]" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <h3 className="text-sm font-bold text-white">{city.name}</h3>
                    <p className="text-[10px] text-slate-300">{city.country}</p>
                  </div>
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-white/15 backdrop-blur-sm text-[9px] font-medium text-white">
                    {city.questCount} quests
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Popular destinations grid */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-amber-400" />
            <h2 className="text-lg font-bold text-white">Popular Destinations</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {popularDestinations.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className={`rounded-xl bg-gradient-to-br ${dest.gradient} border border-white/10 p-4 hover:border-white/20 transition-all cursor-pointer group`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">
                      {dest.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{dest.quests} quests available</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-violet-400 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* User-submitted photos */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Camera size={20} className="text-rose-400" />
            <h2 className="text-lg font-bold text-white">Community Photos</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userPhotos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${photo.gradient} relative overflow-hidden border border-white/10 hover:border-white/20 transition-all cursor-pointer`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(255,255,255,0.06),transparent)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera size={32} className="text-white/20" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-xs font-medium text-white">{photo.user}</p>
                  <p className="text-[10px] text-slate-300">{photo.city}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Sparkles CTA */}
        <section className="text-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600/30 to-indigo-600/30 border border-violet-400/20 text-violet-300 text-sm font-medium cursor-pointer hover:from-violet-600/40 hover:to-indigo-600/40 transition-all"
          >
            <Sparkles size={16} />
            Discover more quests near you
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default ExplorePage;
