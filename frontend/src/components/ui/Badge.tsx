'use client';

import React from 'react';

type BadgeColor = 'violet' | 'emerald' | 'amber' | 'rose' | 'slate';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  color?: BadgeColor;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const colorStyles: Record<BadgeColor, string> = {
  violet: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  slate: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

const dotColors: Record<BadgeColor, string> = {
  violet: 'bg-violet-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
  slate: 'bg-slate-400',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

const Badge: React.FC<BadgeProps> = ({
  color = 'violet',
  size = 'md',
  dot = false,
  children,
  className = '',
}) => {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        colorStyles[color],
        sizeStyles[size],
        className,
      ].join(' ')}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[color]}`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
