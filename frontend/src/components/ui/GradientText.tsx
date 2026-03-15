'use client';

import React from 'react';

// ---------------------------------------------------------------------------
// Preset gradients
// ---------------------------------------------------------------------------

const PRESETS = {
  'violet-to-emerald': 'from-violet-400 via-fuchsia-400 to-emerald-400',
  sunrise: 'from-amber-400 via-orange-500 to-rose-500',
  ocean: 'from-cyan-400 via-blue-500 to-indigo-500',
  fire: 'from-yellow-400 via-orange-500 to-red-600',
} as const;

export type GradientPreset = keyof typeof PRESETS;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GradientTextProps {
  children: React.ReactNode;
  /** Preset gradient name or custom Tailwind gradient classes. @default 'violet-to-emerald' */
  colors?: GradientPreset | string;
  /** Animate the gradient position. @default false */
  animated?: boolean;
  /** Extra class names (font weight, size, etc.). */
  className?: string;
}

// ---------------------------------------------------------------------------
// Keyframe style (injected once)
// ---------------------------------------------------------------------------

const KEYFRAME_ID = 'gradient-text-keyframes';

function ensureKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAME_ID)) return;

  const style = document.createElement('style');
  style.id = KEYFRAME_ID;
  style.textContent = `
    @keyframes gradient-shift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const GradientText: React.FC<GradientTextProps> = ({
  children,
  colors = 'violet-to-emerald',
  animated = false,
  className = '',
}) => {
  const gradientClasses =
    colors in PRESETS ? PRESETS[colors as GradientPreset] : colors;

  if (animated) {
    ensureKeyframes();
  }

  const animationStyle: React.CSSProperties = animated
    ? {
        backgroundSize: '200% 200%',
        animation: 'gradient-shift 4s ease infinite',
      }
    : {};

  return (
    <span
      className={`bg-gradient-to-r ${gradientClasses} bg-clip-text text-transparent ${className}`}
      style={animationStyle}
    >
      {children}
    </span>
  );
};

export default GradientText;
