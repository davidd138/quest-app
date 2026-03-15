'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Trophy,
  Clock,
  Star,
  Zap,
  Search,
  Filter,
  ChevronDown,
  CheckCircle2,
  Play,
  Sparkles,
} from 'lucide-react';
import CollectionCard from '@/components/quest/CollectionCard';

// ---------- Types ----------

export interface CollectionQuest {
  id: string;
  title: string;
  thumbnailGradient: string;
  points: number;
  duration: number;
  completed: boolean;
}

export interface QuestCollection {
  id: string;
  title: string;
  description: string;
  gradient: string;
  coverImage?: string;
  quests: CollectionQuest[];
  totalPoints: number;
  estimatedTime: number;
  completedCount: number;
  category: string;
  featured?: boolean;
}

// ---------- Mock Data ----------

const mockCollections: QuestCollection[] = [
  {
    id: 'col-1',
    title: 'European Heritage Tour',
    description: 'Explore the rich history and architecture across Europe\'s most iconic cities. From Roman ruins to Gothic cathedrals.',
    gradient: 'from-amber-600 to-orange-500',
    quests: [
      { id: 'q1', title: 'Roman Forum Secrets', thumbnailGradient: 'from-amber-500 to-red-500', points: 500, duration: 45, completed: true },
      { id: 'q2', title: 'Gothic Barcelona', thumbnailGradient: 'from-violet-500 to-indigo-500', points: 600, duration: 60, completed: true },
      { id: 'q3', title: 'Parisian Mysteries', thumbnailGradient: 'from-blue-500 to-cyan-500', points: 750, duration: 75, completed: false },
      { id: 'q4', title: 'Vienna\'s Musical Ghosts', thumbnailGradient: 'from-rose-500 to-pink-500', points: 550, duration: 50, completed: false },
      { id: 'q5', title: 'Athens Eternal', thumbnailGradient: 'from-emerald-500 to-teal-500', points: 800, duration: 90, completed: false },
    ],
    totalPoints: 3200,
    estimatedTime: 320,
    completedCount: 2,
    category: 'cultural',
    featured: true,
  },
  {
    id: 'col-2',
    title: 'Asian Mysteries',
    description: 'Uncover ancient secrets from Tokyo to Bangkok. Temples, gardens, and hidden stories await.',
    gradient: 'from-rose-600 to-fuchsia-500',
    quests: [
      { id: 'q6', title: 'Tokyo Shrine Trail', thumbnailGradient: 'from-rose-500 to-red-500', points: 600, duration: 55, completed: false },
      { id: 'q7', title: 'Kyoto Garden Spirits', thumbnailGradient: 'from-emerald-500 to-green-500', points: 700, duration: 65, completed: false },
      { id: 'q8', title: 'Bangkok Temple Run', thumbnailGradient: 'from-amber-500 to-yellow-500', points: 500, duration: 50, completed: false },
      { id: 'q9', title: 'Bali Sacred Waters', thumbnailGradient: 'from-cyan-500 to-blue-500', points: 550, duration: 45, completed: false },
    ],
    totalPoints: 2350,
    estimatedTime: 215,
    completedCount: 0,
    category: 'mystery',
  },
  {
    id: 'col-3',
    title: 'Spanish Gastronomy Trail',
    description: 'A culinary adventure through Spain\'s finest food regions. Tapas, paella, and hidden flavors.',
    gradient: 'from-red-600 to-amber-500',
    quests: [
      { id: 'q10', title: 'Madrid Tapas Hunt', thumbnailGradient: 'from-red-500 to-orange-500', points: 400, duration: 40, completed: true },
      { id: 'q11', title: 'Basque Pintxos Trail', thumbnailGradient: 'from-emerald-500 to-lime-500', points: 450, duration: 45, completed: true },
      { id: 'q12', title: 'Valencia Paella Quest', thumbnailGradient: 'from-amber-500 to-yellow-500', points: 500, duration: 50, completed: true },
      { id: 'q13', title: 'Andalusian Olive Secrets', thumbnailGradient: 'from-green-500 to-emerald-500', points: 350, duration: 35, completed: true },
    ],
    totalPoints: 1700,
    estimatedTime: 170,
    completedCount: 4,
    category: 'culinary',
  },
  {
    id: 'col-4',
    title: 'Nature Explorer Pack',
    description: 'Connect with nature through immersive outdoor quests. Mountains, forests, coasts, and wildlife.',
    gradient: 'from-emerald-600 to-teal-500',
    quests: [
      { id: 'q14', title: 'Alpine Wilderness', thumbnailGradient: 'from-blue-500 to-indigo-500', points: 700, duration: 80, completed: true },
      { id: 'q15', title: 'Coastal Explorer', thumbnailGradient: 'from-cyan-500 to-sky-500', points: 500, duration: 55, completed: false },
      { id: 'q16', title: 'Forest Spirits', thumbnailGradient: 'from-emerald-500 to-green-500', points: 600, duration: 65, completed: false },
    ],
    totalPoints: 1800,
    estimatedTime: 200,
    completedCount: 1,
    category: 'nature',
  },
  {
    id: 'col-5',
    title: 'Master Negotiator Series',
    description: 'Sharpen your persuasion and negotiation skills with AI-powered characters in high-stakes scenarios.',
    gradient: 'from-violet-600 to-indigo-500',
    quests: [
      { id: 'q17', title: 'The Art of the Deal', thumbnailGradient: 'from-violet-500 to-purple-500', points: 800, duration: 70, completed: false },
      { id: 'q18', title: 'Diplomatic Crisis', thumbnailGradient: 'from-slate-500 to-gray-500', points: 900, duration: 85, completed: false },
      { id: 'q19', title: 'Merchant of Venice', thumbnailGradient: 'from-amber-500 to-orange-500', points: 750, duration: 65, completed: false },
      { id: 'q20', title: 'Startup Pitch', thumbnailGradient: 'from-cyan-500 to-blue-500', points: 600, duration: 50, completed: false },
      { id: 'q21', title: 'Royal Court Intrigue', thumbnailGradient: 'from-rose-500 to-pink-500', points: 1000, duration: 100, completed: false },
    ],
    totalPoints: 4050,
    estimatedTime: 370,
    completedCount: 0,
    category: 'educational',
    featured: true,
  },
  {
    id: 'col-6',
    title: 'Urban Photography Quest',
    description: 'Discover the city through a photographer\'s lens. Hidden spots, street art, and architectural wonders.',
    gradient: 'from-slate-600 to-zinc-500',
    quests: [
      { id: 'q22', title: 'Street Art Safari', thumbnailGradient: 'from-fuchsia-500 to-pink-500', points: 400, duration: 40, completed: true },
      { id: 'q23', title: 'Rooftop Views', thumbnailGradient: 'from-sky-500 to-blue-500', points: 450, duration: 45, completed: true },
      { id: 'q24', title: 'Night Lights', thumbnailGradient: 'from-indigo-500 to-violet-500', points: 550, duration: 55, completed: true },
    ],
    totalPoints: 1400,
    estimatedTime: 140,
    completedCount: 3,
    category: 'urban',
  },
];

