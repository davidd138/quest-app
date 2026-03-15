'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  dark?: boolean;
  linkTo?: string;
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="logoNeedleN" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="logoNeedleS" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="60" cy="60" r="55" stroke="url(#logoRing)" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.7" />
      {/* Inner ring */}
      <circle cx="60" cy="60" r="42" stroke="#a78bfa" strokeWidth="1.5" opacity="0.3" />
      {/* Cardinal ticks */}
      {[0, 90, 180, 270].map((angle) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        const x1 = 60 + Math.cos(rad) * 42;
        const y1 = 60 + Math.sin(rad) * 42;
        const x2 = 60 + Math.cos(rad) * 49;
        const y2 = 60 + Math.sin(rad) * 49;
        return (
          <line
            key={angle}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={angle === 0 ? '#c4b5fd' : '#a78bfa'}
            strokeWidth={angle === 0 ? 3 : 2}
            strokeLinecap="round"
          />
        );
      })}
      {/* Needle North */}
      <motion.g
        className="origin-center"
        style={{ transformOrigin: '60px 60px' }}
        whileHover={{ rotate: [0, 15, -10, 5, 0] }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        <polygon points="60,18 54,60 66,60" fill="url(#logoNeedleN)" />
        <polygon points="60,102 54,60 66,60" fill="url(#logoNeedleS)" />
      </motion.g>
      {/* Center */}
      <circle cx="60" cy="60" r="6" fill="#7c3aed" />
      <circle cx="60" cy="60" r="3" fill="white" />
    </svg>
  );
}

const sizeConfig = {
  sm: {
    icon: 'w-8 h-8',
    container: 'w-10 h-10',
    text: 'text-lg',
    showText: false,
  },
  md: {
    icon: 'w-7 h-7',
    container: 'w-10 h-10',
    text: 'text-xl',
    showText: true,
  },
  lg: {
    icon: 'w-16 h-16',
    container: 'w-20 h-20',
    text: 'text-4xl',
    showText: true,
  },
};

export function Logo({ size = 'md', dark = false, linkTo }: LogoProps) {
  const config = sizeConfig[size];

  const content = (
    <motion.div
      className="flex items-center gap-3 group cursor-pointer select-none"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div
        className={`${config.container} rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/25`}
      >
        <CompassIcon className={config.icon} />
      </div>
      {config.showText && (
        <span
          className={`font-heading ${config.text} font-bold whitespace-nowrap ${
            dark ? 'text-navy-900' : 'text-white'
          }`}
        >
          Quest
          <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
            Master
          </span>
        </span>
      )}
    </motion.div>
  );

  if (linkTo) {
    return <Link href={linkTo}>{content}</Link>;
  }

  return content;
}
