'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Zap,
  MapPin,
  Lock,
  CheckCircle2,
  Play,
  Compass,
  Star,
  ChevronRight,
  Users as UsersIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_QUEST, GET_PROGRESS } from '@/lib/graphql/queries';
import type { Quest, Progress } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    hard: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    legendary: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  };
  return (
    <span className={`text-xs px-3 py-1.5 rounded-lg font-medium border ${colors[difficulty] || ''}`}>
      {difficulty}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="text-xs px-3 py-1.5 rounded-lg font-medium bg-navy-800 text-slate-300 border border-slate-700/50 capitalize">
      {category.replace(/_/g, ' ')}
    </span>
  );
}

export default function QuestDetailPage() {
  const params = useParams();
  const questId = params.id as string;

  const { data: quest, loading: questLoading, execute: fetchQuest } = useQuery<Quest>(GET_QUEST);
  const { data: progress, execute: fetchProgress } = useQuery<Progress>(GET_PROGRESS);

  useEffect(() => {
    if (questId) {
      fetchQuest({ id: questId });
      fetchProgress({ questId });
    }
  }, [questId, fetchQuest, fetchProgress]);

  if (questLoading || !quest) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-64 rounded-2xl animate-shimmer bg-navy-800" />
        <div className="h-8 w-1/2 rounded-lg animate-shimmer bg-navy-800" />
        <div className="h-4 w-3/4 rounded animate-shimmer bg-navy-800" />
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl animate-shimmer bg-navy-800" />
          ))}
        </div>
      </div>
    );
  }

  const completedStageIds = new Set(progress?.completedStages?.map((s) => s.stageId) || []);
  const progressPercent = quest.stages.length
    ? Math.round((completedStageIds.size / quest.stages.length) * 100)
    : 0;
  const isStarted = !!progress;
  const isCompleted = progress?.status === 'completed';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <Link
          href="/quests"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quests
        </Link>
      </motion.div>

      {/* Hero */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-2xl overflow-hidden"
      >
        <div className="h-64 md:h-80 bg-gradient-to-br from-violet-600/30 via-navy-800 to-emerald-600/20 relative">
          {quest.coverImageUrl ? (
            <img
              src={quest.coverImageUrl}
              alt={quest.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Compass className="w-24 h-24 text-violet-500/15" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <CategoryBadge category={quest.category} />
            <DifficultyBadge difficulty={quest.difficulty} />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">
            {quest.title}
          </h1>
          <p className="text-slate-300 max-w-2xl leading-relaxed">{quest.description}</p>
        </div>
      </motion.div>

      {/* Info Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <Zap className="w-5 h-5 text-violet-400 mx-auto mb-2" />
          <p className="text-2xl font-heading font-bold text-white">{quest.totalPoints}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Points</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-heading font-bold text-white">{quest.estimatedDuration}</p>
          <p className="text-xs text-slate-400 mt-0.5">Minutes</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Compass className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-heading font-bold text-white">{quest.stages.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Stages</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <MapPin className="w-5 h-5 text-rose-400 mx-auto mb-2" />
          <p className="text-lg font-heading font-bold text-white truncate">
            {quest.location?.name || 'TBD'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Location</p>
        </div>
      </motion.div>

      {/* Progress Bar (if started) */}
      {isStarted && (
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-white">Your Progress</h3>
            <span className="text-sm text-violet-400 font-medium">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-navy-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {completedStageIds.size} of {quest.stages.length} stages completed
          </p>
        </motion.div>
      )}

      {/* Stages */}
      <motion.div variants={itemVariants}>
        <h2 className="font-heading text-2xl font-bold text-white mb-5">Stages</h2>
        <div className="space-y-3">
          {quest.stages
            .sort((a, b) => a.order - b.order)
            .map((stage, i) => {
              const isStageCompleted = completedStageIds.has(stage.id);
              const isCurrent = isStarted && progress.currentStageIndex === i;
              const isLocked = isStarted && !isStageCompleted && !isCurrent && i > (progress.currentStageIndex ?? 0);

              return (
                <motion.div
                  key={stage.id}
                  variants={itemVariants}
                  className={`glass rounded-xl p-5 border transition-all duration-200 ${
                    isCurrent
                      ? 'border-violet-500/40 shadow-lg shadow-violet-500/10'
                      : isStageCompleted
                      ? 'border-emerald-500/20'
                      : isLocked
                      ? 'border-slate-700/30 opacity-60'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isStageCompleted
                          ? 'bg-emerald-500/15'
                          : isCurrent
                          ? 'bg-violet-500/15'
                          : 'bg-navy-800'
                      }`}
                    >
                      {isStageCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5 text-slate-600" />
                      ) : (
                        <span className="text-sm font-bold text-violet-400">{i + 1}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-semibold text-white">{stage.title}</h4>
                        {isCurrent && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                        {stage.description}
                      </p>

                      {/* Stage Details */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {stage.location.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          {stage.points} pts
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          <Star className="w-3 h-3" />
                          {stage.challenge.type}
                        </span>
                      </div>

                      {/* Character Preview */}
                      {!isLocked && (
                        <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-navy-800/40">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/30 to-emerald-500/30 flex items-center justify-center">
                            <UsersIcon className="w-4 h-4 text-violet-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-300">
                              {stage.character.name}
                            </p>
                            <p className="text-xs text-slate-500">{stage.character.role}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Points */}
                    {isStageCompleted && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-emerald-400 font-semibold">+{stage.points}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
        </div>
      </motion.div>

      {/* Action Button */}
      <motion.div variants={itemVariants} className="flex justify-center pb-8">
        {isCompleted ? (
          <div className="glass rounded-2xl px-8 py-4 text-center border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-heading font-semibold text-white">Quest Completed!</p>
            <p className="text-sm text-slate-400 mt-1">
              You earned {progress.totalPoints} points
            </p>
          </div>
        ) : (
          <Link href={`/quests/${quest.id}`}>
            <button className="px-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-lg transition-all duration-200 shadow-xl shadow-violet-600/25 hover:shadow-violet-500/40 flex items-center gap-3 group">
              <Play className="w-5 h-5" />
              {isStarted ? 'Continue Quest' : 'Start Quest'}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}
