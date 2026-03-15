'use client';

import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClanBadgeProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  glowing?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { px: 32, fontSize: 10, strokeWidth: 1.5 },
  md: { px: 48, fontSize: 14, strokeWidth: 2 },
  lg: { px: 72, fontSize: 20, strokeWidth: 2.5 },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ClanBadge: React.FC<ClanBadgeProps> = ({
  name,
  color,
  size = 'md',
  glowing = false,
  className = '',
}) => {
  const s = SIZE_MAP[size];
  const monogram = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Lighten and darken the base color for gradients
  const lighterColor = color + 'CC';
  const darkerColor = color + '80';

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: s.px, height: s.px }}
    >
      {/* Glow effect for top 3 */}
      {glowing && (
        <div
          className="absolute inset-[-4px] rounded-2xl animate-pulse"
          style={{
            background: `radial-gradient(circle, ${color}40, transparent 70%)`,
          }}
        />
      )}

      <svg
        width={s.px}
        height={s.px}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="relative"
        role="img"
        aria-label={`${name} clan badge`}
      >
        <defs>
          <linearGradient id={`clan-bg-${name.replace(/\s/g, '')}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={lighterColor} />
            <stop offset="100%" stopColor={darkerColor} />
          </linearGradient>
          <linearGradient id={`clan-shine-${name.replace(/\s/g, '')}`} x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          {glowing && (
            <filter id={`clan-glow-${name.replace(/\s/g, '')}`}>
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor={color} floodOpacity="0.4" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feMerge>
                <feMergeNode in="shadow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Shield shape */}
        <path
          d="M50 6 L88 22 L88 52 Q88 78 50 96 Q12 78 12 52 L12 22 Z"
          fill={`url(#clan-bg-${name.replace(/\s/g, '')})`}
          stroke={color}
          strokeWidth={s.strokeWidth}
          filter={glowing ? `url(#clan-glow-${name.replace(/\s/g, '')})` : undefined}
        />

        {/* Shield shine overlay */}
        <path
          d="M50 6 L88 22 L88 52 Q88 78 50 96 Q12 78 12 52 L12 22 Z"
          fill={`url(#clan-shine-${name.replace(/\s/g, '')})`}
        />

        {/* Inner border */}
        <path
          d="M50 14 L82 27 L82 52 Q82 74 50 90 Q18 74 18 52 L18 27 Z"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />

        {/* Monogram */}
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize={s.fontSize}
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
        >
          {monogram}
        </text>
      </svg>
    </div>
  );
};

export default ClanBadge;
