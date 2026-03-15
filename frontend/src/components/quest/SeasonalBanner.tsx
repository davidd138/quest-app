'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Snowflake,
  Sun,
  Flower2,
  Ghost,
  PartyPopper,
  Sparkles,
  X,
  ChevronRight,
} from 'lucide-react';

// ---------- Types ----------

interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  colors: { primary: string; secondary: string; accent: string; gradient: string; border: string };
  icon: React.ElementType;
  particleType: 'snowflake' | 'bat' | 'sunray' | 'petal' | 'marigold' | 'confetti';
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

// ---------- Events ----------

const seasonalEvents: SeasonalEvent[] = [
  {
    id: 'christmas',
    name: 'Winter Wonderland',
    description: 'Magical holiday quests with festive surprises await!',
    colors: {
      primary: 'text-red-400',
      secondary: 'text-emerald-400',
      accent: 'bg-red-500/20',
      gradient: 'from-red-600/30 via-emerald-600/20 to-red-600/30',
      border: 'border-red-500/30',
    },
    icon: Snowflake,
    particleType: 'snowflake',
    startMonth: 12, startDay: 15,
    endMonth: 1, endDay: 6,
  },
  {
    id: 'halloween',
    name: 'Noche de Terror',
    description: 'Brave spine-chilling mystery quests if you dare...',
    colors: {
      primary: 'text-orange-400',
      secondary: 'text-purple-400',
      accent: 'bg-orange-500/20',
      gradient: 'from-orange-600/30 via-purple-600/20 to-orange-600/30',
      border: 'border-orange-500/30',
    },
    icon: Ghost,
    particleType: 'bat',
    startMonth: 10, startDay: 20,
    endMonth: 11, endDay: 5,
  },
  {
    id: 'dia-de-muertos',
    name: 'Dia de Muertos',
    description: 'Honor traditions with vibrant cultural quests!',
    colors: {
      primary: 'text-amber-400',
      secondary: 'text-fuchsia-400',
      accent: 'bg-amber-500/20',
      gradient: 'from-amber-600/30 via-fuchsia-600/20 to-amber-600/30',
      border: 'border-amber-500/30',
    },
    icon: Flower2,
    particleType: 'marigold',
    startMonth: 10, startDay: 31,
    endMonth: 11, endDay: 2,
  },
  {
    id: 'carnival',
    name: 'Carnival Fiesta',
    description: 'Dance through colorful quests and win festive rewards!',
    colors: {
      primary: 'text-fuchsia-400',
      secondary: 'text-cyan-400',
      accent: 'bg-fuchsia-500/20',
      gradient: 'from-fuchsia-600/30 via-cyan-600/20 to-yellow-600/30',
      border: 'border-fuchsia-500/30',
    },
    icon: PartyPopper,
    particleType: 'confetti',
    startMonth: 2, startDay: 10,
    endMonth: 3, endDay: 5,
  },
  {
    id: 'spring-bloom',
    name: 'Spring Bloom',
    description: 'Nature quests bloom with new adventures and discoveries!',
    colors: {
      primary: 'text-pink-400',
      secondary: 'text-emerald-400',
      accent: 'bg-pink-500/20',
      gradient: 'from-pink-600/30 via-emerald-600/20 to-pink-600/30',
      border: 'border-pink-500/30',
    },
    icon: Flower2,
    particleType: 'petal',
    startMonth: 3, startDay: 20,
    endMonth: 6, endDay: 20,
  },
  {
    id: 'summer-festival',
    name: 'Summer Festival',
    description: 'Soak up the sun with epic outdoor exploration quests!',
    colors: {
      primary: 'text-yellow-400',
      secondary: 'text-orange-400',
      accent: 'bg-yellow-500/20',
      gradient: 'from-yellow-600/30 via-orange-600/20 to-yellow-600/30',
      border: 'border-yellow-500/30',
    },
    icon: Sun,
    particleType: 'sunray',
    startMonth: 6, startDay: 21,
    endMonth: 9, endDay: 22,
  },
];

// ---------- Helper ----------

function isDateInRange(
  now: Date,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number
): boolean {
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Handle cross-year ranges (e.g. Dec 15 - Jan 6)
  if (startMonth > endMonth) {
    return (month > startMonth || (month === startMonth && day >= startDay)) ||
           (month < endMonth || (month === endMonth && day <= endDay));
  }

  const afterStart = month > startMonth || (month === startMonth && day >= startDay);
  const beforeEnd = month < endMonth || (month === endMonth && day <= endDay);
  return afterStart && beforeEnd;
}

function getCurrentEvent(): SeasonalEvent | null {
  const now = new Date();
  return seasonalEvents.find((e) =>
    isDateInRange(now, e.startMonth, e.startDay, e.endMonth, e.endDay)
  ) ?? null;
}

// ---------- Particles ----------

function SnowflakeParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: `${Math.random() * 100}%`,
            y: -20,
            rotate: 0,
            opacity: 0.7,
          }}
          animate={{
            y: '120%',
            rotate: 360,
            opacity: [0.7, 0.3, 0.7, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear',
          }}
          className="absolute"
        >
          <Snowflake size={8 + Math.random() * 8} className="text-white/40" />
        </motion.div>
      ))}
    </div>
  );
}

function BatParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: '-10%', y: `${20 + Math.random() * 60}%` }}
          animate={{
            x: '110%',
            y: [`${20 + Math.random() * 60}%`, `${10 + Math.random() * 40}%`, `${30 + Math.random() * 50}%`],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 6,
            ease: 'linear',
          }}
          className="absolute text-purple-400/30 text-lg"
        >
          🦇
        </motion.div>
      ))}
    </div>
  );
}

function SunRayParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-16 -right-16 w-48 h-48"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
            className="absolute top-1/2 left-1/2 w-1 h-20 bg-gradient-to-t from-transparent to-yellow-400/20 origin-bottom"
            style={{ transform: `rotate(${i * 30}deg) translateY(-100%)` }}
          />
        ))}
      </motion.div>
    </div>
  );
}

function PetalParticles() {
  const colors = ['text-pink-300/40', 'text-rose-300/40', 'text-fuchsia-300/40', 'text-pink-200/40'];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: `${Math.random() * 100}%`,
            y: -10,
            rotate: 0,
          }}
          animate={{
            y: '120%',
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 5 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 6,
            ease: 'linear',
          }}
          className={`absolute w-2 h-3 rounded-full ${colors[i % colors.length]}`}
          style={{
            background: 'radial-gradient(ellipse, currentColor 0%, transparent 70%)',
          }}
        >
          <Flower2 size={10} className={colors[i % colors.length]} />
        </motion.div>
      ))}
    </div>
  );
}

function MarigoldParticles() {
  const colors = ['text-amber-400/50', 'text-orange-400/50', 'text-yellow-400/50', 'text-fuchsia-400/40'];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: `${Math.random() * 100}%`,
            y: -10,
            rotate: 0,
            scale: 0.5 + Math.random() * 0.8,
          }}
          animate={{
            y: '120%',
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            rotate: [0, 120, 240, 360],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear',
          }}
          className={`absolute ${colors[i % colors.length]}`}
        >
          <Flower2 size={10 + Math.random() * 6} />
        </motion.div>
      ))}
    </div>
  );
}

function ConfettiParticles() {
  const colors = [
    'bg-fuchsia-400', 'bg-cyan-400', 'bg-yellow-400',
    'bg-emerald-400', 'bg-rose-400', 'bg-violet-400',
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: `${Math.random() * 100}%`,
            y: -10,
            rotate: 0,
            scaleY: 1,
          }}
          animate={{
            y: '120%',
            rotate: [0, 180, 720],
            scaleY: [1, 0.3, 1, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: 'linear',
          }}
          className={`absolute w-1.5 h-3 rounded-sm opacity-40 ${colors[i % colors.length]}`}
        />
      ))}
    </div>
  );
}

const particleComponents: Record<SeasonalEvent['particleType'], React.FC> = {
  snowflake: SnowflakeParticles,
  bat: BatParticles,
  sunray: SunRayParticles,
  petal: PetalParticles,
  marigold: MarigoldParticles,
  confetti: ConfettiParticles,
};

// ---------- Main Component ----------

export default function SeasonalBanner() {
  const [dismissed, setDismissed] = useState(false);
  const event = useMemo(() => getCurrentEvent(), []);

  if (!event || dismissed) return null;

  const Icon = event.icon;
  const Particles = particleComponents[event.particleType];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className={`
          relative overflow-hidden rounded-2xl
          bg-white/5 backdrop-blur-xl
          border ${event.colors.border}
          p-5 md:p-6
        `}
      >
        {/* Gradient border glow */}
        <div className={`absolute inset-0 bg-gradient-to-r ${event.colors.gradient} opacity-40 pointer-events-none`} />

        {/* Particles */}
        <Particles />

        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          aria-label="Dismiss banner"
        >
          <X size={14} />
        </button>

        {/* Content */}
        <div className="relative z-10 flex items-center gap-4">
          {/* Icon */}
          <motion.div
            animate={{
              rotate: [0, -10, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className={`
              flex-shrink-0 w-14 h-14 rounded-2xl ${event.colors.accent}
              flex items-center justify-center
              shadow-lg
            `}
          >
            <Icon size={28} className={event.colors.primary} />
          </motion.div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-heading font-bold text-lg ${event.colors.primary}`}>
                {event.name}
              </h3>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles size={16} className={event.colors.secondary} />
              </motion.div>
            </div>
            <p className="text-sm text-slate-400 mb-2">
              {event.description}
            </p>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              className={`
                inline-flex items-center gap-1.5 text-xs font-semibold
                ${event.colors.primary} hover:underline
              `}
            >
              Special seasonal quests available!
              <ChevronRight size={14} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
