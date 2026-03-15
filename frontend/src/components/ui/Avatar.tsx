'use client';

import React, { useState } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type RingColor = 'violet' | 'emerald' | 'amber' | 'rose' | 'none';

interface AvatarProps {
  /** Image source URL. */
  src?: string | null;
  /** User name — used for alt text and initial fallback. */
  name?: string;
  /** Avatar size. */
  size?: AvatarSize;
  /** Show an online/offline status indicator dot. */
  status?: 'online' | 'offline' | null;
  /** Ring accent color. */
  ring?: RingColor;
  /** Extra wrapper classes. */
  className?: string;
}

const sizeMap: Record<AvatarSize, { container: string; text: string; dot: string }> = {
  xs: { container: 'h-6 w-6', text: 'text-[10px]', dot: 'h-1.5 w-1.5 border' },
  sm: { container: 'h-8 w-8', text: 'text-xs', dot: 'h-2 w-2 border' },
  md: { container: 'h-10 w-10', text: 'text-sm', dot: 'h-2.5 w-2.5 border-2' },
  lg: { container: 'h-14 w-14', text: 'text-lg', dot: 'h-3 w-3 border-2' },
  xl: { container: 'h-20 w-20', text: 'text-2xl', dot: 'h-3.5 w-3.5 border-2' },
};

const ringStyles: Record<RingColor, string> = {
  violet: 'ring-2 ring-violet-500/60',
  emerald: 'ring-2 ring-emerald-500/60',
  amber: 'ring-2 ring-amber-500/60',
  rose: 'ring-2 ring-rose-500/60',
  none: '',
};

/** Deterministic gradient based on the name string. */
const gradientPalette = [
  'from-violet-600 to-indigo-600',
  'from-emerald-600 to-teal-600',
  'from-amber-600 to-orange-600',
  'from-rose-600 to-pink-600',
  'from-blue-600 to-cyan-600',
  'from-fuchsia-600 to-purple-600',
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradientPalette[Math.abs(hash) % gradientPalette.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'md',
  status = null,
  ring = 'none',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const sizeConfig = sizeMap[size];
  const showImage = src && !imgError;

  return (
    <div
      className={[
        'relative inline-flex items-center justify-center rounded-full flex-shrink-0 overflow-hidden',
        sizeConfig.container,
        ringStyles[ring],
        className,
      ].join(' ')}
      aria-label={name || undefined}
    >
      {/* Fallback: gradient + initials */}
      <div
        className={[
          'absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br',
          getGradient(name),
          showImage && imgLoaded ? 'opacity-0' : 'opacity-100',
          'transition-opacity duration-200',
        ].join(' ')}
        aria-hidden="true"
      >
        <span className={`font-semibold text-white select-none ${sizeConfig.text}`}>
          {getInitials(name)}
        </span>
      </div>

      {/* Skeleton shimmer while image loads */}
      {showImage && !imgLoaded && (
        <div
          className="absolute inset-0 animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:400%_100%] rounded-full"
          aria-hidden="true"
        />
      )}

      {/* Image */}
      {showImage && (
        <img
          src={src}
          alt={name || 'Avatar'}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          className={[
            'absolute inset-0 h-full w-full rounded-full object-cover',
            imgLoaded ? 'opacity-100' : 'opacity-0',
            'transition-opacity duration-200',
          ].join(' ')}
        />
      )}

      {/* Status dot */}
      {status && (
        <span
          className={[
            'absolute bottom-0 right-0 rounded-full border-navy-950',
            sizeConfig.dot,
            status === 'online' ? 'bg-emerald-400' : 'bg-slate-500',
          ].join(' ')}
          aria-label={status === 'online' ? 'En linea' : 'Desconectado'}
        />
      )}
    </div>
  );
};

export default Avatar;
