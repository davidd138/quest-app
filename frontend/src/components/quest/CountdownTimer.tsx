'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, PartyPopper } from 'lucide-react';

// ---------- Types ----------

interface CountdownTimerProps {
  targetDate: Date;
  label?: string;
  onComplete?: () => void;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

// ---------- Helpers ----------

function getTimeLeft(target: Date): TimeLeft {
  const total = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  };
}

function getUrgencyColor(total: number): { text: string; glow: string; bg: string } {
  const hoursLeft = total / (1000 * 60 * 60);
  if (hoursLeft > 72) return { text: 'text-emerald-400', glow: 'shadow-emerald-500/20', bg: 'bg-emerald-500/10' };
  if (hoursLeft > 24) return { text: 'text-yellow-400', glow: 'shadow-yellow-500/20', bg: 'bg-yellow-500/10' };
  if (hoursLeft > 6) return { text: 'text-orange-400', glow: 'shadow-orange-500/20', bg: 'bg-orange-500/10' };
  return { text: 'text-red-400', glow: 'shadow-red-500/20', bg: 'bg-red-500/10' };
}

// ---------- Flip Card ----------

function FlipCard({ value, label, color }: { value: number; label: string; color: { text: string; glow: string; bg: string } }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsFlipping(false);
        prevValue.current = value;
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const formatted = String(displayValue).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`relative w-16 h-20 md:w-20 md:h-24 ${color.glow} shadow-lg`}>
        {/* Card background */}
        <div className="absolute inset-0 glass rounded-xl border border-white/10 overflow-hidden">
          {/* Top half */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/[0.03]" />
          {/* Divider line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 z-10" />
          {/* Side notches */}
          <div className="absolute top-1/2 -left-0.5 w-1.5 h-3 rounded-r-full bg-slate-950 -translate-y-1/2 z-10" />
          <div className="absolute top-1/2 -right-0.5 w-1.5 h-3 rounded-l-full bg-slate-950 -translate-y-1/2 z-10" />
        </div>

        {/* Number */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={formatted}
            initial={isFlipping ? { rotateX: -90, opacity: 0 } : false}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ perspective: 200 }}
          >
            <span className={`text-3xl md:text-4xl font-bold ${color.text} tabular-nums drop-shadow-lg`}>
              {formatted}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <span className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

// ---------- Confetti Burst ----------

function ConfettiBurst() {
  const colors = [
    'bg-fuchsia-400', 'bg-cyan-400', 'bg-yellow-400',
    'bg-emerald-400', 'bg-rose-400', 'bg-violet-400',
    'bg-amber-400', 'bg-indigo-400',
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 40;
        const distance = 80 + Math.random() * 120;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance - 40;

        return (
          <motion.div
            key={i}
            initial={{ x: '50%', y: '50%', scale: 0 }}
            animate={{
              x: `calc(50% + ${endX}px)`,
              y: `calc(50% + ${endY}px)`,
              scale: [0, 1, 0.5],
              rotate: [0, 180 + Math.random() * 360],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.2 + Math.random() * 0.8,
              ease: 'easeOut',
              delay: Math.random() * 0.3,
            }}
            className={`absolute w-2 h-2 rounded-sm ${colors[i % colors.length]}`}
          />
        );
      })}
    </div>
  );
}

// ---------- Main Component ----------

export default function CountdownTimer({
  targetDate,
  label = 'Event ends in...',
  onComplete,
  className = '',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(targetDate));
  const [hasCompleted, setHasCompleted] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const next = getTimeLeft(targetDate);
      setTimeLeft(next);

      if (next.total <= 0 && !completedRef.current) {
        completedRef.current = true;
        setHasCompleted(true);
        onComplete?.();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  const color = getUrgencyColor(timeLeft.total);

  if (hasCompleted) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative glass rounded-2xl border border-white/10 p-8 text-center overflow-hidden ${className}`}
      >
        <ConfettiBurst />
        <motion.div
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: 2 }}
          className="mb-3"
        >
          <PartyPopper size={48} className="text-yellow-400 mx-auto" />
        </motion.div>
        <h3 className="text-xl font-bold text-white mb-1">Event Started!</h3>
        <p className="text-sm text-slate-400">The countdown is over. Time for adventure!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`glass rounded-2xl border border-white/10 p-6 ${className}`}
    >
      {/* Label */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <Timer size={16} className={color.text} />
        <span className="text-sm font-medium text-slate-400">{label}</span>
      </div>

      {/* Timer cards */}
      <div className="flex items-center justify-center gap-3 md:gap-4">
        <FlipCard value={timeLeft.days} label="Days" color={color} />

        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className={`text-2xl font-bold ${color.text} self-start mt-5`}
        >
          :
        </motion.span>

        <FlipCard value={timeLeft.hours} label="Hours" color={color} />

        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          className={`text-2xl font-bold ${color.text} self-start mt-5`}
        >
          :
        </motion.span>

        <FlipCard value={timeLeft.minutes} label="Minutes" color={color} />

        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.25 }}
          className={`text-2xl font-bold ${color.text} self-start mt-5`}
        >
          :
        </motion.span>

        <FlipCard value={timeLeft.seconds} label="Seconds" color={color} />
      </div>

      {/* Urgency indicator bar */}
      <div className="mt-5 flex justify-center">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${color.bg}`}>
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`w-1.5 h-1.5 rounded-full ${color.text === 'text-emerald-400' ? 'bg-emerald-400' : color.text === 'text-yellow-400' ? 'bg-yellow-400' : color.text === 'text-orange-400' ? 'bg-orange-400' : 'bg-red-400'}`}
          />
          <span className={`text-[10px] font-semibold ${color.text}`}>
            {timeLeft.days > 3
              ? 'Plenty of time'
              : timeLeft.days > 1
              ? 'A few days left'
              : timeLeft.total > 6 * 60 * 60 * 1000
              ? 'Ending soon'
              : 'Hurry up!'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
