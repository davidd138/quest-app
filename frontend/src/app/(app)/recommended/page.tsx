'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  MapPin,
  Clock,
  Zap,
  ChevronLeft,
  ChevronRight,
  Brain,
  Target,
  Calendar,
  X,
  RefreshCw,
  Compass,
  ArrowRight,
} from 'lucide-react';
import type { Quest, QuestCategory, QuestDifficulty } from '@/types';
import { useQuestRecommendations, type RecommendedQuest } from '@/hooks/useQuestRecommendations';

// ---------- Mock data for demo ----------

const mockAvailableQuests = [
  { id: 'rec-1', title: 'Sombras del Coliseo', description: 'Descubre el misterio de los gladiadores desaparecidos en antiguas ruinas', category: 'mystery' as QuestCategory, difficulty: 'hard' as QuestDifficulty, estimatedDuration: 95, totalPoints: 920, stages: [], location: { latitude: 40.4168, longitude: -3.7038, name: 'Madrid' }, radius: 5, tags: ['popular', 'featured', 'mystery', 'historic'], isPublished: true, createdAt: '2026-03-10T00:00:00Z', updatedAt: '2026-03-10T00:00:00Z' },
  { id: 'rec-2', title: 'Jardines Susurrantes', description: 'Una aventura natural por maravillas botanicas encantadas', category: 'nature' as QuestCategory, difficulty: 'easy' as QuestDifficulty, estimatedDuration: 35, totalPoints: 380, stages: [], location: { latitude: 40.4153, longitude: -3.6845, name: 'Retiro' }, radius: 3, tags: ['nature', 'relaxing'], isPublished: true, createdAt: '2026-03-12T00:00:00Z', updatedAt: '2026-03-12T00:00:00Z' },
  { id: 'rec-3', title: 'El Filo del Cifrado', description: 'Descifra codigos y decodifica mensajes en esta aventura cerebral', category: 'educational' as QuestCategory, difficulty: 'legendary' as QuestDifficulty, estimatedDuration: 130, totalPoints: 1350, stages: [], location: { latitude: 40.4200, longitude: -3.7025, name: 'Gran Via' }, radius: 4, tags: ['educational', 'challenging', 'puzzle'], isPublished: true, createdAt: '2026-03-14T00:00:00Z', updatedAt: '2026-03-14T00:00:00Z' },
  { id: 'rec-4', title: 'Safari de Arte Urbano', description: 'Descubre murales ocultos y conoce a los artistas detras de ellos', category: 'cultural' as QuestCategory, difficulty: 'medium' as QuestDifficulty, estimatedDuration: 55, totalPoints: 520, stages: [], location: { latitude: 40.4115, longitude: -3.7120, name: 'La Latina' }, radius: 3, tags: ['cultural', 'art', 'urban'], isPublished: true, createdAt: '2026-03-08T00:00:00Z', updatedAt: '2026-03-08T00:00:00Z' },
  { id: 'rec-5', title: 'Expreso de Medianoche', description: 'Corre contra el tiempo en la aventura urbana mas emocionante', category: 'adventure' as QuestCategory, difficulty: 'hard' as QuestDifficulty, estimatedDuration: 80, totalPoints: 880, stages: [], location: { latitude: 40.4180, longitude: -3.7142, name: 'Palacio Real' }, radius: 5, tags: ['adventure', 'action', 'popular', 'trending'], isPublished: true, createdAt: '2026-03-05T00:00:00Z', updatedAt: '2026-03-05T00:00:00Z' },
  { id: 'rec-6', title: 'Sabor de la Tradicion', description: 'Un viaje culinario a traves de siglos de sabor', category: 'culinary' as QuestCategory, difficulty: 'easy' as QuestDifficulty, estimatedDuration: 50, totalPoints: 420, stages: [], location: { latitude: 40.4138, longitude: -3.6921, name: 'Lavapies' }, radius: 3, tags: ['culinary', 'food'], isPublished: true, createdAt: '2026-03-13T00:00:00Z', updatedAt: '2026-03-13T00:00:00Z' },
  { id: 'rec-7', title: 'El Ultimo Alquimista', description: 'Combina ingredientes del conocimiento para crear la piedra filosofal', category: 'educational' as QuestCategory, difficulty: 'legendary' as QuestDifficulty, estimatedDuration: 140, totalPoints: 1500, stages: [], location: { latitude: 40.4490, longitude: -3.7267, name: 'Complutense' }, radius: 6, tags: ['educational', 'legendary', 'alchemy'], isPublished: true, createdAt: '2026-03-11T00:00:00Z', updatedAt: '2026-03-11T00:00:00Z' },
  { id: 'rec-8', title: 'Laberinto de Equipos', description: 'Navega el desafio definitivo en equipo a traves del laberinto', category: 'team_building' as QuestCategory, difficulty: 'medium' as QuestDifficulty, estimatedDuration: 70, totalPoints: 650, stages: [], location: { latitude: 40.4230, longitude: -3.6950, name: 'Salamanca' }, radius: 4, tags: ['team', 'multiplayer'], isPublished: true, createdAt: '2026-03-14T12:00:00Z', updatedAt: '2026-03-14T12:00:00Z' },
];