const CATEGORIES = ['all', 'cultural', 'mystery', 'culinary', 'nature', 'educational', 'urban'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

// ---------- Component ----------

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);

  const filteredCollections = mockCollections.filter((col) => {
    if (selectedCategory !== 'all' && col.category !== selectedCategory) return false;
    if (!showCompleted && col.completedCount === col.quests.length) return false;
    if (searchQuery && !col.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalCollections = mockCollections.length;
  const completedCollections = mockCollections.filter(
    (c) => c.completedCount === c.quests.length,
  ).length;
  const totalQuestsCompleted = mockCollections.reduce((sum, c) => sum + c.completedCount, 0);
  const totalQuests = mockCollections.reduce((sum, c) => sum + c.quests.length, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-3xl font-bold text-white mb-2"
        >
          Colecciones de Quests
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 text-sm"
        >
          Aventuras curadas en playlists tematicas. Completa todas las quests de una coleccion para desbloquear insignias exclusivas.
        </motion.p>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Colecciones', value: totalCollections, icon: BookOpen, color: 'text-violet-400' },
          { label: 'Completadas', value: completedCollections, icon: Trophy, color: 'text-emerald-400' },
          { label: 'Quests hechas', value: `${totalQuestsCompleted}/${totalQuests}`, icon: CheckCircle2, color: 'text-amber-400' },
          { label: 'En progreso', value: mockCollections.filter((c) => c.completedCount > 0 && c.completedCount < c.quests.length).length, icon: Play, color: 'text-cyan-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar colecciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/25 transition-all text-sm"
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat === 'all' ? 'Todas' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Toggle completed */}
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
            showCompleted
              ? 'bg-white/5 text-slate-400 hover:text-white'
              : 'bg-emerald-500/20 text-emerald-400'
          }`}
        >
          <CheckCircle2 size={14} />
          {showCompleted ? 'Ocultar completadas' : 'Mostrar completadas'}
        </button>
      </motion.div>

      {/* Featured Section */}
      {filteredCollections.some((c) => c.featured) && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Destacadas</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCollections
              .filter((c) => c.featured)
              .map((collection) => (
                <CollectionCard key={collection.id} collection={collection} featured />
              ))}
          </div>
        </div>
      )}

      {/* All Collections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Todas las colecciones
          </h2>
          <span className="text-xs text-slate-500">
            {filteredCollections.length} coleccion{filteredCollections.length !== 1 ? 'es' : ''}
          </span>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </motion.div>

        {filteredCollections.length === 0 && (
          <div className="text-center py-16">
            <BookOpen size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">No se encontraron colecciones con esos filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
