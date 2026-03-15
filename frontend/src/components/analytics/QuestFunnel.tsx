'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FunnelStage {
  name: string;
  players: number;
  dropOff: number;
}

interface QuestFunnelProps {
  stages: FunnelStage[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function retentionColor(dropOff: number): string {
  if (dropOff === 0) return 'rgb(16, 185, 129)'; // emerald-500
  if (dropOff < 15) return 'rgb(52, 211, 153)'; // emerald-400
  if (dropOff < 25) return 'rgb(250, 204, 21)'; // yellow-400
  if (dropOff < 40) return 'rgb(251, 146, 60)'; // orange-400
  return 'rgb(239, 68, 68)'; // red-500
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function QuestFunnel({ stages }: QuestFunnelProps) {
  if (stages.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-slate-500 text-sm">
        No funnel data available
      </div>
    );
  }

  const maxPlayers = stages[0]?.players || 1;

  return (
    <div className="space-y-2" role="list" aria-label="Quest completion funnel">
      {stages.map((stage, i) => {
        const widthPct = Math.max((stage.players / maxPlayers) * 100, 10);
        const barColor = retentionColor(stage.dropOff);

        return (
          <div key={i} role="listitem">
            {/* Drop-off indicator between stages */}
            {i > 0 && stage.dropOff > 0 && (
              <div className="flex items-center gap-2 pl-3 mb-1">
                <div className="w-px h-3 bg-slate-700" />
                <span
                  className="text-[10px] font-medium"
                  style={{ color: retentionColor(stage.dropOff) }}
                >
                  -{stage.dropOff}% drop-off
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Stage number */}
              <div className="w-7 h-7 rounded-lg bg-navy-800 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-slate-400">{i + 1}</span>
              </div>

              {/* Stage name */}
              <span className="text-xs text-slate-400 w-28 truncate shrink-0" title={stage.name}>
                {stage.name}
              </span>

              {/* Bar */}
              <div className="flex-1 relative h-8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.08,
                    ease: 'easeOut',
                  }}
                  className="h-full rounded-lg flex items-center justify-end px-3"
                  style={{
                    backgroundColor: barColor,
                    opacity: 0.85,
                    minWidth: 40,
                  }}
                >
                  <span className="text-xs font-semibold text-white whitespace-nowrap drop-shadow-sm">
                    {stage.players.toLocaleString()}
                  </span>
                </motion.div>
              </div>

              {/* Retention percentage */}
              <span className="text-xs text-slate-500 w-12 text-right shrink-0">
                {Math.round((stage.players / maxPlayers) * 100)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
