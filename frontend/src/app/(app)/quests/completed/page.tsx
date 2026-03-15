'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Trophy,
  Clock,
  Star,
  Zap,
  Calendar,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Share2,
  ChevronDown,
  Compass,
  Award,
  TrendingUp,
} from 'lucide-react';
import type { QuestCategory, QuestDifficulty } from '@/types';
import CompletionCertificate from '@/components/quest/CompletionCertificate';

// ---------- Types ----------

interface CompletedQuestEntry {
  id: string;
  questId: string;
  questTitle: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  score: number;
  maxScore: number;
  completedAt: string;
  duration: number; // minutes
  stagesCompleted: number;
  totalStages: number;
}

type SortOption = 'date' | 'score' | 'duration';

// ---------- Mock data ----------

const mockCompleted: CompletedQuestEntry[] = [
  { id: 'c1', questId: 'q1', questTitle: 'Sombras del Coliseo', category: 'mystery', difficulty: 'hard', score: 920, maxScore: 1000, completedAt: '2026-03-14T15:30:00Z', duration: 87, stagesCompleted: 5, totalStages: 5 },
  { id: 'c2', questId: 'q2', questTitle: 'Jardines Susurrantes', category: 'nature', difficulty: 'easy', score: 380, maxScore: 400, completedAt: '2026-03-12T10:00:00Z', duration: 32, stagesCompleted: 3, totalStages: 3 },
  { id: 'c3', questId: 'q3', questTitle: 'Safari de Arte Urbano', category: 'cultural', difficulty: 'medium', score: 480, maxScore: 600, completedAt: '2026-03-10T18:45:00Z', duration: 51, stagesCompleted: 4, totalStages: 4 },
  { id: 'c4', questId: 'q4', questTitle: 'Expreso de Medianoche', category: 'adventure', difficulty: 'hard', score: 850, maxScore: 900, completedAt: '2026-03-08T22:00:00Z', duration: 78, stagesCompleted: 5, totalStages: 5 },
  { id: 'c5', questId: 'q5', questTitle: 'Sabor de la Tradicion', category: 'culinary', difficulty: 'easy', score: 420, maxScore: 420, completedAt: '2026-03-05T13:20:00Z', duration: 45, stagesCompleted: 3, totalStages: 3 },
  { id: 'c6', questId: 'q6', questTitle: 'El Ultimo Alquimista', category: 'educational', difficulty: 'legendary', score: 1500, maxScore: 1500, completedAt: '2026-03-01T20:10:00Z', duration: 135, stagesCompleted: 7, totalStages: 7 },
];

// ---------- Helpers ----------

const difficultyColors: Record<QuestDifficulty, string> = {
  easy: 'bg-emerald-500/20 text-emerald-400',
  medium: 'bg-amber-500/20 text-amber-400',
  hard: 'bg-rose-500/20 text-rose-400',
  legendary: 'bg-violet-500/20 text-violet-400',
};

const difficultyLabels: Record<QuestDifficulty, string> = {
  easy: 'Facil',
  medium: 'Media',
  hard: 'Dificil',
  legendary: 'Legendaria',
};

const categoryLabels: Record<QuestCategory, string> = {
  adventure: 'Aventura',
  mystery: 'Misterio',
  cultural: 'Cultural',
  educational: 'Educativa',
  culinary: 'Culinaria',
  nature: 'Naturaleza',
  urban: 'Urbana',
  team_building: 'Equipo',
};

const categoryGradients: Record<QuestCategory, string> = {
  adventure: 'from-violet-600/40 to-indigo-600/30',
  mystery: 'from-slate-600/40 to-zinc-700/30',
  cultural: 'from-amber-600/40 to-orange-600/30',
  culinary: 'from-rose-600/40 to-pink-600/30',
  nature: 'from-emerald-600/40 to-teal-600/30',
  educational: 'from-blue-600/40 to-cyan-600/30',
  urban: 'from-gray-600/40 to-neutral-600/30',
  team_building: 'from-fuchsia-600/40 to-purple-600/30',
};