const mockCompletedQuests = [
  { ...mockAvailableQuests[0], id: 'done-1', category: 'mystery' as QuestCategory },
  { ...mockAvailableQuests[3], id: 'done-2', category: 'cultural' as QuestCategory },
];

const mockScores = [
  { id: 's1', userId: 'u1', questId: 'done-1', questTitle: 'Sombras del Coliseo', totalPoints: 750, completionTime: 85, stagesCompleted: 5, totalStages: 5, completedAt: '2026-03-01T00:00:00Z' },
  { id: 's2', userId: 'u1', questId: 'done-2', questTitle: 'Safari de Arte Urbano', totalPoints: 480, completionTime: 50, stagesCompleted: 4, totalStages: 4, completedAt: '2026-03-05T00:00:00Z' },
];

// ---------- Difficulty colors ----------

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

// ---------- Carousel ----------

function HorizontalCarousel({
  quests,
  onDismiss,
}: {
  quests: RecommendedQuest[];
  onDismiss: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth',
    });
  };

  if (quests.length === 0) {
    return (
      <div className="glass rounded-2xl border border-white/10 p-8 text-center">
        <Compass className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">No hay recomendaciones en esta categoria aun.</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={() => scroll('left')}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass border border-white/15 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-xl hover:bg-white/10"
        aria-label="Desplazar a la izquierda"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass border border-white/15 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-xl hover:bg-white/10"
        aria-label="Desplazar a la derecha"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide scroll-smooth"
      >
        <AnimatePresence>
          {quests.map((quest, i) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="flex-shrink-0 w-[280px]"
            >
              <div className="glass rounded-2xl border border-white/10 overflow-hidden group/card hover:border-violet-500/30 transition-all duration-300 relative">
                {/* Dismiss button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onDismiss(quest.id);
                  }}
                  className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-white hover:bg-black/70 transition-colors opacity-0 group-hover/card:opacity-100"
                  aria-label="No me interesa"
                >
                  <X size={14} />
                </button>

                <Link href={`/quests/${quest.id}`}>
                  {/* Cover */}
                  <div className={`h-32 bg-gradient-to-br ${categoryGradients[quest.category]} relative overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Compass className="w-14 h-14 text-white/10" />
                    </div>
                    {/* Recommendation score */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-500/20 backdrop-blur-sm border border-violet-500/30">
                      <Sparkles size={10} className="text-violet-300" />
                      <span className="text-[10px] font-bold text-violet-200">{quest.recommendationScore}% match</span>
                    </div>
                    {/* Difficulty */}
                    <div className="absolute bottom-3 left-3">
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-semibold ${difficultyColors[quest.difficulty]}`}>
                        {difficultyLabels[quest.difficulty]}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="font-heading font-semibold text-white group-hover/card:text-violet-300 transition-colors truncate mb-1">
                      {quest.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                      {quest.description}
                    </p>

                    {/* Reason tag */}
                    <div className="flex items-center gap-1.5 mb-3 text-[10px] text-violet-400 bg-violet-500/10 rounded-lg px-2 py-1 w-fit">
                      <Brain className="w-3 h-3" />
                      <span className="font-medium">{quest.reason.label}</span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Zap size={10} />{quest.totalPoints}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock size={10} />{quest.estimatedDuration}m
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------- Section Header ----------

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  iconColor,
  iconBg,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <h3 className="font-heading font-bold text-white text-lg">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

// ---------- Page ----------

export default function RecommendedPage() {
  const {
    recommendations,
    categoryRecommendations,
    challengeRecommendations,
    nearbyRecommendations,
    trendingRecommendations,
    newThisWeek,
    dismiss,
    refresh,
    loading,
  } = useQuestRecommendations({
    completedQuests: mockCompletedQuests as Quest[],
    scores: mockScores,
    preferences: {},
    availableQuests: mockAvailableQuests as Quest[],
    userLocation: { lat: 40.4168, lng: -3.7038 },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl glass border border-white/10 p-8 md:p-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-fuchsia-600/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-violet-400" />
              <span className="text-sm font-semibold text-violet-400">Recomendaciones IA</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
              Para Ti
            </h1>
            <p className="text-slate-400 max-w-lg">
              Aventuras seleccionadas especialmente para ti basadas en tu historial,
              preferencias y estilo de juego.
            </p>
          </div>

          <button
            onClick={refresh}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-sm text-slate-300 hover:text-white hover:border-violet-500/30 transition-all"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
        </div>

        {/* Quick stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
          <div className="text-center">
            <p className="text-2xl font-heading font-bold text-white">{recommendations.length}</p>
            <p className="text-xs text-slate-500">Recomendaciones</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-heading font-bold text-emerald-400">{mockScores.length}</p>
            <p className="text-xs text-slate-500">Quests completados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-heading font-bold text-violet-400">
              {Math.round(mockScores.reduce((s, sc) => s + sc.totalPoints, 0) / mockScores.length)}
            </p>
            <p className="text-xs text-slate-500">Puntuacion media</p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* Because you enjoyed [category] */}
          {categoryRecommendations.length > 0 && (
            <section>
              <SectionHeader
                icon={Brain}
                title="Porque disfrutaste de misterio y cultura"
                subtitle="Basado en tus categorias favoritas"
                iconColor="text-violet-400"
                iconBg="bg-violet-500/15"
              />
              <HorizontalCarousel quests={categoryRecommendations} onDismiss={dismiss} />
            </section>
          )}

          {/* Challenge yourself */}
          {challengeRecommendations.length > 0 && (
            <section>
              <SectionHeader
                icon={Target}
                title="Desafiate"
                subtitle="Un paso mas alla de tu nivel actual"
                iconColor="text-rose-400"
                iconBg="bg-rose-500/15"
              />
              <HorizontalCarousel quests={challengeRecommendations} onDismiss={dismiss} />
            </section>
          )}

          {/* Near you */}
          {nearbyRecommendations.length > 0 && (
            <section>
              <SectionHeader
                icon={MapPin}
                title="Cerca de Ti"
                subtitle="Aventuras en tu zona"
                iconColor="text-cyan-400"
                iconBg="bg-cyan-500/15"
              />
              <HorizontalCarousel quests={nearbyRecommendations} onDismiss={dismiss} />
            </section>
          )}

          {/* Trending */}
          {trendingRecommendations.length > 0 && (
            <section>
              <SectionHeader
                icon={TrendingUp}
                title="Tendencia"
                subtitle="Las mas populares esta semana"
                iconColor="text-amber-400"
                iconBg="bg-amber-500/15"
              />
              <HorizontalCarousel quests={trendingRecommendations} onDismiss={dismiss} />
            </section>
          )}

          {/* New this week */}
          {newThisWeek.length > 0 && (
            <section>
              <SectionHeader
                icon={Calendar}
                title="Nuevas Esta Semana"
                subtitle="Recien publicadas y listas para explorar"
                iconColor="text-emerald-400"
                iconBg="bg-emerald-500/15"
              />
              <HorizontalCarousel quests={newThisWeek} onDismiss={dismiss} />
            </section>
          )}

          {/* All recommendations */}
          <section>
            <SectionHeader
              icon={Sparkles}
              title="Todas las Recomendaciones"
              subtitle={`${recommendations.length} aventuras seleccionadas para ti`}
              iconColor="text-fuchsia-400"
              iconBg="bg-fuchsia-500/15"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.slice(0, 9).map((quest, i) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/quests/${quest.id}`}>
                    <div className="glass rounded-2xl border border-white/10 p-4 hover:border-violet-500/30 transition-all duration-300 group/card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading font-semibold text-white group-hover/card:text-violet-300 transition-colors truncate">
                            {quest.title}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {quest.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-500/15 ml-3">
                          <Sparkles size={10} className="text-violet-400" />
                          <span className="text-[10px] font-bold text-violet-300">{quest.recommendationScore}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mb-3 text-[10px] text-violet-400 bg-violet-500/10 rounded-lg px-2 py-1 w-fit">
                        <Brain className="w-3 h-3" />
                        <span>{quest.reason.label}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className={`px-2 py-0.5 rounded-md font-semibold ${difficultyColors[quest.difficulty]}`}>
                            {difficultyLabels[quest.difficulty]}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Zap size={10} />{quest.totalPoints}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock size={10} />{quest.estimatedDuration}m
                          </span>
                        </div>
                        <ArrowRight size={14} className="text-slate-600 group-hover/card:text-violet-400 transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
