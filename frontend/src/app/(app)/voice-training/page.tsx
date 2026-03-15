'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Volume2,
  Timer,
  ChevronRight,
  RotateCcw,
  Star,
  CheckCircle,
  Play,
  Pause,
  Lightbulb,
  MessageSquare,
  Zap,
  Smile,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import MicrophoneTest from '@/components/voice/MicrophoneTest';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface Exercise {
  id: string;
  category: 'tongue_twister' | 'pronunciation' | 'improvisation';
  title: string;
  instruction: string;
  text?: string;
  duration: number; // seconds
  tips?: string[];
}

type SessionPhase = 'setup' | 'warmup' | 'complete';

/* ─── Constants ──────────────────────────────────────────────────────── */

const WARMUP_DURATION = 5 * 60; // 5 minutes in seconds

const EXERCISES: Exercise[] = [
  {
    id: 'tt-1',
    category: 'tongue_twister',
    title: 'Red Lorry, Yellow Lorry',
    instruction: 'Repeat this tongue twister 3 times, increasing speed each time.',
    text: 'Red lorry, yellow lorry, red lorry, yellow lorry.',
    duration: 30,
    tips: ['Focus on the L and R sounds', 'Start slowly, then accelerate'],
  },
  {
    id: 'tt-2',
    category: 'tongue_twister',
    title: 'Peter Piper',
    instruction: 'Say the full tongue twister clearly and steadily.',
    text: 'Peter Piper picked a peck of pickled peppers. A peck of pickled peppers Peter Piper picked.',
    duration: 30,
    tips: ['Emphasize the P sounds', 'Keep a steady rhythm'],
  },
  {
    id: 'tt-3',
    category: 'tongue_twister',
    title: 'She Sells Seashells',
    instruction: 'Alternate between the S and SH sounds clearly.',
    text: 'She sells seashells by the seashore. The shells she sells are seashells, I\'m sure.',
    duration: 30,
    tips: ['Distinguish between S and SH', 'Maintain clear diction'],
  },
  {
    id: 'pr-1',
    category: 'pronunciation',
    title: 'Vowel Warm-Up',
    instruction: 'Pronounce each vowel sound slowly and clearly: A, E, I, O, U. Hold each for 2 seconds.',
    duration: 30,
    tips: ['Open your mouth wide for A', 'Feel the vibration in your chest'],
  },
  {
    id: 'pr-2',
    category: 'pronunciation',
    title: 'Consonant Pairs',
    instruction: 'Alternate between these paired consonants: B/P, D/T, G/K. Feel the difference.',
    text: 'Ba-Pa, Da-Ta, Ga-Ka. Repeat each pair three times.',
    duration: 30,
    tips: ['Notice voiced vs unvoiced pairs', 'Place a hand on your throat to feel vibration'],
  },
  {
    id: 'pr-3',
    category: 'pronunciation',
    title: 'Breath Control',
    instruction: 'Take a deep breath and count as high as you can on a single exhale, maintaining volume.',
    duration: 45,
    tips: ['Breathe from your diaphragm', 'Keep consistent volume'],
  },
  {
    id: 'im-1',
    category: 'improvisation',
    title: 'One Word Story',
    instruction: 'Build a story by adding one sentence at a time. Each sentence must start with the last word of the previous one.',
    duration: 60,
    tips: ['Don\'t overthink it', 'Focus on storytelling flow'],
  },
  {
    id: 'im-2',
    category: 'improvisation',
    title: 'Character Switch',
    instruction: 'Describe your day as if you were: a pirate, a robot, then a news anchor. Switch every 20 seconds.',
    duration: 60,
    tips: ['Change your tone and vocabulary', 'Stay in character'],
  },
  {
    id: 'im-3',
    category: 'improvisation',
    title: 'Emotion Escalator',
    instruction: 'Say "I can\'t believe this is happening" starting calm, then progressively adding more emotion with each repetition.',
    duration: 45,
    tips: ['Use your full range', 'Let your body language match'],
  },
];

const CATEGORY_CONFIG = {
  tongue_twister: {
    label: 'Tongue Twisters',
    icon: MessageSquare,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/15',
  },
  pronunciation: {
    label: 'Pronunciation',
    icon: Volume2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
  },
  improvisation: {
    label: 'Improvisation',
    icon: Zap,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
  },
};

const TIPS = [
  'Warm up your voice before every quest for better AI conversations.',
  'Speak clearly and at a moderate pace for best recognition.',
  'Use varied tone and expression to make conversations more natural.',
  'Stay hydrated - drink water before voice sessions.',
  'Stand up while speaking for better breath support.',
  'Smile while speaking - it changes the tone of your voice.',
];

