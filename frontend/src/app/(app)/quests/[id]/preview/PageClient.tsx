'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  MapPin,
  MessageSquare,
  User,
  Target,
  Sparkles,
  Lock,
  Play,
  Eye,
} from 'lucide-react';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_QUEST } from '@/lib/graphql/queries';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { Quest } from '@/types';

const PREVIEW_TIME_LIMIT = 2 * 60; // 2 minutes in seconds

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.08 } },
  exit: { opacity: 0, y: -20 },
};

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const watermarkVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.5 } },
};

const unlockVariants = {
  initial: { opacity: 0, y: 40, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 40 },
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function QuestPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const questId = params.id as string;

  const { data: quest, loading, execute: fetchQuest } = useQuery<Quest>(GET_QUEST);

  const [timeRemaining, setTimeRemaining] = useState(PREVIEW_TIME_LIMIT);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showUnlockCTA, setShowUnlockCTA] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (questId) fetchQuest({ id: questId });
  }, [questId, fetchQuest]);

  // Timer logic
  useEffect(() => {
    if (!isTimerActive) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerActive(false);
          setShowUnlockCTA(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive]);

  const handleStartPreview = useCallback(() => {
    setIsTimerActive(true);
  }, []);

  const handleUnlock = useCallback(() => {
    router.push(`/quests/${questId}`);
  }, [router, questId]);

  if (loading || !quest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const firstStage = quest.stages
    .slice()
    .sort((a, b) => a.order - b.order)[0];

  if (!firstStage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card padding="lg">
          <p className="text-slate-400">This quest has no stages yet.</p>
        </Card>
      </div>
    );
  }

  const progressPercent = ((PREVIEW_TIME_LIMIT - timeRemaining) / PREVIEW_TIME_LIMIT) * 100;
  const isLow = timeRemaining <= 30;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen relative"
    >
      {/* Watermark overlay */}
      <motion.div
        variants={watermarkVariants}
        className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
      >
        <p className="text-white/[0.06] text-[6rem] md:text-[10rem] font-heading font-black select-none -rotate-12 whitespace-nowrap">
          Vista previa
        </p>
      </motion.div>

      {/* Preview timer bar */}
      <div className="sticky top-0 z-30 bg-navy-950/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-violet-400" />
              <span className="text-sm font-medium text-white">Vista previa</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock size={14} className={isLow ? 'text-rose-400' : 'text-slate-400'} />
              <span
                className={`text-sm font-mono font-semibold ${
                  isLow ? 'text-rose-400' : 'text-white'
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
            {!isTimerActive && timeRemaining === PREVIEW_TIME_LIMIT && (
              <Button size="sm" onClick={handleStartPreview} leftIcon={Play}>
                Iniciar demo
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-navy-800">
          <motion.div
            className={`h-full ${isLow ? 'bg-rose-500' : 'bg-violet-500'}`}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Content: First stage only */}
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        {/* Quest header */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <span className="text-xs px-3 py-1 rounded-full bg-violet-500/15 text-violet-400 font-medium border border-violet-500/20">
            Stage 1 de {quest.stages.length}
          </span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
            {quest.title}
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">{quest.description}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stage briefing */}
          <motion.div variants={itemVariants} className="space-y-5">
            <Card variant="elevated" padding="lg">
              <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
                <Target size={16} className="text-violet-400" />
                {firstStage.title}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">{firstStage.description}</p>

              <div className="mt-4 p-3 rounded-xl bg-white/5 flex items-center gap-3">
                <MapPin size={16} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{firstStage.location.name}</p>
                  {firstStage.location.address && (
                    <p className="text-slate-400 text-xs mt-0.5">{firstStage.location.address}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Character preview */}
            <Card variant="elevated" padding="lg">
              <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <User size={16} className="text-violet-400" />
                Personaje
              </h3>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                  {firstStage.character.avatarUrl ? (
                    <img
                      src={firstStage.character.avatarUrl}
                      alt={firstStage.character.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="text-xl font-heading font-bold text-white">
                      {firstStage.character.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-heading font-bold text-white">{firstStage.character.name}</h4>
                  <p className="text-violet-400 text-sm">{firstStage.character.role}</p>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed line-clamp-2">
                    {firstStage.character.backstory}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
                <div className="flex items-start gap-2">
                  <MessageSquare size={14} className="text-violet-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300 text-sm italic">
                    &quot;{firstStage.character.greetingMessage}&quot;
                  </p>
                </div>
              </div>
            </Card>

            {/* Challenge */}
            <Card variant="elevated" padding="lg">
              <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                Desafio
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-xs font-medium capitalize">
                {firstStage.challenge.type}
              </span>
              <p className="text-slate-300 text-sm leading-relaxed mt-3">
                {firstStage.challenge.description}
              </p>
            </Card>
          </motion.div>

          {/* Locked stages teaser */}
          <motion.div variants={itemVariants} className="space-y-4">
            <Card padding="lg" className="border-violet-500/20">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto">
                  <Eye size={24} className="text-violet-400" />
                </div>
                <h3 className="font-heading font-semibold text-white">Modo Vista Previa</h3>
                <p className="text-slate-400 text-sm">
                  Explora la primera etapa de esta quest. Desbloquea la quest completa para acceder
                  a las {quest.stages.length} etapas y ganar {quest.totalPoints} puntos.
                </p>
              </div>
            </Card>

            {/* Locked stage indicators */}
            {quest.stages
              .slice()
              .sort((a, b) => a.order - b.order)
              .slice(1)
              .map((stage) => (
                <div
                  key={stage.id}
                  className="glass rounded-xl p-4 border border-slate-700/30 opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-navy-800 flex items-center justify-center flex-shrink-0">
                      <Lock size={16} className="text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-semibold text-white text-sm truncate">
                        {stage.title}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{stage.description}</p>
                    </div>
                    <span className="text-xs text-slate-600 font-medium">{stage.points} pts</span>
                  </div>
                </div>
              ))}
          </motion.div>
        </div>
      </div>

      {/* Unlock CTA overlay */}
      <AnimatePresence>
        {showUnlockCTA && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowUnlockCTA(false)} />
            <div className="relative glass rounded-2xl p-8 max-w-md w-full border border-violet-500/30 shadow-2xl shadow-violet-500/20 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 flex items-center justify-center mx-auto shadow-lg shadow-violet-500/30">
                <Lock size={28} className="text-white" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-white">
                Vista previa finalizada
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Has explorado la primera etapa de &quot;{quest.title}&quot;. Desbloquea la quest
                completa para vivir la aventura entera con {quest.stages.length} etapas y{' '}
                {quest.totalPoints} puntos.
              </p>
              <div className="flex flex-col gap-3">
                <Button fullWidth size="lg" onClick={handleUnlock} leftIcon={Play}>
                  Desbloquear quest completa
                </Button>
                <Button
                  fullWidth
                  size="md"
                  variant="ghost"
                  onClick={() => router.push('/quests')}
                >
                  Explorar otras quests
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
