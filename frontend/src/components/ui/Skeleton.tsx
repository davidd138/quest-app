'use client';

import React from 'react';

type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const variantDefaults: Record<SkeletonVariant, { width: string; height: string; classes: string }> = {
  text: { width: '100%', height: '1rem', classes: 'rounded-md' },
  circular: { width: '3rem', height: '3rem', classes: 'rounded-full' },
  rectangular: { width: '100%', height: '8rem', classes: 'rounded-xl' },
  card: { width: '100%', height: '12rem', classes: 'rounded-2xl' },
};

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const defaults = variantDefaults[variant];
  const w = width ?? defaults.width;
  const h = height ?? defaults.height;

  return (
    <div
      className={[
        'animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:400%_100%]',
        defaults.classes,
        className,
      ].join(' ')}
      style={{
        width: typeof w === 'number' ? `${w}px` : w,
        height: typeof h === 'number' ? `${h}px` : h,
      }}
    />
  );
};

export default Skeleton;
