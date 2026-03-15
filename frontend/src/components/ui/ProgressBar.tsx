'use client';

import React from 'react';
import { motion } from 'framer-motion';

type ProgressColor = 'violet' | 'emerald' | 'amber' | 'rose';
type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: ProgressColor;
  size?: ProgressSize;
  showLabel?: boolean;
  gradient?: boolean;
  striped?: boolean;
  className?: string;
}

const colorStyles: Record<ProgressColor, string> = {
  violet: 'bg-violet-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
};

const gradientStyles: Record<ProgressColor, string> = {
  violet: 'bg-gradient-to-r from-violet-600 to-violet-400',
  emerald: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
  amber: 'bg-gradient-to-r from-amber-600 to-amber-400',
  rose: 'bg-gradient-to-r from-rose-600 to-rose-400',
};

const sizeStyles: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'violet',
  size = 'md',
  showLabel = false,
  gradient = false,
  striped = false,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400">Progress</span>
          <span className="text-xs font-medium text-slate-300">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={`w-full rounded-full bg-white/10 overflow-hidden ${sizeStyles[size]}`}
      >
        <motion.div
          className={[
            'h-full rounded-full relative',
            gradient ? gradientStyles[color] : colorStyles[color],
            striped ? 'overflow-hidden' : '',
          ].join(' ')}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {striped && (
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.3) 6px, rgba(255,255,255,0.3) 12px)',
                animation: 'shimmer 1s linear infinite',
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressBar;
