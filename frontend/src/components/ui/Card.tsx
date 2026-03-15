'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type CardVariant = 'default' | 'elevated' | 'interactive';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: CardVariant;
  padding?: CardPadding;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-white/5 backdrop-blur-xl border border-white/10',
  elevated:
    'bg-white/[0.08] backdrop-blur-xl border border-white/15 shadow-xl shadow-black/20',
  interactive:
    'bg-white/5 backdrop-blur-xl border border-white/10 cursor-pointer',
};

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  header,
  footer,
  children,
  className = '',
  ...motionProps
}) => {
  const isInteractive = variant === 'interactive';

  return (
    <motion.div
      whileHover={
        isInteractive
          ? { scale: 1.02, borderColor: 'rgba(255,255,255,0.2)' }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={[
        'rounded-2xl',
        variantStyles[variant],
        header || footer ? '' : paddingStyles[padding],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...motionProps}
    >
      {header && (
        <div className={`border-b border-white/10 ${paddingStyles[padding]}`}>
          {header}
        </div>
      )}
      <div className={header || footer ? paddingStyles[padding] : ''}>
        {children}
      </div>
      {footer && (
        <div className={`border-t border-white/10 ${paddingStyles[padding]}`}>
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default Card;
