'use client';

import React, { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  MessageSquare,
  User,
  Target,
  ChevronRight,
  Star,
  Sparkles,
  Check,
} from 'lucide-react';
import { useQuery } from '@/hooks/useGraphQL';
import { useMutation } from '@/hooks/useGraphQL';
import { GET_QUEST, GET_PROGRESS } from '@/lib/graphql/queries';
import { CREATE_CONVERSATION } from '@/lib/graphql/mutations';
import QuestMap from '@/components/maps/QuestMap';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { Quest, Progress, Conversation } from '@/types';

const pageVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, staggerChildren: 0.08 } },
  exit: { opacity: 0, x: -30 },
};

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function StagePlayPage() {
  const params = useParams<{ id: string; stageId: string }>();
  const router = useRouter();
  const { id: questId, stageId } = params;

  const { data: quest, loading: questLoading, execute: fetchQuest } = useQuery<Quest>(GET_QUEST);
  const { data: progress, execute: fetchProgress } = useQuery<Progress>(GET_PROGRESS);
  const { execute: createConversation, loading: creatingConversation } = useMutation<Conversation>(CREATE_CONVERSATION);

  useEffect(() => {
    fetchQuest({ id: questId });
    fetchProgress({ questId });
  }, [questId, fetchQuest, fetchProgress]);

  const stage = useMemo(
    () => quest?.stages?.find((s) => s.id === stageId) ?? null,
    [quest, stageId],
  );

  const stageIndex = useMemo(
    () => quest?.stages?.findIndex((s) => s.id === stageId) ?? -1,
    [quest, stageId],
  );

  const completedStageIds = useMemo(
    () => new Set(progress?.completedStages?.map((s) => s.stageId) ?? []),
    [progress],
  );

  const isStageCompleted = completedStageIds.has(stageId);

  const previousStageResult = useMemo(() => {
    if (!progress?.completedStages || stageIndex <= 0) return null;
    const prevStage = quest?.stages?.find((s) => s.order === (stage?.order ?? 1) - 1);
    if (!prevStage) return null;
    return progress.completedStages.find((cs) => cs.stageId === prevStage.id) ?? null;
  }, [progress, quest, stage, stageIndex]);

  const handleStartConversation = async () => {
    try {
      const conversation = await createConversation({
        input: { questId, stageId },
      });
      if (conversation?.id) {
        router.push(`/voice-chat/${conversation.id}`);
      }
    } catch {
      // Error handled by hook
    }
  };

  if (questLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quest || !stage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card padding="lg">
          <p className="text-slate-400">Stage not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push(`/quest-play/${questId}`)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <p className="text-xs text-violet-400 font-medium uppercase tracking-wider">
            Stage {stage.order} of {quest.stages.length}
          </p>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">
            {stage.title}
          </h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
          <Star size={14} className="text-violet-400" />
          <span className="text-violet-400 font-semibold text-sm">{stage.points} pts</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Stage briefing */}
          <motion.div variants={itemVariants}>
            <Card variant="elevated" padding="lg">
              <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
                <Target size={16} className="text-violet-400" />
                Mission Briefing
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">{stage.description}</p>

              <div className="mt-4 p-3 rounded-xl bg-white/5 flex items-center gap-3">
                <MapPin size={16} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{stage.location.name}</p>
                  {stage.location.address && (
                    <p className="text-slate-400 text-xs mt-0.5">{stage.location.address}</p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Character introduction */}
          <motion.div variants={itemVariants}>
            <Card variant="elevated" padding="lg">
              <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <User size={16} className="text-violet-400" />
                Character
              </h3>
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                  {stage.character.avatarUrl ? (
                    <img
                      src={stage.character.avatarUrl}
                      alt={stage.character.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-heading font-bold text-white">
                      {stage.character.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-heading font-bold text-white">{stage.character.name}</h4>
                  <p className="text-violet-400 text-sm">{stage.character.role}</p>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed line-clamp-3">
                    {stage.character.backstory}
                  </p>
                </div>
              </div>

              {/* Greeting preview */}
              <div className="mt-4 p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
                <div className="flex items-start gap-2">
                  <MessageSquare size={14} className="text-violet-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300 text-sm italic">
                    &quot;{stage.character.greetingMessage}&quot;
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Challenge description */}
          <motion.div variants={itemVariants}>
            <Card variant="elevated" padding="lg">
              <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                Challenge
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-xs font-medium capitalize">
                    {stage.challenge.type}
                  </span>
                  {stage.challenge.maxAttempts && (
                    <span className="text-xs text-slate-500">
                      Max {stage.challenge.maxAttempts} attempts
                    </span>
                  )}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {stage.challenge.description}
                </p>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wider">
                    Success Criteria
                  </p>
                  <p className="text-slate-300 text-sm">{stage.challenge.successCriteria}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Previous stage results */}
          {previousStageResult && (
            <motion.div variants={itemVariants}>
              <Card padding="md" className="border-emerald-500/20">
                <h4 className="font-heading font-semibold text-white mb-2 text-sm flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  Previous Stage Result
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-emerald-400 font-bold">{previousStageResult.points}</p>
                    <p className="text-[10px] text-slate-500">Points</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-violet-400 font-bold">{previousStageResult.attempts}</p>
                    <p className="text-[10px] text-slate-500">Attempts</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-amber-400 font-bold">
                      {Math.floor(previousStageResult.duration / 60)}m
                    </p>
                    <p className="text-[10px] text-slate-500">Duration</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Action button */}
          <motion.div variants={itemVariants}>
            {isStageCompleted ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <Check size={20} className="text-emerald-400" />
                <span className="text-emerald-400 font-medium">Stage Completed</span>
              </div>
            ) : (
              <Button
                fullWidth
                size="lg"
                leftIcon={MessageSquare}
                rightIcon={ChevronRight}
                loading={creatingConversation}
                onClick={handleStartConversation}
              >
                Start Conversation
              </Button>
            )}
          </motion.div>
        </div>

        {/* Right column - Map */}
        <motion.div variants={itemVariants} className="lg:sticky lg:top-8 lg:self-start">
          <Card padding="none" className="overflow-hidden">
            <QuestMap
              stages={stage ? [stage] : []}
              currentStageIndex={0}
              completedStageIds={completedStageIds}
              height="400px"
              interactive={true}
            />
          </Card>

          {/* Hints */}
          {stage.hints.length > 0 && (
            <Card padding="md" className="mt-4">
              <h4 className="font-heading font-semibold text-white text-sm mb-3">Hints</h4>
              <div className="space-y-2">
                {stage.hints.map((hint, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                    <span className="text-xs text-violet-400 font-mono mt-0.5">{i + 1}.</span>
                    <p className="text-xs text-slate-400">{hint}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
