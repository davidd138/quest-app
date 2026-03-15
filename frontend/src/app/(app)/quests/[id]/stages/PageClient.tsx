'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Zap,
  Star,
  Clock,
  Lock,
  CheckCircle2,
  Users as UsersIcon,
  ChevronRight,
  Compass,
  Target,
  MessageSquare,
  Brain,
  Search as SearchIcon,
  HelpCircle,
} from 'lucide-react';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_QUEST, GET_PROGRESS } from '@/lib/graphql/queries';
import type { Quest, Progress, ChallengeType } from '@/types';
import Avatar from '@/components/ui/Avatar';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const challengeIcons: Record<ChallengeType, typeof Target> = {
  conversation: MessageSquare,
  riddle: Brain,
  knowledge: HelpCircle,
  negotiation: UsersIcon,
  persuasion: Star,
  exploration: SearchIcon,
  trivia: Zap,
};

const challengeColors: Record<ChallengeType, string> = {
  conversation: 'text-violet-400 bg-violet-500/15',
  riddle: 'text-amber-400 bg-amber-500/15',
  knowledge: 'text-cyan-400 bg-cyan-500/15',
  negotiation: 'text-emerald-400 bg-emerald-500/15',
  persuasion: 'text-rose-400 bg-rose-500/15',
  exploration: 'text-blue-400 bg-blue-500/15',
  trivia: 'text-fuchsia-400 bg-fuchsia-500/15',
};

function StageMapVisualization({ stages, completedIds }: { stages: Quest['stages']; completedIds: Set<string> }) {
  return (
    <div className="relative flex items-center justify-center py-6">
      <div className="flex items-center gap-0">
        {stages
          .sort((a, b) => a.order - b.order)
          .map((stage, i) => {
            const isCompleted = completedIds.has(stage.id);
            return (
              <div key={stage.id} className="flex items-center">
                {/* Node */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 400 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-500/20 border-emerald-500/50'
                      : 'bg-navy-800 border-slate-700/50'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <span className="text-xs font-bold text-slate-400">{i + 1}</span>
                  )}
                </motion.div>
                {/* Connector */}
                {i < stages.length - 1 && (
                  <div
                    className={`w-8 h-0.5 ${
                      isCompleted ? 'bg-emerald-500/40' : 'bg-slate-700/50'
                    }`}
                  />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default function QuestStagesPage() {
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 rounded-lg animate-shimmer bg-navy-800" />
        <div className="h-16 rounded-xl animate-shimmer bg-navy-800" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl animate-shimmer bg-navy-800" />
        ))}
      </div>
    );
  }

  const completedIds = new Set(progress?.completedStages?.map((s) => s.stageId) || []);
  const sortedStages = [...quest.stages].sort((a, b) => a.order - b.order);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Back link */}
      <motion.div variants={itemVariants}>
        <Link
          href={`/quests/${questId}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quest
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-3xl font-bold text-white mb-2">
          {quest.title} - Stages
        </h1>
        <p className="text-slate-400">
          {quest.stages.length} stages &middot; {quest.totalPoints} total points &middot;{' '}
          {quest.estimatedDuration} min estimated
        </p>
      </motion.div>

      {/* Stage map visualization */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-slate-700/30">
        <h3 className="text-sm font-semibold text-slate-400 mb-2 text-center uppercase tracking-wider">
          Stage Map
        </h3>
        <StageMapVisualization stages={quest.stages} completedIds={completedIds} />
        <p className="text-xs text-slate-500 text-center mt-2">
          {completedIds.size} of {quest.stages.length} completed
        </p>
      </motion.div>

      {/* Stage cards */}
      <div className="space-y-6">
        {sortedStages.map((stage, i) => {
          const isCompleted = completedIds.has(stage.id);
          const isCurrent = progress && progress.currentStageIndex === i;
          const isLocked = progress && !isCompleted && !isCurrent && i > (progress.currentStageIndex ?? 0);
          const ChallengeIcon = challengeIcons[stage.challenge.type] || Target;
          const challengeColor = challengeColors[stage.challenge.type] || 'text-slate-400 bg-slate-500/15';

          return (
            <motion.div
              key={stage.id}
              variants={itemVariants}
              className={`glass rounded-2xl overflow-hidden border transition-all duration-200 ${
                isCurrent
                  ? 'border-violet-500/40 shadow-lg shadow-violet-500/10'
                  : isCompleted
                  ? 'border-emerald-500/20'
                  : isLocked
                  ? 'border-slate-700/20 opacity-50'
                  : 'border-slate-700/30'
              }`}
            >
              {/* Stage header bar */}
              <div className={`px-6 py-3 flex items-center justify-between ${
                isCompleted ? 'bg-emerald-500/5' : isCurrent ? 'bg-violet-500/5' : 'bg-white/[0.02]'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isCompleted ? 'bg-emerald-500/15' : isCurrent ? 'bg-violet-500/15' : 'bg-navy-800'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4 text-slate-600" />
                    ) : (
                      <span className="text-sm font-bold text-violet-400">{i + 1}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-white text-lg">
                      {stage.title}
                    </h3>
                    {isCurrent && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 font-medium">
                        Current Stage
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="font-heading font-bold text-white">{stage.points}</span>
                  <span className="text-xs text-slate-500">pts</span>
                </div>
              </div>

              {/* Stage content */}
              <div className="p-6 space-y-5">
                {/* Description */}
                <p className="text-slate-300 leading-relaxed">{stage.description}</p>

                {/* Info grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Location */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-800/40">
                    <MapPin className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Location</p>
                      <p className="text-sm text-white font-medium">{stage.location.name}</p>
                      {stage.location.address && (
                        <p className="text-xs text-slate-400 mt-0.5">{stage.location.address}</p>
                      )}
                    </div>
                  </div>

                  {/* Challenge type */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-800/40">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${challengeColor}`}>
                      <ChallengeIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Challenge</p>
                      <p className="text-sm text-white font-medium capitalize">{stage.challenge.type}</p>
                      {!isLocked && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                          {stage.challenge.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Character profile */}
                {!isLocked && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-violet-500/5 to-emerald-500/5 border border-white/5">
                    <Avatar name={stage.character.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold text-white">
                        {stage.character.name}
                      </p>
                      <p className="text-sm text-slate-400">{stage.character.role}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {stage.character.personality}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-500">Voice Style</p>
                      <p className="text-sm text-violet-400 font-medium capitalize">
                        {stage.character.voiceStyle}
                      </p>
                    </div>
                  </div>
                )}

                {/* Success criteria */}
                {!isLocked && stage.challenge.successCriteria && (
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-xs text-emerald-400 font-medium mb-1">Success Criteria</p>
                    <p className="text-sm text-slate-300">{stage.challenge.successCriteria}</p>
                  </div>
                )}

                {/* Hints */}
                {!isLocked && stage.hints && stage.hints.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-2">Hints</p>
                    <div className="space-y-1.5">
                      {stage.hints.map((hint, hi) => (
                        <div key={hi} className="flex items-start gap-2 text-sm text-slate-400">
                          <Compass className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          {hint}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locked overlay hint */}
                {isLocked && (
                  <div className="text-center py-4">
                    <Lock className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Complete previous stages to unlock</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <motion.div variants={itemVariants} className="flex justify-center pb-8">
        <Link href={`/quest-play/${questId}`}>
          <button className="px-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-lg transition-all duration-200 shadow-xl shadow-violet-600/25 hover:shadow-violet-500/40 flex items-center gap-3 group">
            <Compass className="w-5 h-5" />
            {progress ? 'Continue Quest' : 'Start Quest'}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
