'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface QuestDurationProps {
  /** Duration in minutes. */
  minutes: number;
  /** Compact display mode (e.g. "45m" instead of "45 min"). */
  compact?: boolean;
  /** Extra wrapper classes. */
  className?: string;
}

function formatDuration(minutes: number, compact: boolean): string {
  if (compact) {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h${m}m` : `${h}h`;
  }
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function getDurationColor(minutes: number): string {
  if (minutes < 30) return 'text-emerald-400';
  if (minutes <= 60) return 'text-amber-400';
  return 'text-rose-400';
}

const QuestDuration: React.FC<QuestDurationProps> = ({
  minutes,
  compact = false,
  className = '',
}) => {
  const color = getDurationColor(minutes);
  const label = formatDuration(minutes, compact);

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${color} ${className}`}
      aria-label={`Duration: ${formatDuration(minutes, false)}`}
    >
      <Clock size={compact ? 12 : 14} />
      {label}
    </span>
  );
};

export default QuestDuration;
