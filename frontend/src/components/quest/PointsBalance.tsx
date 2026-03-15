'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Coins, Sparkles, TrendingUp } from 'lucide-react';

// ---------- Types ----------

interface RecentEarning {
  id: string;
  amount: number;
  description: string;
}

interface PointsBalanceProps {
  points: number;
  recentEarnings?: RecentEarning[];
  compact?: boolean;
  className?: string;
}

// ---------- Animated Counter ----------

function useAnimatedCounter(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const from = 0;
    const to = target;

    const step = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(from + (to - from) * eased));

      if (progress < 1) {
        rafId.current = requestAnimationFrame(step);
      } else {
        setCount(to);
      }
    };

    startTime.current = null;
    rafId.current = requestAnimationFrame(step);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [target, duration]);

  return count;
}

// ---------- Component ----------

export default function PointsBalance({
  points,
  recentEarnings = [],
  compact = false,
  className = '',
}: PointsBalanceProps) {
  const animatedPoints = useAnimatedCounter(points);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Coins size={16} className="text-amber-400" />
        </motion.div>
        <span className="text-sm font-bold text-white tabular-nums">
          {animatedPoints.toLocaleString()}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 ${className}`}
    >
      {/* Main balance */}
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          animate={{
            boxShadow: [
              '0 0 15px rgba(251,191,36,0.2)',
              '0 0 25px rgba(251,191,36,0.4)',
              '0 0 15px rgba(251,191,36,0.2)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center"
        >
          <Coins size={28} className="text-white" />
        </motion.div>
        <div>
          <p className="text-xs text-slate-500 font-medium mb-0.5">Puntos disponibles</p>
          <p className="font-heading text-3xl font-bold text-white tabular-nums">
            {animatedPoints.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Recent earnings */}
      {recentEarnings.length > 0 && (
        <div className="border-t border-white/5 pt-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={12} className="text-emerald-400" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Ganancias recientes
            </span>
          </div>
          {recentEarnings.map((earning) => (
            <div
              key={earning.id}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-slate-400 truncate mr-3">{earning.description}</span>
              <span className="text-emerald-400 font-semibold whitespace-nowrap flex items-center gap-1">
                <Sparkles size={10} />
                +{earning.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
