'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';

// ---------- Types ----------

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface AdminKPICardProps {
  label: string;
  value: number;
  format?: 'number' | 'decimal' | 'currency' | 'percent';
  suffix?: string;
  trend?: {
    direction: TrendDirection;
    percentage: number;
    label?: string; // e.g. "vs last week"
  };
  sparklineData?: number[];
  color?: 'violet' | 'emerald' | 'amber' | 'rose' | 'blue' | 'cyan';
  icon?: React.ElementType;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

// ---------- Color Map ----------

const colorMap = {
  violet: {
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    sparkStroke: '#8b5cf6',
    sparkFill: 'rgba(139,92,246,0.15)',
    accentBorder: 'border-violet-500/30',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    sparkStroke: '#10b981',
    sparkFill: 'rgba(16,185,129,0.15)',
    accentBorder: 'border-emerald-500/30',
  },
  amber: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    sparkStroke: '#f59e0b',
    sparkFill: 'rgba(245,158,11,0.15)',
    accentBorder: 'border-amber-500/30',
  },
  rose: {
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
    sparkStroke: '#f43f5e',
    sparkFill: 'rgba(244,63,94,0.15)',
    accentBorder: 'border-rose-500/30',
  },
  blue: {
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    sparkStroke: '#3b82f6',
    sparkFill: 'rgba(59,130,246,0.15)',
    accentBorder: 'border-blue-500/30',
  },
  cyan: {
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    sparkStroke: '#06b6d4',
    sparkFill: 'rgba(6,182,212,0.15)',
    accentBorder: 'border-cyan-500/30',
  },
};

const trendColors: Record<TrendDirection, string> = {
  up: 'bg-emerald-500/10 text-emerald-400',
  down: 'bg-rose-500/10 text-rose-400',
  neutral: 'bg-slate-500/10 text-slate-400',
};

const TrendIcons: Record<TrendDirection, React.ElementType> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

// ---------- Animated Counter ----------

function AnimatedCounter({
  value,
  format = 'number',
  suffix = '',
}: {
  value: number;
  format?: AdminKPICardProps['format'];
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 1000;
    const startVal = displayValue;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayValue(startVal + (value - startVal) * eased);

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const formatted = (() => {
    switch (format) {
      case 'decimal':
        return displayValue.toFixed(1);
      case 'currency':
        return `$${Math.round(displayValue).toLocaleString()}`;
      case 'percent':
        return `${displayValue.toFixed(1)}%`;
      default:
        return Math.round(displayValue).toLocaleString();
    }
  })();

  return (
    <span data-testid="kpi-value">
      {formatted}
      {suffix}
    </span>
  );
}

// ---------- Sparkline ----------

function Sparkline({
  data,
  strokeColor,
  fillColor,
  width = 100,
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
  const pad = 2;

  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (width - pad * 2),
    y: pad + (1 - (v - min) / range) * (height - pad * 2),
  }));

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fill = `${line} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible"
      data-testid="kpi-sparkline"
      role="img"
      aria-label="Sparkline chart"
    >
      <path d={fill} fill={fillColor} />
      <path
        d={line}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={2.5}
        fill={strokeColor}
      />
    </svg>
  );
}

// ---------- Loading Skeleton ----------

function KPISkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      data-testid="kpi-skeleton"
      className={`rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 p-5 animate-pulse ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/5" />
        <div className="w-16 h-6 rounded-lg bg-white/5" />
      </div>
      <div className="w-20 h-3 rounded bg-white/5 mb-2" />
      <div className="w-28 h-8 rounded bg-white/5 mb-3" />
      <div className="w-full h-8 rounded bg-white/5" />
    </div>
  );
}

// ---------- Main Component ----------

const AdminKPICard: React.FC<AdminKPICardProps> = ({
  label,
  value,
  format = 'number',
  suffix,
  trend,
  sparklineData,
  color = 'violet',
  icon: Icon,
  loading = false,
  onClick,
  className = '',
}) => {
  if (loading) {
    return <KPISkeleton className={className} />;
  }

  const colors = colorMap[color];
  const TrendIcon = trend ? TrendIcons[trend.direction] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      onClick={onClick}
      className={`rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 shadow-xl shadow-black/20 p-5 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-white/20' : ''
      } ${className}`}
      data-testid="kpi-card"
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header: icon + trend */}
      <div className="flex items-start justify-between mb-3">
        {Icon && (
          <div className={`p-2.5 rounded-xl ${colors.iconBg}`}>
            <Icon size={18} className={colors.iconColor} />
          </div>
        )}

        {trend && TrendIcon && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
              trendColors[trend.direction]
            }`}
            data-testid="kpi-trend"
          >
            <TrendIcon size={12} />
            {trend.percentage.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Label */}
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>

      {/* Value */}
      <p className="font-heading text-2xl font-bold text-white mb-2">
        <AnimatedCounter value={value} format={format} suffix={suffix} />
      </p>

      {/* Comparison text */}
      {trend?.label && (
        <p className="text-[11px] text-slate-500 mb-2">{trend.label}</p>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length >= 2 && (
        <div className="mt-1">
          <Sparkline
            data={sparklineData}
            strokeColor={colors.sparkStroke}
            fillColor={colors.sparkFill}
            width={140}
            height={28}
          />
        </div>
      )}

      {/* Drill-down indicator */}
      {onClick && (
        <div className="flex items-center justify-end mt-2">
          <ChevronRight size={14} className="text-slate-500" />
        </div>
      )}
    </motion.div>
  );
};

export default AdminKPICard;
