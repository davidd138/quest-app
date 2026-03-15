'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Play,
  Clock,
  Star,
  MapPin,
  ChevronRight,
  Check,
  Lock,
  Trophy,
  ArrowLeft,
} from 'lucide-react';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_QUEST, GET_PROGRESS } from '@/lib/graphql/queries';
import { useMutation } from '@/hooks/useGraphQL';
import { START_QUEST } from '@/lib/graphql/mutations';
import QuestMap from '@/components/maps/QuestMap';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { Quest, Progress, Stage } from '@/types';

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function QuestPlayPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const questId = params.id;

  const { data: quest, loading: questLoading, execute: fetchQuest } = useQuery<Quest>(GET_QUEST);
  const { data: progress, loading: progressLoading, execute: fetchProgress } = useQuery<Progress>(GET_PROGRESS);
  const { execute: startQuest, loading: startingQuest } = useMutation<Progress>(START_QUEST);

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetchQuest({ id: questId });
    fetchProgress({ questId });
  }, [questId, fetchQuest, fetchProgress]);

  // Timer
  useEffect(() => {
    if (!progress || progress.status !== 'in_progress') return;
    const startTime = new Date(progress.startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [progress]);

  const completedStageIds = useMemo(
    () => new Set(progress?.completedStages?.map((s) => s.stageId) ?? []),
    [progress],
  );

  const currentStageIndex = progress?.currentStageIndex ?? 0;
  const sortedStages = useMemo(
    () => [...(quest?.stages ?? [])].sort((a, b) => a.order - b.order),
    [quest],
  );

  const totalEarned = progress?.totalPoints ?? 0;

  const handleStartQuest = async () => {
    try {
      await startQuest({ questId });
      await fetchProgress({ questId });
    } catch {
      // Error handled by hook
    }
  };

  const handleStageClick = (stage: Stage, index: number) => {
    if (index <= currentStageIndex || completedStageIds.has(stage.id)) {
      router.push(`/quest-play/${questId}/stage/${stage.id}`);
    }
  };

  const loading = questLoading || progressLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card padding="lg">
          <p className="text-slate-400">Quest not found.</p>
        </Card>
      </div>
    );
  }

  const isCompleted = progress?.status === 'completed';
  const hasStarted = !!progress;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">
            {quest.title}
          </h1>
          <p className="text-slate-400 text-sm mt-1">{quest.description}</p>
        </div>
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
          >
            <Trophy size={18} className="text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm">Completed!</span>
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map - 2 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card padding="none" className="overflow-hidden">
            <QuestMap
              stages={sortedStages}
              currentStageIndex={currentStageIndex}
              completedStageIds={completedStageIds}
              onStageClick={handleStageClick}
              height="460px"
            />
          </Card>
        </motion.div>

        {/* Stats and controls */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Progress stats */}
          <Card variant="elevated" padding="md">
            <h3 className="font-heading font-semibold text-white mb-4">Progress</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Clock size={12} />
                  <span>Elapsed</span>
                </div>
                <p className="font-heading font-bold text-white">
                  {hasStarted ? formatDuration(elapsed) : '--:--'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Star size={12} />
                  <span>Points</span>
                </div>
                <p className="font-heading font-bold text-white">
                  {totalEarned}
                  <span className="text-slate-500 text-xs font-normal">
                    /{quest.totalPoints}
                  </span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <MapPin size={12} />
                  <span>Stages</span>
                </div>
                <p className="font-heading font-bold text-white">
                  {completedStageIds.size}
                  <span className="text-slate-500 text-xs font-normal">
                    /{sortedStages.length}
                  </span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Check size={12} />
                  <span>Status</span>
                </div>
                <p className="font-heading font-bold text-white capitalize text-sm">
                  {progress?.status ?? 'Not Started'}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Overall Progress</span>
                <span>
                  {sortedStages.length > 0
                    ? Math.round((completedStageIds.size / sortedStages.length) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      sortedStages.length > 0
                        ? (completedStageIds.size / sortedStages.length) * 100
                        : 0
                    }%`,
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </Card>

          {/* Action button */}
          {!hasStarted && (
            <Button
              fullWidth
              size="lg"
              leftIcon={Play}
              loading={startingQuest}
              onClick={handleStartQuest}
            >
              Start Quest
            </Button>
          )}
          {hasStarted && !isCompleted && (
            <Button
              fullWidth
              size="lg"
              leftIcon={Play}
              onClick={() => {
                const currentStage = sortedStages[currentStageIndex];
                if (currentStage) {
                  router.push(`/quest-play/${questId}/stage/${currentStage.id}`);
                }
              }}
            >
              Enter Current Stage
            </Button>
          )}
        </motion.div>
      </div>

      {/* Stage list */}
      <motion.div variants={itemVariants} className="mt-8">
        <h2 className="font-heading text-xl font-bold text-white mb-4">Stages</h2>
        <div className="space-y-3">
          {sortedStages.map((stage, index) => {
            const isStageCompleted = completedStageIds.has(stage.id);
            const isCurrent = index === currentStageIndex && !isCompleted;
            const isLocked = index > currentStageIndex && !isStageCompleted;

            return (
              <motion.div
                key={stage.id}
                variants={itemVariants}
                whileHover={!isLocked ? { x: 4 } : undefined}
                onClick={() => handleStageClick(stage, index)}
                className={`glass rounded-xl p-4 flex items-center gap-4 transition-colors cursor-pointer ${
                  isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/[0.08]'
                } ${isCurrent ? 'border-violet-500/40 shadow-lg shadow-violet-500/10' : ''}`}
              >
                {/* Stage number/status */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isStageCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                        ? 'bg-violet-500/20 text-violet-400'
                        : 'bg-slate-700/50 text-slate-500'
                  }`}
                >
                  {isStageCompleted ? (
                    <Check size={18} />
                  ) : isLocked ? (
                    <Lock size={14} />
                  ) : (
                    <span className="text-sm font-bold">{stage.order}</span>
                  )}
                </div>

                {/* Stage info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-semibold text-white text-sm truncate">
                    {stage.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin size={10} />
                      {stage.location.name}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">
                      {stage.challenge.type}
                    </span>
                  </div>
                </div>

                {/* Points */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold text-violet-400">
                    {stage.points} pts
                  </span>
                  {!isLocked && <ChevronRight size={16} className="text-slate-500" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