function getScoreTier(score: number, maxScore: number): 'gold' | 'silver' | 'bronze' {
  const pct = (score / maxScore) * 100;
  if (pct >= 95) return 'gold';
  if (pct >= 75) return 'silver';
  return 'bronze';
}

const tierColors = {
  gold: 'text-amber-400',
  silver: 'text-slate-300',
  bronze: 'text-orange-400',
};

const tierBorders = {
  gold: 'border-amber-500/30',
  silver: 'border-slate-400/20',
  bronze: 'border-orange-500/20',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ---------- Page ----------

export default function CompletedQuestsPage() {
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterCategory, setFilterCategory] = useState<QuestCategory | 'all'>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<CompletedQuestEntry | null>(null);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const filteredAndSorted = useMemo(() => {
    let items = [...mockCompleted];

    if (filterCategory !== 'all') {
      items = items.filter((q) => q.category === filterCategory);
    }

    switch (sortBy) {
      case 'date':
        items.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        break;
      case 'score':
        items.sort((a, b) => b.score - a.score);
        break;
      case 'duration':
        items.sort((a, b) => a.duration - b.duration);
        break;
    }

    return items;
  }, [sortBy, filterCategory]);

  // Stats
  const totalPoints = mockCompleted.reduce((sum, q) => sum + q.score, 0);
  const avgScore = Math.round(totalPoints / mockCompleted.length);
  const totalTime = mockCompleted.reduce((sum, q) => sum + q.duration, 0);
  const perfectScores = mockCompleted.filter((q) => q.score === q.maxScore).length;

  const sortLabels: Record<SortOption, string> = {
    date: 'Fecha',
    score: 'Puntuacion',
    duration: 'Duracion',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-1">
            Aventuras Completadas
          </h1>
          <p className="text-slate-400">
            Tu galeria de logros y aventuras conquistadas
          </p>
        </div>
      </motion.div>

      {/* Stats header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="glass rounded-2xl border border-white/10 p-4 text-center">
          <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-heading font-bold text-white">{mockCompleted.length}</p>
          <p className="text-xs text-slate-500">Completadas</p>
        </div>
        <div className="glass rounded-2xl border border-white/10 p-4 text-center">
          <Zap className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-heading font-bold text-emerald-400">{totalPoints.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Puntos totales</p>
        </div>
        <div className="glass rounded-2xl border border-white/10 p-4 text-center">
          <TrendingUp className="w-6 h-6 text-violet-400 mx-auto mb-2" />
          <p className="text-2xl font-heading font-bold text-violet-400">{avgScore}</p>
          <p className="text-xs text-slate-500">Puntuacion media</p>
        </div>
        <div className="glass rounded-2xl border border-white/10 p-4 text-center">
          <Star className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-heading font-bold text-amber-400">{perfectScores}</p>
          <p className="text-xs text-slate-500">Puntuaciones perfectas</p>
        </div>
      </motion.div>

      {/* Filters and sort */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-3 flex-wrap"
      >
        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => { setSortDropdownOpen(!sortDropdownOpen); setFilterDropdownOpen(false); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-sm text-slate-300 hover:text-white hover:border-white/20 transition-all"
          >
            <ArrowUpDown size={14} />
            <span>Ordenar: {sortLabels[sortBy]}</span>
            <ChevronDown size={14} />
          </button>
          {sortDropdownOpen && (
            <div className="absolute top-full mt-1 left-0 z-20 w-48 glass rounded-xl border border-white/10 py-1 shadow-xl">
              {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setSortBy(key); setSortDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === key ? 'text-violet-400 bg-violet-500/10' : 'text-slate-300 hover:bg-white/5'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category filter dropdown */}
        <div className="relative">
          <button
            onClick={() => { setFilterDropdownOpen(!filterDropdownOpen); setSortDropdownOpen(false); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-sm text-slate-300 hover:text-white hover:border-white/20 transition-all"
          >
            <Filter size={14} />
            <span>Categoria: {filterCategory === 'all' ? 'Todas' : categoryLabels[filterCategory]}</span>
            <ChevronDown size={14} />
          </button>
          {filterDropdownOpen && (
            <div className="absolute top-full mt-1 left-0 z-20 w-48 glass rounded-xl border border-white/10 py-1 shadow-xl">
              <button
                onClick={() => { setFilterCategory('all'); setFilterDropdownOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${filterCategory === 'all' ? 'text-violet-400 bg-violet-500/10' : 'text-slate-300 hover:bg-white/5'}`}
              >
                Todas
              </button>
              {(Object.entries(categoryLabels) as [QuestCategory, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setFilterCategory(key); setFilterDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${filterCategory === key ? 'text-violet-400 bg-violet-500/10' : 'text-slate-300 hover:bg-white/5'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-xs text-slate-500 ml-auto">
          {filteredAndSorted.length} resultado{filteredAndSorted.length !== 1 ? 's' : ''}
        </span>
      </motion.div>

      {/* Quest grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="glass rounded-2xl border border-white/10 p-16 text-center">
          <Compass className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-heading font-semibold text-white mb-2">
            No hay aventuras completadas
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            No se encontraron aventuras con estos filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredAndSorted.map((entry, i) => {
              const tier = getScoreTier(entry.score, entry.maxScore);
              const pct = Math.round((entry.score / entry.maxScore) * 100);

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className={`glass rounded-2xl border overflow-hidden ${tierBorders[tier]} hover:border-violet-500/30 transition-all duration-300 group/card`}
                >
                  {/* Cover gradient */}
                  <div className={`h-24 bg-gradient-to-br ${categoryGradients[entry.category]} relative overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Trophy className={`w-10 h-10 ${tierColors[tier]} opacity-20`} />
                    </div>
                    {/* Score badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm">
                      <Star size={12} className={tierColors[tier]} fill="currentColor" />
                      <span className="text-xs font-bold text-white">{pct}%</span>
                    </div>
                    {/* Tier badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-semibold ${
                        tier === 'gold' ? 'bg-amber-500/20 text-amber-400' :
                        tier === 'silver' ? 'bg-slate-400/20 text-slate-300' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {tier === 'gold' ? 'Oro' : tier === 'silver' ? 'Plata' : 'Bronce'}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-semibold ${difficultyColors[entry.difficulty]}`}>
                        {difficultyLabels[entry.difficulty]}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="font-heading font-semibold text-white group-hover/card:text-violet-300 transition-colors truncate mb-1">
                      {entry.questTitle}
                    </h4>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(entry.completedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {entry.duration}m
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Zap size={10} />
                        {entry.score}/{entry.maxScore}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-white/5 mb-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          tier === 'gold' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                          tier === 'silver' ? 'bg-gradient-to-r from-slate-400 to-slate-300' :
                          'bg-gradient-to-r from-orange-500 to-orange-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/quest-play/${entry.questId}`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/15 text-violet-400 text-xs font-medium hover:bg-violet-500/25 transition-colors"
                      >
                        <RefreshCw size={12} />
                        Jugar de nuevo
                      </Link>
                      <button
                        onClick={() => setSelectedCertificate(entry)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 text-amber-400 text-xs font-medium hover:bg-amber-500/25 transition-colors"
                        aria-label="Ver certificado"
                      >
                        <Award size={12} />
                      </button>
                      <button
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-slate-400 text-xs font-medium hover:bg-white/10 transition-colors"
                        aria-label="Compartir"
                      >
                        <Share2 size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Certificate modal */}
      <AnimatePresence>
        {selectedCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setSelectedCertificate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full"
            >
              <CompletionCertificate
                questTitle={selectedCertificate.questTitle}
                userName="Explorador"
                score={selectedCertificate.score}
                maxScore={selectedCertificate.maxScore}
                completedAt={selectedCertificate.completedAt}
                onClose={() => setSelectedCertificate(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
