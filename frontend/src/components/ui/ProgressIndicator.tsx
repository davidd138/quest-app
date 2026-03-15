'use client';

import React from 'react';

type ProgressVariant = 'circular' | 'linear';
type ProgressColor = 'violet' | 'emerald' | 'amber' | 'rose' | 'slate';

interface ProgressIndicatorProps {
  /** Display variant */
  variant?: ProgressVariant;
  /** Current progress value (0-100). Omit for indeterminate. */
  value?: number;
  /** Minimum value for ARIA */
  min?: number;
  /** Maximum value for ARIA */
  max?: number;
  /** Accessible label */
  label?: string;
  /** Color theme */
  color?: ProgressColor;
  /** Size of circular variant in px, or height of linear variant */
  size?: number;
  /** Stroke width for circular variant */
  strokeWidth?: number;
  /** Additional CSS classes */
  className?: string;
}

const COLOR_MAP: Record<ProgressColor, { track: string; fill: string; text: string }> = {
  violet: {
    track: 'stroke-violet-500/10',
    fill: 'stroke-violet-500',
    text: 'text-violet-400',
  },
  emerald: {
    track: 'stroke-emerald-500/10',
    fill: 'stroke-emerald-500',
    text: 'text-emerald-400',
  },
  amber: {
    track: 'stroke-amber-500/10',
    fill: 'stroke-amber-500',
    text: 'text-amber-400',
  },
  rose: {
    track: 'stroke-rose-500/10',
    fill: 'stroke-rose-500',
    text: 'text-rose-400',
  },
  slate: {
    track: 'stroke-slate-700',
    fill: 'stroke-slate-400',
    text: 'text-slate-400',
  },
};

const LINEAR_BG: Record<ProgressColor, string> = {
  violet: 'bg-violet-500/10',
  emerald: 'bg-emerald-500/10',
  amber: 'bg-amber-500/10',
  rose: 'bg-rose-500/10',
  slate: 'bg-slate-700',
};

const LINEAR_FILL: Record<ProgressColor, string> = {
  violet: 'bg-violet-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  slate: 'bg-slate-400',
};

function CircularProgress({
  value,
  min = 0,
  max = 100,
  label,
  color = 'violet',
  size = 48,
  strokeWidth = 4,
  className = '',
}: ProgressIndicatorProps) {
  const colors = COLOR_MAP[color];
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const isIndeterminate = value === undefined;
  const normalizedValue = isIndeterminate
    ? 0
    : Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  const offset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={label}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className={isIndeterminate ? 'animate-spin' : ''}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={colors.track}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={`${colors.fill} transition-[stroke-dashoffset] duration-300 ease-out`}
          strokeDasharray={circumference}
          strokeDashoffset={isIndeterminate ? circumference * 0.75 : offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {!isIndeterminate && label === undefined && (
        <span
          className={`absolute text-xs font-medium ${colors.text}`}
          aria-hidden="true"
        >
          {Math.round(normalizedValue)}%
        </span>
      )}
    </div>
  );
}

function LinearProgress({
  value,
  min = 0,
  max = 100,
  label,
  color = 'violet',
  size = 6,
  className = '',
}: ProgressIndicatorProps) {
  const isIndeterminate = value === undefined;
  const normalizedValue = isIndeterminate
    ? 0
    : Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400">{label}</span>
          {!isIndeterminate && (
            <span className={`text-xs font-medium ${COLOR_MAP[color].text}`}>
              {Math.round(normalizedValue)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label}
        className={`w-full rounded-full overflow-hidden ${LINEAR_BG[color]}`}
        style={{ height: size }}
      >
        <div
          className={[
            'h-full rounded-full transition-[width] duration-300 ease-out',
            LINEAR_FILL[color],
            isIndeterminate ? 'animate-indeterminate-bar' : '',
          ].join(' ')}
          style={isIndeterminate ? { width: '40%' } : { width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Accessible progress indicator with circular and linear variants.
 * Supports determinate (value provided) and indeterminate (no value) modes.
 */
export default function ProgressIndicator(props: ProgressIndicatorProps) {
  const { variant = 'linear' } = props;

  if (variant === 'circular') {
    return <CircularProgress {...props} />;
  }

  return <LinearProgress {...props} />;
}
