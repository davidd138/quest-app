'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import Button from './Button';

interface EmptyStateProps {
  /** Headline text. */
  title: string;
  /** Supporting description. */
  description?: string;
  /** Override the default compass illustration with a Lucide icon. */
  icon?: LucideIcon;
  /** CTA button label. */
  actionLabel?: string;
  /** CTA button href (renders a Next Link). */
  actionHref?: string;
  /** CTA button click handler (used when no href). */
  onAction?: () => void;
  /** Extra wrapper classes. */
  className?: string;
}

/** CSS-art compass with a question mark — purely decorative. */
const CompassIllustration: React.FC = () => (
  <div className="relative mx-auto mb-6 h-24 w-24" aria-hidden="true">
    {/* Outer ring */}
    <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 bg-violet-500/5" />
    {/* Inner ring */}
    <div className="absolute inset-3 rounded-full border border-violet-400/20 bg-violet-500/5" />
    {/* Cardinal ticks */}
    <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-violet-400/60">
      N
    </span>
    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-violet-400/40">
      S
    </span>
    <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] font-bold text-violet-400/40">
      O
    </span>
    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-bold text-violet-400/40">
      E
    </span>
    {/* Needle / question mark */}
    <motion.span
      initial={{ rotate: -15 }}
      animate={{ rotate: 15 }}
      transition={{ repeat: Infinity, repeatType: 'mirror', duration: 2, ease: 'easeInOut' }}
      className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-violet-400"
    >
      ?
    </motion.span>
  </div>
);

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={[
        'w-full max-w-md mx-auto rounded-2xl p-8 text-center',
        'bg-white/5 backdrop-blur-xl border border-violet-500/15 shadow-xl shadow-violet-500/5',
        className,
      ].join(' ')}
    >
      {/* Illustration or icon */}
      {Icon ? (
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 border border-violet-500/20">
          <Icon size={28} className="text-violet-400" />
        </div>
      ) : (
        <CompassIllustration />
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          {description}
        </p>
      )}

      {/* CTA */}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="inline-block">
          <Button variant="primary" size="md">
            {actionLabel}
          </Button>
        </Link>
      )}
      {actionLabel && !actionHref && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
