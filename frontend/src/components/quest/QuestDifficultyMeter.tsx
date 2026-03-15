'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, RotateCcw } from 'lucide-react';

// ---------- Types ----------

interface QuestDifficultyMeterProps {
  difficulty: number; // 1-10
  avgCompletionTime?: number; // minutes
  successRate?: number; // 0-100
  avgAttempts?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ---------- Constants ----------

const LABEL_MAP: { max: number; label: string; color: string }[] = [
  { max: 3, label: 'Facil', color: '#22c55e' },
  { max: 5, label: 'Media', color: '#eab308' },
  { max: 7, label: 'Dificil', color: '#f97316' },
  { max: 10, label: 'Legendaria', color: '#ef4444' },
];

function getDifficultyInfo(difficulty: number) {
  const clamped = Math.max(1, Math.min(10, difficulty));
  const entry = LABEL_MAP.find((e) => clamped <= e.max) ?? LABEL_MAP[LABEL_MAP.length - 1];
  return { label: entry.label, color: entry.color };
}

function getGradientColor(t: number): string {
  // t: 0 to 1 => green -> yellow -> orange -> red
  if (t < 0.33) {
    return `hsl(${120 - t * 180}, 80%, 50%)`;
  }
  if (t < 0.66) {
    return `hsl(${120 - t * 180}, 85%, 50%)`;
  }
  return `hsl(${120 - t * 120}, 80%, 50%)`;
}

// ---------- Size configs ----------

const sizeConfig = {
  sm: { width: 140, height: 90, strokeWidth: 8, radius: 55, fontSize: 'text-lg' },
  md: { width: 200, height: 120, strokeWidth: 10, radius: 75, fontSize: 'text-2xl' },
  lg: { width: 260, height: 155, strokeWidth: 12, radius: 100, fontSize: 'text-3xl' },
};

// ---------- Main Component ----------

export default function QuestDifficultyMeter({
  difficulty,
  avgCompletionTime,
  successRate,
  avgAttempts,
  size = 'md',
  className = '',
}: QuestDifficultyMeterProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const config = sizeConfig[size];
  const info = getDifficultyInfo(difficulty);
  const clamped = Math.max(1, Math.min(10, difficulty));
  const normalizedValue = (clamped - 1) / 9; // 0 to 1

  // Arc geometry (half circle, 180 degrees)
  const centerX = config.width / 2;
  const centerY = config.height;
  const startAngle = Math.PI; // left
  const endAngle = 0; // right

  // Generate the arc path
  const arcPath = (fraction: number) => {
    const angle = startAngle - fraction * Math.PI;
    const x = centerX + config.radius * Math.cos(angle);
    const y = centerY - config.radius * Math.sin(angle);
    return { x, y };
  };

  // Background arc path
  const bgArcD = (() => {
    const start = arcPath(0);
    const end = arcPath(1);
    return `M ${start.x} ${start.y} A ${config.radius} ${config.radius} 0 0 1 ${end.x} ${end.y}`;
  })();

  // Needle endpoint
  const needleEnd = arcPath(normalizedValue);

  // Generate gradient arc segments
  const gradientSegments = 40;
  const arcSegments = Array.from({ length: gradientSegments }).map((_, i) => {
    const t1 = i / gradientSegments;
    const t2 = (i + 1) / gradientSegments;
    const p1 = arcPath(t1);
    const p2 = arcPath(t2);
    const color = getGradientColor(t1);
    return { p1, p2, color, t: t1 };
  });

  useEffect(() => {
    // Animate the needle value
    const timer = setTimeout(() => setAnimatedValue(normalizedValue), 100);
    return () => clearTimeout(timer);
  }, [normalizedValue]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`glass rounded-2xl border border-white/10 p-5 ${className}`}
    >
      {/* Gauge */}
      <div className="flex justify-center mb-2">
        <div className="relative" style={{ width: config.width, height: config.height + 10 }}>
          <svg
            width={config.width}
            height={config.height + 10}
            viewBox={`0 0 ${config.width} ${config.height + 10}`}
          >
            {/* Background arc */}
            <path
              d={bgArcD}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
            />

            {/* Colored gradient segments */}
            {arcSegments.map((seg, i) => (
              <motion.line
                key={i}
                x1={seg.p1.x}
                y1={seg.p1.y}
                x2={seg.p2.x}
                y2={seg.p2.y}
                stroke={seg.color}
                strokeWidth={config.strokeWidth}
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: seg.t <= normalizedValue ? 0.8 : 0.1 }}
                transition={{ duration: 0.8, delay: seg.t * 0.5 }}
              />
            ))}

            {/* Needle */}
            <motion.line
              x1={centerX}
              y1={centerY}
              initial={{
                x2: centerX + config.radius * Math.cos(startAngle) * 0.7,
                y2: centerY - config.radius * Math.sin(startAngle) * 0.7,
              }}
              animate={{
                x2: centerX + config.radius * Math.cos(startAngle - animatedValue * Math.PI) * 0.7,
                y2: centerY - config.radius * Math.sin(startAngle - animatedValue * Math.PI) * 0.7,
              }}
              transition={{ type: 'spring', stiffness: 60, damping: 12, delay: 0.3 }}
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
            />

            {/* Center dot */}
            <circle cx={centerX} cy={centerY} r={4} fill="white" />

            {/* Glowing dot at needle tip */}
            <motion.circle
              initial={{
                cx: centerX + config.radius * Math.cos(startAngle) * 0.7,
                cy: centerY - config.radius * Math.sin(startAngle) * 0.7,
              }}
              animate={{
                cx: centerX + config.radius * Math.cos(startAngle - animatedValue * Math.PI) * 0.7,
                cy: centerY - config.radius * Math.sin(startAngle - animatedValue * Math.PI) * 0.7,
              }}
              transition={{ type: 'spring', stiffness: 60, damping: 12, delay: 0.3 }}
              r={5}
              fill={info.color}
            />
          </svg>

          {/* Pulsing glow at current level */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.4, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute rounded-full blur-md"
            style={{
              width: 16,
              height: 16,
              backgroundColor: info.color,
              left: needleEnd.x - 8,
              top: needleEnd.y - 8,
            }}
          />

          {/* Scale labels */}
          <span className="absolute bottom-0 left-0 text-[10px] text-slate-600 font-medium">1</span>
          <span className="absolute bottom-0 right-0 text-[10px] text-slate-600 font-medium">10</span>

          {/* Center value */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className={`${config.fontSize} font-bold text-white block`}
            >
              {clamped}
            </motion.span>
          </div>
        </div>
      </div>

      {/* Difficulty label */}
      <div className="text-center mb-4">
        <motion.span
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
          style={{
            color: info.color,
            backgroundColor: `${info.color}20`,
          }}
        >
          {info.label}
        </motion.span>
      </div>

      {/* Stats */}
      {(avgCompletionTime !== undefined || successRate !== undefined || avgAttempts !== undefined) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="grid grid-cols-3 gap-3 border-t border-white/5 pt-4"
        >
          {avgCompletionTime !== undefined && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock size={12} className="text-slate-500" />
              </div>
              <p className="text-sm font-bold text-white">{avgCompletionTime}m</p>
              <p className="text-[10px] text-slate-600">Avg. time</p>
            </div>
          )}
          {successRate !== undefined && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target size={12} className="text-slate-500" />
              </div>
              <p className="text-sm font-bold text-white">{successRate}%</p>
              <p className="text-[10px] text-slate-600">Success rate</p>
            </div>
          )}
          {avgAttempts !== undefined && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <RotateCcw size={12} className="text-slate-500" />
              </div>
              <p className="text-sm font-bold text-white">{avgAttempts.toFixed(1)}</p>
              <p className="text-[10px] text-slate-600">Avg. attempts</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