/* ─── Helpers ────────────────────────────────────────────────────────── */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ─── Main Page ──────────────────────────────────────────────────────── */

export default function VoiceTrainingPage() {
  const [phase, setPhase] = useState<SessionPhase>('setup');
  const [micReady, setMicReady] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [exerciseTimeLeft, setExerciseTimeLeft] = useState(0);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(WARMUP_DURATION);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [randomTip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  const exerciseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentExercise = EXERCISES[currentExerciseIndex];
  const categoryConfig = CATEGORY_CONFIG[currentExercise.category];
  const CategoryIcon = categoryConfig.icon;

  const progress = useMemo(() => {
    return completedExercises.size / EXERCISES.length;
  }, [completedExercises]);

  /* ─── Session timer ────────────────────────────────────────────── */

  useEffect(() => {
    if (phase !== 'warmup') return;

    sessionTimerRef.current = setInterval(() => {
      setSessionTimeLeft((prev) => {
        if (prev <= 1) {
          setPhase('complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [phase]);

  /* ─── Exercise timer ───────────────────────────────────────────── */

  useEffect(() => {
    if (!isExerciseActive) return;

    exerciseTimerRef.current = setInterval(() => {
      setExerciseTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExerciseActive(false);
          setCompletedExercises((s) => new Set(s).add(currentExercise.id));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (exerciseTimerRef.current) clearInterval(exerciseTimerRef.current);
    };
  }, [isExerciseActive, currentExercise.id]);

  /* ─── Handlers ─────────────────────────────────────────────────── */

  const startExercise = useCallback(() => {
    setExerciseTimeLeft(currentExercise.duration);
    setIsExerciseActive(true);
  }, [currentExercise]);

  const pauseExercise = useCallback(() => {
    setIsExerciseActive(false);
  }, []);

  const skipExercise = useCallback(() => {
    setIsExerciseActive(false);
    setCompletedExercises((s) => new Set(s).add(currentExercise.id));
    if (currentExerciseIndex < EXERCISES.length - 1) {
      setCurrentExerciseIndex((i) => i + 1);
    }
  }, [currentExercise.id, currentExerciseIndex]);

  const nextExercise = useCallback(() => {
    if (currentExerciseIndex < EXERCISES.length - 1) {
      setCurrentExerciseIndex((i) => i + 1);
      setIsExerciseActive(false);
      setExerciseTimeLeft(0);
    } else {
      setPhase('complete');
    }
  }, [currentExerciseIndex]);

  const startWarmup = useCallback(() => {
    setPhase('warmup');
    setSessionTimeLeft(WARMUP_DURATION);
  }, []);

  const restartSession = useCallback(() => {
    setPhase('setup');
    setCurrentExerciseIndex(0);
    setCompletedExercises(new Set());
    setSessionTimeLeft(WARMUP_DURATION);
    setConfidence(null);
    setMicReady(false);
  }, []);

  /* ─── Render ───────────────────────────────────────────────────── */

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Link
          href="/dashboard"
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={16} className="text-slate-400" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Voice Training</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Warm up before your next quest
          </p>
        </div>
      </motion.div>

      {/* ─── Setup Phase ──────────────────────────────────────────── */}
      {phase === 'setup' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Mic test */}
          <MicrophoneTest
            onTestComplete={(success) => setMicReady(success)}
          />

          {/* Tip card */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb size={14} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white mb-1">Pro Tip</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {randomTip}
                </p>
              </div>
            </div>
          </div>

          {/* Exercise overview */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">
              Session Overview
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                const count = EXERCISES.filter(
                  (e) => e.category === key,
                ).length;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5"
                  >
                    <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                      <Icon size={14} className={config.color} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">
                        {count}
                      </p>
                      <p className="text-[10px] text-slate-500">{config.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Timer size={12} />
              <span>5 minute warm-up session</span>
            </div>
          </div>

          {/* Start button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={startWarmup}
            disabled={!micReady}
            className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
              micReady
                ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-500 hover:to-violet-400 shadow-lg shadow-violet-500/20'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            {micReady ? (
              <span className="flex items-center justify-center gap-2">
                <Mic size={16} />
                Start Warm-Up Session
              </span>
            ) : (
              'Complete mic test to start'
            )}
          </motion.button>
        </motion.div>
      )}

      {/* ─── Warmup Phase ─────────────────────────────────────────── */}
      {phase === 'warmup' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Session timer */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Timer size={14} className="text-violet-400" />
                <span className="text-xs font-medium text-white">Session Time</span>
              </div>
              <span className="text-sm font-mono font-bold text-violet-400">
                {formatTime(sessionTimeLeft)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
                animate={{
                  width: `${(sessionTimeLeft / WARMUP_DURATION) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Exercise progress */}
          <div className="flex items-center gap-1.5 px-1">
            {EXERCISES.map((ex, i) => (
              <div
                key={ex.id}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  completedExercises.has(ex.id)
                    ? 'bg-emerald-500'
                    : i === currentExerciseIndex
                      ? 'bg-violet-500'
                      : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Current exercise card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentExercise.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${categoryConfig.bgColor} flex items-center justify-center`}>
                  <CategoryIcon size={14} className={categoryConfig.color} />
                </div>
                <div>
                  <span className={`text-[10px] font-medium ${categoryConfig.color}`}>
                    {categoryConfig.label}
                  </span>
                  <h3 className="text-sm font-semibold text-white">
                    {currentExercise.title}
                  </h3>
                </div>
                <div className="ml-auto text-[10px] text-slate-500">
                  {currentExerciseIndex + 1}/{EXERCISES.length}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {currentExercise.instruction}
              </p>

              {currentExercise.text && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-3">
                  <p className="text-sm text-white font-medium italic leading-relaxed">
                    &ldquo;{currentExercise.text}&rdquo;
                  </p>
                </div>
              )}

              {/* Tips */}
              {currentExercise.tips && (
                <div className="space-y-1.5 mb-4">
                  {currentExercise.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Lightbulb size={10} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="text-[11px] text-slate-400">{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Exercise timer */}
              {isExerciseActive && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400">Exercise time</span>
                    <span className="text-xs font-mono text-white">
                      {formatTime(exerciseTimeLeft)}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-emerald-500"
                      animate={{
                        width: `${(exerciseTimeLeft / currentExercise.duration) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center gap-2">
                {!isExerciseActive && !completedExercises.has(currentExercise.id) && (
                  <button
                    onClick={startExercise}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors cursor-pointer"
                  >
                    <Play size={14} />
                    Start Exercise
                  </button>
                )}

                {isExerciseActive && (
                  <button
                    onClick={pauseExercise}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors cursor-pointer"
                  >
                    <Pause size={14} />
                    Pause
                  </button>
                )}

                {completedExercises.has(currentExercise.id) && (
                  <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                    <CheckCircle size={14} />
                    Completed
                  </div>
                )}

                {completedExercises.has(currentExercise.id) && currentExerciseIndex < EXERCISES.length - 1 && (
                  <button
                    onClick={nextExercise}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                )}

                {completedExercises.has(currentExercise.id) && currentExerciseIndex === EXERCISES.length - 1 && (
                  <button
                    onClick={() => setPhase('complete')}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors cursor-pointer"
                  >
                    Finish
                    <ChevronRight size={14} />
                  </button>
                )}

                {!completedExercises.has(currentExercise.id) && (
                  <button
                    onClick={skipExercise}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Skip
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* ─── Complete Phase ────────────────────────────────────────── */}
      {phase === 'complete' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Completion card */}
          <div className="glass rounded-2xl p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle size={32} className="text-emerald-400" />
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-1">
              Warm-Up Complete!
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              You completed {completedExercises.size} of {EXERCISES.length} exercises
            </p>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-white/5 overflow-hidden max-w-xs mx-auto mb-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              />
            </div>

            {/* Confidence self-assessment */}
            <div className="mb-6">
              <p className="text-xs text-slate-300 mb-3">
                Rate your confidence for voice interactions
              </p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setConfidence(star)}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      className={
                        confidence !== null && star <= confidence
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }
                    />
                  </button>
                ))}
              </div>
              {confidence !== null && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[11px] text-slate-400 mt-2"
                >
                  {confidence <= 2
                    ? 'Keep practicing! Consistency builds confidence.'
                    : confidence <= 4
                      ? 'Looking good! You\'re warming up nicely.'
                      : 'You\'re ready to take on any quest!'}
                </motion.p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={restartSession}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
                Restart
              </button>
              <Link
                href="/quests"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
              >
                <Smile size={14} />
                Start a Quest
              </Link>
            </div>
          </div>

          {/* Tips for better voice */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Lightbulb size={14} className="text-amber-400" />
              Tips for Better Voice Interactions
            </h3>
            <ul className="space-y-2">
              {[
                'Speak at a conversational pace - not too fast, not too slow.',
                'Use a quiet environment to reduce background noise.',
                'Stay in character to get the best quest experience.',
                'Don\'t be afraid to improvise and be creative!',
                'Take short pauses between sentences for clarity.',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                  <span className="text-[11px] text-slate-400 leading-relaxed">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
