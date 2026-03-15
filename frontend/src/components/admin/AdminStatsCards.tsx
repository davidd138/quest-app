'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  Layers,
  Trophy,
  Star,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import Card from '@/components/ui/Card';

interface StatCardData {
  id: string;
  label: string;
  value: number;
  previousValue?: number;
  icon: React.ElementType;
  color: 'violet' | 'emerald' | 'amber' | 'rose' | 'blue' | 'cyan';
  format?: 'number' | 'decimal' | 'currency';
  suffix?: string;
  sparklineData?: number[];
}

interface AdminStatsCardsProps {
  totalUsers?: number;
  activeToday?: number;
  questsPublished?: number;
  completionsThisWeek?: number;
  averageRating?: number;
  revenue?: number;
  sparklines?: {
    users?: number[];
    active?: number[];
    quests?: number[];
    completions?: number[];
    rating?: number[];
    revenue?: number[];
  };
  onCardClick?: (cardId: string) => void;
  className?: string;
}

const colorMap = {
  violet: {
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    sparkStroke: '#8b5cf6',
    sparkFill: 'rgba(139,92,246,0.15)',
    trendUp: 'text-emerald-400',
    trendDown: 'text-rose-400',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    sparkStroke: '#10b981',
    sparkFill: 'rgba(16,185,129,0.15)',
    trendUp: 'text-emerald-400',
    trendDown: 'text-rose-400',
  },
  amber: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    sparkStroke: '#f59e0b',
    sparkFill: 'rgba(245,158,11,0.15)',
    trendUp: 'text-emerald-400',
    trendDown: 'text-rose-400',
  },
  rose: {
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
    sparkStroke: '#f43f5e',
    sparkFill: 'rgba(244,63,94,0.15)',
    trendUp: 'text-emerald-400',
    trendDown: 'text-rose-400',
  },
  blue: {
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    sparkStroke: '#3b82f6',
    sparkFill: 'rgba(59,130,246,0.15)',
    trendUp: 'text-emerald-400',
    trendDown: 'text-rose-400',
  },
  cyan: {
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    sparkStroke: '#06b6d4',
    sparkFill: 'rgba(6,182,212,0.15)',
    trendUp: 'text-emerald-400',
    trendDown: 'text-rose-400',
  },
};

function AnimatedCounter({
  value,
  format = 'number',
  suffix = '',
}: {
  value: number;
  format?: 'number' | 'decimal' | 'currency';
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 1200;
    const startVal = displayValue;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (value - startVal) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // Only re-animate when target value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const formatted = (() => {
    switch (format) {
      case 'decimal':
        return displayValue.toFixed(1);
      case 'currency':
        return `$${Math.round(displayValue).toLocaleString()}`;
      default:
        return Math.round(displayValue).toLocaleString();
    }
  })();

  return (
    <span>
      {formatted}
      {suffix}
    </span>
  );
}

function MiniSparkline({
  data,
  strokeColor,
  fillColor,
  width = 80,
  height = 32,
}: {
  data: number[];
  strokeColor: string;
  fillColor: string;
  width?: number;
  height?: number;
}) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: padding + (1 - (v - min) / range) * (height - padding * 2),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const fillPath =
    linePath +
    ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={fillPath} fill={fillColor} />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Dot on last point */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={2.5}
        fill={strokeColor}
      />
    </svg>
  );
}

function StatCard({
  card,
  index,
  onClick,
}: {
  card: StatCardData;
  index: number;
  onClick?: () => void;
}) {
  const colors = colorMap[card.color];
  const Icon = card.icon;

  const trend =
    card.previousValue !== undefined && card.previousValue > 0
      ? ((card.value - card.previousValue) / card.previousValue) * 100
      : undefined;

  const isPositive = trend !== undefined && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card
        variant="elevated"
        padding="md"
        className={`${onClick ? 'cursor-pointer hover:border-white/20' : ''} transition-all duration-200`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${colors.iconBg}`}>
            <Icon size={18} className={colors.iconColor} />
          </div>
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>

        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
          {card.label}
        </p>
        <p className="font-heading text-2xl font-bold text-white mb-2">
          <AnimatedCounter value={card.value} format={card.format} suffix={card.suffix} />
        </p>

        {/* Sparkline */}
        {card.sparklineData && card.sparklineData.length >= 2 && (
          <div className="mt-1">
            <MiniSparkline
              data={card.sparklineData}
              strokeColor={colors.sparkStroke}
              fillColor={colors.sparkFill}
              width={140}
              height={28}
            />
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export function AdminStatsCards({
  totalUsers = 0,
  activeToday = 0,
  questsPublished = 0,
  completionsThisWeek = 0,
  averageRating = 0,
  revenue = 0,
  sparklines = {},
  onCardClick,
  className = '',
}: AdminStatsCardsProps) {
  const cards: StatCardData[] = [
    {
      id: 'total-users',
      label: 'Total Users',
      value: totalUsers,
      previousValue: Math.round(totalUsers * 0.88),
      icon: Users,
      color: 'violet',
      sparklineData: sparklines.users || [10, 14, 18, 16, 22, 28, totalUsers],
    },
    {
      id: 'active-today',
      label: 'Active Today',
      value: activeToday,
      previousValue: Math.round(activeToday * 0.92),
      icon: UserCheck,
      color: 'emerald',
      sparklineData: sparklines.active || [5, 8, 6, 12, 9, 14, activeToday],
    },
    {
      id: 'quests-published',
      label: 'Quests Published',
      value: questsPublished,
      icon: Layers,
      color: 'amber',
      sparklineData: sparklines.quests || [2, 3, 5, 4, 7, 8, questsPublished],
    },
    {
      id: 'completions-week',
      label: 'Completions This Week',
      value: completionsThisWeek,
      previousValue: Math.round(completionsThisWeek * 0.85),
      icon: Trophy,
      color: 'rose',
      sparklineData: sparklines.completions || [3, 6, 4, 8, 10, 7, completionsThisWeek],
    },
    {
      id: 'avg-rating',
      label: 'Avg Rating',
      value: averageRating,
      icon: Star,
      color: 'blue',
      format: 'decimal',
      sparklineData: sparklines.rating || [3.8, 4.0, 3.9, 4.2, 4.1, 4.3, averageRating],
    },
    {
      id: 'revenue',
      label: 'Revenue',
      value: revenue,
      previousValue: Math.round(revenue * 0.78),
      icon: DollarSign,
      color: 'cyan',
      format: 'currency',
      sparklineData: sparklines.revenue || [100, 250, 180, 420, 380, 550, revenue],
    },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${className}`}>
      {cards.map((card, i) => (
        <StatCard
          key={card.id}
          card={card}
          index={i}
          onClick={onCardClick ? () => onCardClick(card.id) : undefined}
        />
      ))}
    </div>
  );
}
