'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Globe,
  Star,
  Clock,
  TrendingUp,
  MapPin,
  Flag,
  Plus,
  Filter,
  ChevronRight,
  User,
  Sparkles,
} from 'lucide-react';
import { useQuery } from '@/hooks/useGraphQL';
import { LIST_QUESTS } from '@/lib/graphql/queries';
import Button from '@/components/ui/Button';
import type { Quest, QuestConnection } from '@/types';
import { DIFFICULTY_COLORS } from '@/lib/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type SortFilter = 'newest' | 'popular' | 'rating' | 'nearby';

const SORT_TABS: { key: SortFilter; label: string; icon: React.ElementType }[] = [
  { key: 'newest', label: 'Recientes', icon: Clock },
  { key: 'popular', label: 'Populares', icon: TrendingUp },
  { key: 'rating', label: 'Mejor valoradas', icon: Star },
  { key: 'nearby', label: 'Cerca de ti', icon: MapPin },
];

function QuestCard({ quest }: { quest: Quest }) {
  const diffColor = DIFFICULTY_COLORS[quest.difficulty] || 'violet';
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/20 text-emerald-300',
    amber: 'bg-amber-500/20 text-amber-300',
    rose: 'bg-rose-500/20 text-rose-300',
    violet: 'bg-violet-500/20 text-violet-300',
  };

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/quests/${quest.id}`}>
        <div className="glass rounded-2xl border border-white/10 p-5 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 group h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-heading font-semibold text-base group-hover:text-violet-300 transition-colors truncate">
                {quest.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {quest.description}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 flex-shrink-0 mt-1 transition-colors" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className={`px-2 py-0.5 rounded-full text-xs ${colorMap[diffColor]}`}>
              {quest.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-slate-400">
              {quest.category.replace('_', ' ')}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-slate-400">
              {quest.stages.length} etapas
            </span>
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                <User className="w-3 h-3 text-violet-400" />
              </div>
              <span className="text-xs text-slate-500">
                {quest.createdBy ? 'Comunidad' : 'Oficial'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {quest.location.name}
              </span>
              <span>{quest.estimatedDuration} min</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<SortFilter>('newest');
  const { data: connection, loading, execute } = useQuery<QuestConnection>(LIST_QUESTS);

  useEffect(() => {
    execute({ limit: 50 });
  }, [execute]);

  const quests = connection?.items || [];

  // Filter to community quests and sort
  const sortedQuests = useMemo(() => {
    const communityQuests = quests.filter((q) => q.isPublished);
    switch (activeTab) {
      case 'newest':
        return [...communityQuests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      case 'popular':
        return [...communityQuests].sort((a, b) => b.totalPoints - a.totalPoints);
      case 'rating':
        return [...communityQuests].sort((a, b) => b.totalPoints - a.totalPoints);
      case 'nearby':
        return communityQuests; // Would use geolocation in production
      default:
        return communityQuests;
    }
  }, [quests, activeTab]);

  const featuredQuests = sortedQuests.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
            <Globe className="w-8 h-8 text-violet-400" />
            Comunidad
          </h1>
          <p className="text-slate-400 mt-1">
            Explora quests creadas por otros jugadores
          </p>
        </div>
        <Link href="/create">
          <Button leftIcon={Plus}>
            Crear Quest
          </Button>
        </Link>
      </motion.div>

      {/* Featured carousel */}
      {featuredQuests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Quests destacadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredQuests.map((quest) => (
              <Link key={quest.id} href={`/quests/${quest.id}`}>
                <div className="glass rounded-2xl border border-amber-500/20 p-5 hover:border-amber-500/40 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-full" />
                  <Sparkles className="w-4 h-4 text-amber-400 mb-3" />
                  <h3 className="text-white font-heading font-semibold group-hover:text-amber-300 transition-colors">
                    {quest.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{quest.description}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                    <span>{quest.stages.length} etapas</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span>{quest.estimatedDuration} min</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span>{quest.totalPoints} pts</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sort tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {SORT_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
                ${activeTab === tab.key
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Quest grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse">
              <div className="h-5 w-3/4 bg-navy-800 rounded mb-3" />
              <div className="h-3 w-full bg-navy-800 rounded mb-2" />
              <div className="h-3 w-2/3 bg-navy-800 rounded mb-4" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-navy-800 rounded-full" />
                <div className="h-5 w-16 bg-navy-800 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedQuests.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {sortedQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <Globe className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-heading font-semibold text-white mb-2">
            No hay quests todavia
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            Se el primero en crear una quest para la comunidad
          </p>
          <Link href="/create">
            <Button leftIcon={Plus}>Crear Quest</Button>
          </Link>
        </div>
      )}

      {/* Report info */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <Flag className="w-5 h-5 text-slate-500 flex-shrink-0" />
        <p className="text-xs text-slate-500">
          Si encuentras contenido inapropiado, usa el boton de reportar en la pagina de cada quest.
          Todas las quests comunitarias son revisadas por moderadores.
        </p>
      </div>
    </div>
  );
}
