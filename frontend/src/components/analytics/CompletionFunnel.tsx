'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FunnelStage {
  label: string;
  count: number;
  percentage: number;
}

interface CompletionFunnelProps {
  stages: FunnelStage[];
}

function interpolateColor(ratio: number): string {
  // Gradient from violet (#8b5cf6) to emerald (#10b981)
  const r = Math.round(139 + (16 - 139) * ratio);
  const g = Math.round(92 + (185 - 92) * ratio);
  const b = Math.round(246 + (129 - 246) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function CompletionFunnel({ stages }: CompletionFunnelProps) {
  if (stages.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-slate-500 text-sm">
        No hay datos disponibles
      </div>
    );
  }

  const maxCount = stages[0]?.count || 1;

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const widthPct = Math.max((stage.count / maxCount) * 100, 8);
        const colorRatio = stages.length > 1 ? i / (stages.length - 1) : 0;
        const color = interpolateColor(colorRatio);
        const dropoff =
          i > 0 && stages[i - 1].count > 0
            ? Math.round(((stages[i - 1].count - stage.count) / stages[i - 1].count) * 100)
            : 0;

        return (
          <div key={i} className="space-y-1">
            {/* Drop-off indicator */}
            {i > 0 && dropoff > 0 && (
              <div className="flex items-center gap-2 pl-2">
                <div className="w-px h-3 bg-slate-700" />
                <span className="text-[10px] text-rose-400/70">
                  -{dropoff}% abandonaron
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-24 text-right flex-shrink-0 truncate">
                {stage.label}
              </span>
              <div className="flex-1 relative h-8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                  className="h-full rounded-lg flex items-center justify-end px-3"
                  style={{ backgroundColor: color, minWidth: 40 }}
                >
                  <span className="text-xs font-medium text-white whitespace-nowrap">
                    {stage.count}
                  </span>
                </motion.div>
              </div>
              <span className="text-xs text-slate-500 w-12 flex-shrink-0 text-right">
                {stage.percentage}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
