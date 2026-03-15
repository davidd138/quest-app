'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Emotion types ──────────────────────────────────────────────────── */

export type Emotion =
  | 'happy'
  | 'thinking'
  | 'surprised'
  | 'challenging'
  | 'angry'
  | 'sad'
  | 'excited'
  | 'neutral';

interface EmotionConfig {
  emoji: string;
  label: string;
  ringColor: string;
  bgColor: string;
  glowColor: string;
}

const emotionConfigs: Record<Emotion, EmotionConfig> = {
  happy: {
    emoji: '\u{1F60A}',
    label: 'Happy',
    ringColor: 'border-emerald-400',
    bgColor: 'bg-emerald-500/10',
    glowColor: 'shadow-emerald-500/30',
  },
  thinking: {
    emoji: '\u{1F914}',
    label: 'Thinking',
    ringColor: 'border-amber-400',
    bgColor: 'bg-amber-500/10',
    glowColor: 'shadow-amber-500/30',
  },
  surprised: {
    emoji: '\u{1F632}',
    label: 'Surprised',
    ringColor: 'border-sky-400',
    bgColor: 'bg-sky-500/10',
    glowColor: 'shadow-sky-500/30',
  },
  challenging: {
    emoji: '\u{2694}\u{FE0F}',
    label: 'Challenging',
    ringColor: 'border-violet-400',
    bgColor: 'bg-violet-500/10',
    glowColor: 'shadow-violet-500/30',
  },
  angry: {
    emoji: '\u{1F620}',
    label: 'Angry',
    ringColor: 'border-rose-400',
    bgColor: 'bg-rose-500/10',
    glowColor: 'shadow-rose-500/30',
  },
  sad: {
    emoji: '\u{1F622}',
    label: 'Sad',
    ringColor: 'border-blue-400',
    bgColor: 'bg-blue-500/10',
    glowColor: 'shadow-blue-500/30',
  },
  excited: {
    emoji: '\u{1F929}',
    label: 'Excited',
    ringColor: 'border-fuchsia-400',
    bgColor: 'bg-fuchsia-500/10',
    glowColor: 'shadow-fuchsia-500/30',
  },
  neutral: {
    emoji: '\u{1F610}',
    label: 'Neutral',
    ringColor: 'border-slate-400',
    bgColor: 'bg-slate-500/10',
    glowColor: 'shadow-slate-500/30',
  },
};

/* ─── Keyword → emotion mapping ──────────────────────────────────────── */

const emotionKeywords: Record<Emotion, string[]> = {
  happy: ['great', 'wonderful', 'excellent', 'fantastic', 'love', 'happy', 'glad', 'pleased', 'brilliant', 'perfect', 'amazing', 'well done', 'congratulations'],
  thinking: ['hmm', 'perhaps', 'consider', 'think', 'maybe', 'wonder', 'interesting', 'curious', 'ponder', 'let me see', 'reflect'],
  surprised: ['wow', 'oh', 'really', 'unexpected', 'incredible', 'astonishing', 'whoa', 'remarkable', 'unbelievable', 'no way'],
  challenging: ['dare', 'challenge', 'prove', 'show me', 'test', 'try', 'brave', 'courage', 'fight', 'battle', 'quest'],
  angry: ['anger', 'furious', 'outrage', 'terrible', 'unacceptable', 'rage', 'hate', 'disgust', 'awful', 'horrible'],
  sad: ['sad', 'sorry', 'unfortunate', 'regret', 'miss', 'lonely', 'sorrow', 'grief', 'tears', 'pity', 'alas'],
  excited: ['exciting', 'thrill', 'adventure', 'rush', 'eager', 'can\'t wait', 'ready', 'let\'s go', 'epic', 'legendary'],
  neutral: [],
};

/** Analyse a transcript string and return the most likely emotion. */
export function detectEmotion(text: string): Emotion {
  if (!text) return 'neutral';

  const lower = text.toLowerCase();
  let best: Emotion = 'neutral';
  let bestScore = 0;

  for (const [emotion, keywords] of Object.entries(emotionKeywords) as [Emotion, string[]][]) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = emotion;
    }
  }

  return best;
}

/* ─── Component ──────────────────────────────────────────────────────── */

interface EmotionIndicatorProps {
  /** Directly set the emotion. Takes precedence over transcript analysis. */
  emotion?: Emotion;
  /** Transcript text to analyse for emotional cues. */
  transcript?: string;
  /** Size of the indicator in pixels. */
  size?: number;
  className?: string;
}

const EmotionIndicator: React.FC<EmotionIndicatorProps> = ({
  emotion: emotionProp,
  transcript,
  size = 64,
  className = '',
}) => {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>(emotionProp ?? 'neutral');
  const [isPulsing, setIsPulsing] = useState(false);
  const prevEmotionRef = useRef<Emotion>(currentEmotion);

  // Derive emotion from transcript when no explicit emotion is provided
  const derivedEmotion = useMemo(() => {
    if (emotionProp) return emotionProp;
    return detectEmotion(transcript ?? '');
  }, [emotionProp, transcript]);

  useEffect(() => {
    if (derivedEmotion !== prevEmotionRef.current) {
      setIsPulsing(true);
      setCurrentEmotion(derivedEmotion);
      prevEmotionRef.current = derivedEmotion;

      const timer = setTimeout(() => setIsPulsing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [derivedEmotion]);

  const config = emotionConfigs[currentEmotion];
  const emojiSize = Math.round(size * 0.45);

  return (
    <div className={['flex flex-col items-center gap-1.5', className].join(' ')}>
      {/* Emotion ring */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Outer glow ring */}
        <motion.div
          className={[
            'absolute inset-0 rounded-full border-2',
            config.ringColor,
            config.bgColor,
            isPulsing ? `shadow-lg ${config.glowColor}` : '',
          ].join(' ')}
          animate={
            isPulsing
              ? { scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }
              : { scale: 1, opacity: 1 }
          }
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />

        {/* Animated pulse ring on emotion change */}
        <AnimatePresence>
          {isPulsing && (
            <motion.div
              className={`absolute inset-0 rounded-full border ${config.ringColor} opacity-40`}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* Emoji */}
        <AnimatePresence mode="wait">
          <motion.span
            key={currentEmotion}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 30 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="relative z-10 select-none"
            style={{ fontSize: emojiSize }}
            role="img"
            aria-label={config.label}
          >
            {config.emoji}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={currentEmotion}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-[10px] font-medium text-slate-400 uppercase tracking-wider"
        >
          {config.label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default EmotionIndicator;
