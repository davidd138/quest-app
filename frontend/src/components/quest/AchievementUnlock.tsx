'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, X } from 'lucide-react';

// ---------- Types ----------

interface AchievementUnlockProps {
  visible: boolean;
  title: string;
  description: string;
  icon?: React.ReactNode;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  onDismiss?: () => void;
  autoDismissMs?: number;
}

// ---------- Particles ----------

function ParticleBurst({ color }: { color: string }) {
  const particles = Array.from({ length: 40 });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => {
        const angle = (i / 40) * Math.PI * 2;
        const distance = 80 + Math.random() * 160;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const size = 3 + Math.random() * 5;
        const delay = Math.random() * 0.3;

        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x, y, scale: 0, opacity: 0 }}
            transition={{ duration: 1 + Math.random() * 0.5, delay, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              marginLeft: -size / 2,
              marginTop: -size / 2,
            }}
          />
        );
      })}
    </div>
  );
}

// ---------- Typewriter ----------

function TypewriterText({ text, delay = 0, speed = 40 }: { text: string; delay?: number; speed?: number }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const timer = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(timer);
      }, speed);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay, speed]);

  return <span>{displayed}<span className="animate-pulse">|</span></span>;
}

// ---------- Config ----------

const rarityConfig = {
  common: {
    gradient: 'from-slate-300 via-slate-200 to-slate-300',
    glow: 'rgba(148,163,184,0.4)',
    particle: '#94a3b8',
    border: 'border-slate-400/30',
    label: 'Common',
    labelBg: 'bg-slate-500/20 text-slate-300',
  },
  rare: {
    gradient: 'from-cyan-400 via-blue-400 to-cyan-400',
    glow: 'rgba(34,211,238,0.4)',
    particle: '#22d3ee',
    border: 'border-cyan-400/30',
    label: 'Rare',
    labelBg: 'bg-cyan-500/20 text-cyan-300',
  },
  epic: {
    gradient: 'from-violet-400 via-fuchsia-400 to-violet-400',
    glow: 'rgba(167,139,250,0.4)',
    particle: '#a78bfa',
    border: 'border-violet-400/30',
    label: 'Epic',
    labelBg: 'bg-violet-500/20 text-violet-300',
  },
  legendary: {
    gradient: 'from-amber-300 via-yellow-300 to-amber-300',
    glow: 'rgba(251,191,36,0.5)',
    particle: '#fbbf24',
    border: 'border-amber-400/30',
    label: 'Legendary',
    labelBg: 'bg-amber-500/20 text-amber-300',
  },
};

// ---------- Component ----------

export default function AchievementUnlock({
  visible,
  title,
  description,
  icon,
  rarity = 'epic',
  onDismiss,
  autoDismissMs = 4000,
}: AchievementUnlockProps) {
  const config = rarityConfig[rarity];

  // Auto-dismiss
  useEffect(() => {
    if (!visible || !autoDismissMs) return;
    const timer = setTimeout(() => {
      onDismiss?.();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [visible, autoDismissMs, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-lg"
          onClick={onDismiss}
        >
          {/* Radial glow */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.5, 1],
              opacity: [0, 0.6, 0.3],
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${config.glow} 0%, transparent 70%)`,
            }}
          />

          {/* Content card */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{
              type: 'spring',
              stiffness: 250,
              damping: 18,
              delay: 0.1,
            }}
            className={`relative z-10 text-center ${config.border}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Particle burst */}
            <ParticleBurst color={config.particle} />

            {/* "Achievement Unlocked" banner */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-[0.2em] ${config.labelBg}`}>
                {config.label} Achievement Unlocked
              </span>
            </motion.div>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
              className="relative mx-auto mb-6"
            >
              {/* Rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-[-16px]"
              >
                <svg viewBox="0 0 120 120" className="w-full h-full">
                  <circle
                    cx="60"
                    cy="60"
                    r="56"
                    fill="none"
                    stroke="url(#achieveGrad)"
                    strokeWidth="1.5"
                    strokeDasharray="8 12"
                    opacity="0.5"
                  />
                  <defs>
                    <linearGradient id="achieveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={config.particle} />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-2xl mx-auto`}
                style={{ boxShadow: `0 0 60px ${config.glow}` }}
              >
                {icon || <Trophy className="w-12 h-12 text-navy-900" />}
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className={`font-heading text-3xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-3`}
            >
              {title}
            </motion.h2>

            {/* Description with typewriter */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed"
            >
              <TypewriterText text={description} delay={1000} speed={30} />
            </motion.p>

            {/* Dismiss hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="text-slate-600 text-xs mt-8"
            >
              Tap anywhere to dismiss
            </motion.p>
          </motion.div>

          {/* Corner sparkles */}
          {[
            { x: '-30vw', y: '-25vh', delay: 0.5 },
            { x: '30vw', y: '-20vh', delay: 0.7 },
            { x: '-25vw', y: '20vh', delay: 0.6 },
            { x: '28vw', y: '25vh', delay: 0.8 },
          ].map((spark, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ delay: spark.delay, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              style={{ transform: `translate(${spark.x}, ${spark.y})` }}
              className="absolute"
            >
              <Star size={16} className="text-amber-400/60" fill="currentColor" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
