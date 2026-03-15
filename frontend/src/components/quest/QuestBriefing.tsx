'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Swords,
  Clock,
  Zap,
  Shield,
  ChevronRight,
  SkipForward,
  User,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Handshake,
  Megaphone,
  Compass,
  Lightbulb,
  Star,
} from 'lucide-react';
import type { Quest, Stage, ChallengeType } from '@/types';

// ---------- Types ----------

interface QuestBriefingProps {
  quest: Quest;
  onAccept: () => void;
  onSkip?: () => void;
  isReturningPlayer?: boolean;
}

// ---------- Typewriter ----------

function TypewriterReveal({
  text,
  delay = 0,
  speed = 25,
  onComplete,
  className = '',
}: {
  text: string;
  delay?: number;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const timer = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(timer);
          setDone(true);
          onComplete?.();
        }
      }, speed);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay, speed, onComplete]);

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="animate-pulse text-violet-400">|</span>}
    </span>
  );
}

// ---------- Helpers ----------

const challengeIcons: Record<ChallengeType, React.ElementType> = {
  conversation: MessageSquare,
  riddle: HelpCircle,
  knowledge: BookOpen,
  negotiation: Handshake,
  persuasion: Megaphone,
  exploration: Compass,
  trivia: Lightbulb,
};

const difficultyConfig = {
  easy: { label: 'Easy', color: 'text-emerald-400', bg: 'bg-emerald-500/15', bars: 1 },
  medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/15', bars: 2 },
  hard: { label: 'Hard', color: 'text-rose-400', bg: 'bg-rose-500/15', bars: 3 },
  legendary: { label: 'Legendary', color: 'text-violet-400', bg: 'bg-violet-500/15', bars: 4 },
};

// ---------- Component ----------

export default function QuestBriefing({
  quest,
  onAccept,
  onSkip,
  isReturningPlayer = false,
}: QuestBriefingProps) {
  const [phase, setPhase] = useState<'intro' | 'characters' | 'challenges' | 'ready'>('intro');
  const [charsRevealed, setCharsRevealed] = useState(0);
  const diff = difficultyConfig[quest.difficulty];

  // Auto-progress phases
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('characters'), 3000),
      setTimeout(() => setPhase('challenges'), 3000 + quest.stages.length * 800 + 1000),
      setTimeout(() => setPhase('ready'), 3000 + quest.stages.length * 800 + 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [quest.stages.length]);

  // Reveal characters one by one
  useEffect(() => {
    if (phase !== 'characters') return;
    const uniqueChars = quest.stages.map(s => s.character.name);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setCharsRevealed(i);
      if (i >= uniqueChars.length) clearInterval(timer);
    }, 800);
    return () => clearInterval(timer);
  }, [phase, quest.stages]);

  const uniqueCharacters = Array.from(
    new Map(quest.stages.map(s => [s.character.name, s.character])).values(),
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-navy-950/95 backdrop-blur-xl flex items-center justify-center overflow-hidden"
    >
      {/* Cinematic dark overlay vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Animated grid lines (cinematic feel) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Floating orbs */}
      <motion.div
        animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 right-20 w-64 h-64 rounded-full bg-violet-600/5 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [15, -15, 15], x: [10, -10, 10] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-emerald-600/5 blur-3xl pointer-events-none"
      />

      {/* Skip button */}
      {isReturningPlayer && onSkip && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={onSkip}
          className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm hover:text-white hover:bg-white/10 transition-all"
        >
          <SkipForward className="w-4 h-4" />
          Skip Briefing
        </motion.button>
      )}

      {/* Main content */}
      <div className="relative z-10 max-w-2xl w-full mx-4">
        {/* Quest title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.5, duration: 1 }}
            className="h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent mb-6 mx-auto max-w-md"
          />

          <div className="flex items-center justify-center gap-3 mb-3">
            <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider ${diff.bg} ${diff.color}`}>
              {diff.label}
            </span>
            <span className="text-xs text-slate-600">|</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock size={10} />
              {quest.estimatedDuration} min
            </span>
            <span className="text-xs text-slate-600">|</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Zap size={10} />
              {quest.totalPoints} pts
            </span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            {quest.title}
          </h1>
        </motion.div>

        {/* Description typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="glass rounded-2xl border border-white/10 p-6 mb-8"
        >
          <p className="text-slate-300 leading-relaxed text-sm md:text-base">
            <TypewriterReveal text={quest.description} delay={1000} speed={20} />
          </p>
        </motion.div>

        {/* Characters reveal */}
        <AnimatePresence>
          {(phase === 'characters' || phase === 'challenges' || phase === 'ready') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                <User className="w-3 h-3" />
                Characters You Will Meet
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {uniqueCharacters.map((char, i) => (
                  <motion.div
                    key={char.name}
                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                    animate={i < charsRevealed ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.8, x: -20 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="flex-shrink-0 w-36 glass rounded-xl border border-white/10 p-4 text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-violet-500/20 mx-auto mb-2 flex items-center justify-center">
                      <span className="text-lg font-bold text-violet-300">{char.name[0]}</span>
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{char.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{char.role}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Challenge previews */}
        <AnimatePresence>
          {(phase === 'challenges' || phase === 'ready') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                <Swords className="w-3 h-3" />
                Challenge Preview &middot; {quest.stages.length} Stages
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quest.stages.slice(0, 6).map((stage, i) => {
                  const ChallengeIcon = challengeIcons[stage.challenge.type] || Compass;
                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass rounded-xl border border-white/5 p-3 flex items-center gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <ChallengeIcon className="w-4 h-4 text-violet-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{stage.title}</p>
                        <p className="text-[10px] text-slate-500 capitalize">{stage.challenge.type}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Difficulty bars */}
        <AnimatePresence>
          {phase === 'ready' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <div className="flex items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <Shield className={`w-4 h-4 ${diff.color}`} />
                  <span className="text-xs text-slate-400">Difficulty</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(n => (
                      <motion.div
                        key={n}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.1 * n }}
                        className={`w-2 rounded-full ${n <= diff.bars ? diff.bg.replace('/15', '') : 'bg-slate-700'}`}
                        style={{ height: 8 + n * 4 }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-400">{quest.location.name}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Accept button */}
        <AnimatePresence>
          {phase === 'ready' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAccept}
                className="relative px-10 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-heading text-lg font-bold shadow-2xl shadow-violet-600/30 overflow-hidden group"
              >
                {/* Animated glow sweep */}
                <motion.div
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
                <span className="relative flex items-center gap-3">
                  <Swords className="w-5 h-5" />
                  Accept Quest
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.5, duration: 1 }}
          className="h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent mt-10 mx-auto max-w-md"
        />
      </div>
    </motion.div>
  );
}
