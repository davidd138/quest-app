'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Clock,
  Layers,
  Star,
  Trophy,
  ArrowRight,
  Gauge,
} from 'lucide-react';
import type { Quest } from '@/types';

interface QuestCompareProps {
  quest1: Quest;
  quest2: Quest;
}

interface Metric {
  id: string;
  label: string;
  icon: React.ReactNode;
  value1: number | string;
  value2: number | string;
  numValue1: number;
  numValue2: number;
  higherIsBetter: boolean;
}

const difficultyValue: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  legendary: 4,
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

const QuestCompare: React.FC<QuestCompareProps> = ({ quest1, quest2 }) => {
  const metrics: Metric[] = useMemo(
    () => [
      {
        id: 'difficulty',
        label: 'Dificultad',
        icon: <Gauge size={16} className="text-rose-400" />,
        value1: quest1.difficulty,
        value2: quest2.difficulty,
        numValue1: difficultyValue[quest1.difficulty] ?? 0,
        numValue2: difficultyValue[quest2.difficulty] ?? 0,
        higherIsBetter: false, // neutral, but we show it
      },
      {
        id: 'duration',
        label: 'Duracion',
        icon: <Clock size={16} className="text-emerald-400" />,
        value1: `${quest1.estimatedDuration} min`,
        value2: `${quest2.estimatedDuration} min`,
        numValue1: quest1.estimatedDuration,
        numValue2: quest2.estimatedDuration,
        higherIsBetter: false, // shorter is often better
      },
      {
        id: 'stages',
        label: 'Etapas',
        icon: <Layers size={16} className="text-violet-400" />,
        value1: quest1.stages.length,
        value2: quest2.stages.length,
        numValue1: quest1.stages.length,
        numValue2: quest2.stages.length,
        higherIsBetter: true,
      },
      {
        id: 'points',
        label: 'Puntos',
        icon: <Zap size={16} className="text-amber-400" />,
        value1: quest1.totalPoints,
        value2: quest2.totalPoints,
        numValue1: quest1.totalPoints,
        numValue2: quest2.totalPoints,
        higherIsBetter: true,
      },
      {
        id: 'tags',
        label: 'Tags',
        icon: <Star size={16} className="text-sky-400" />,
        value1: quest1.tags.length,
        value2: quest2.tags.length,
        numValue1: quest1.tags.length,
        numValue2: quest2.tags.length,
        higherIsBetter: true,
      },
    ],
    [quest1, quest2],
  );

  // Simple recommendation: higher points + more stages = more content
  const recommendation = useMemo(() => {
    let score1 = 0;
    let score2 = 0;
    for (const m of metrics) {
      if (m.id === 'difficulty') continue; // neutral
      if (m.higherIsBetter) {
        if (m.numValue1 > m.numValue2) score1++;
        else if (m.numValue2 > m.numValue1) score2++;
      } else {
        if (m.numValue1 < m.numValue2) score1++;
        else if (m.numValue2 < m.numValue1) score2++;
      }
    }
    if (score1 > score2) return 1;
    if (score2 > score1) return 2;
    return 0;
  }, [metrics]);

  const getWinner = (metric: Metric): 0 | 1 | 2 => {
    if (metric.id === 'difficulty') return 0;
    if (metric.numValue1 === metric.numValue2) return 0;
    if (metric.higherIsBetter) {
      return metric.numValue1 > metric.numValue2 ? 1 : 2;
    }
    return metric.numValue1 < metric.numValue2 ? 1 : 2;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end">
        <div className="text-center space-y-2">
          <div className="glass rounded-xl p-4 border border-violet-500/20">
            <h3 className="font-heading font-bold text-white text-sm truncate">{quest1.title}</h3>
            <span className="text-xs text-violet-400 capitalize">{quest1.category.replace(/_/g, ' ')}</span>
          </div>
        </div>
        <div className="flex items-center justify-center pb-4">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">VS</span>
        </div>
        <div className="text-center space-y-2">
          <div className="glass rounded-xl p-4 border border-emerald-500/20">
            <h3 className="font-heading font-bold text-white text-sm truncate">{quest2.title}</h3>
            <span className="text-xs text-emerald-400 capitalize">{quest2.category.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        {metrics.map((metric) => {
          const winner = getWinner(metric);

          return (
            <motion.div
              key={metric.id}
              variants={rowVariants}
              className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center"
            >
              {/* Quest 1 value */}
              <div
                className={[
                  'glass rounded-xl px-4 py-3 text-right transition-all',
                  winner === 1 ? 'border border-violet-500/30 shadow-lg shadow-violet-500/10' : 'border border-transparent',
                ].join(' ')}
              >
                <span
                  className={[
                    'text-sm font-semibold capitalize',
                    winner === 1 ? 'text-violet-400' : 'text-white',
                  ].join(' ')}
                >
                  {metric.value1}
                </span>
              </div>

              {/* Label */}
              <div className="flex flex-col items-center gap-1 min-w-[80px]">
                {metric.icon}
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  {metric.label}
                </span>
              </div>

              {/* Quest 2 value */}
              <div
                className={[
                  'glass rounded-xl px-4 py-3 text-left transition-all',
                  winner === 2 ? 'border border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'border border-transparent',
                ].join(' ')}
              >
                <span
                  className={[
                    'text-sm font-semibold capitalize',
                    winner === 2 ? 'text-emerald-400' : 'text-white',
                  ].join(' ')}
                >
                  {metric.value2}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recommendation */}
      <motion.div
        variants={rowVariants}
        className="glass rounded-2xl p-5 border border-amber-500/20 text-center space-y-3"
      >
        <div className="flex items-center justify-center gap-2">
          <Trophy size={18} className="text-amber-400" />
          <h4 className="font-heading font-semibold text-white text-sm">Recomendacion</h4>
        </div>
        {recommendation === 0 ? (
          <p className="text-slate-400 text-sm">
            Ambas quests son muy similares. Elige la que mas te atraiga por tematica.
          </p>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <p className="text-slate-300 text-sm">
              Te recomendamos{' '}
              <span className={recommendation === 1 ? 'text-violet-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                {recommendation === 1 ? quest1.title : quest2.title}
              </span>
            </p>
            <ArrowRight size={16} className="text-amber-400" />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default QuestCompare;
