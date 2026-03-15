'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Zap,
  Layers,
  CheckCircle2,
  Play,
  Trophy,
} from 'lucide-react';

// ---------- Types ----------

interface CollectionQuest {
  id: string;
  title: string;
  thumbnailGradient: string;
  points: number;
  duration: number;
  completed: boolean;
}

interface QuestCollection {
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

interface CollectionCardProps {
  collection: QuestCollection;
  featured?: boolean;
  onClick?: () => void;
  className?: string;
}

// ---------- Component ----------

const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  featured = false,
  onClick,
  className = '',
}) => {
  const isCompleted = collection.completedCount === collection.quests.length;
  const progressPercent =
    collection.quests.length > 0
      ? (collection.completedCount / collection.quests.length) * 100
      : 0;
  const hasStarted = collection.completedCount > 0;

  const hours = Math.floor(collection.estimatedTime / 60);
  const mins = collection.estimatedTime % 60;
  const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={[
        'group relative rounded-2xl overflow-hidden cursor-pointer',
        'bg-white/5 backdrop-blur-xl border border-white/10',
        'hover:border-white/20 hover:shadow-xl hover:shadow-violet-500/10',
        'transition-shadow duration-300',
        featured ? 'md:flex' : '',
        className,
      ].join(' ')}
    >
      {/* Cover gradient */}
      <div
        className={`bg-gradient-to-br ${collection.gradient} relative overflow-hidden ${
          featured ? 'md:w-2/5 h-48 md:h-auto' : 'h-40'
        }`}
      >
        {collection.coverImage ? (
          <img
            src={collection.coverImage}
            alt={collection.title}
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.15),transparent)]" />
          </>
        )}

        {/* Completion badge overlay */}
        {isCompleted && (
          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-16 h-16 rounded-full bg-emerald-500/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-emerald-500/40"
            >
              <Trophy size={28} className="text-white" />
            </motion.div>
          </div>
        )}

        {/* Quest thumbnail strip */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-1.5">
          {collection.quests.slice(0, 5).map((quest) => (
            <div
              key={quest.id}
              className={`flex-1 h-2 rounded-full ${
                quest.completed ? 'bg-white/80' : 'bg-white/20'
              }`}
            />
          ))}
          {collection.quests.length > 5 && (
            <span className="text-[9px] text-white/60 self-center ml-1">
              +{collection.quests.length - 5}
            </span>
          )}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className={`p-5 ${featured ? 'md:flex-1' : ''}`}>
        {/* Category tag */}
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          {collection.category.replace('_', ' ')}
        </span>

        <h3 className="text-base font-bold text-white mt-1 mb-1.5 group-hover:text-violet-300 transition-colors line-clamp-1">
          {collection.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {collection.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <Layers size={12} />
            {collection.quests.length} quests
          </span>
          <span className="flex items-center gap-1">
            <Zap size={12} />
            {collection.totalPoints} pts
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {timeLabel}
          </span>
        </div>

        {/* Progress bar */}
        {hasStarted && !isCompleted && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-slate-500">
                {collection.completedCount} de {collection.quests.length} completadas
              </span>
              <span className="text-[10px] text-violet-400 font-medium">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Action button */}
        {isCompleted ? (
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 size={16} />
            Coleccion completada
          </div>
        ) : hasStarted ? (
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-600/25">
            <Play size={14} />
            Continuar
          </button>
        ) : (
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-violet-600 text-white transition-all">
            <Play size={14} />
            Comenzar coleccion
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default CollectionCard;
