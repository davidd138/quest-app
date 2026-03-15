'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import {
  Map,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Check,
  MapPin,
  GripVertical,
} from 'lucide-react';
import type { Stage } from '@/types';

/* ─── Types ──────────────────────────────────────────────────────────── */

type MinimapSize = 'sm' | 'md' | 'lg';

interface QuestMinimapProps {
  stages: Stage[];
  currentStageIndex: number;
  completedStageIds: Set<string>;
  /** Initial visibility state. */
  defaultVisible?: boolean;
  /** Initial size preset. */
  defaultSize?: MinimapSize;
  className?: string;
}

/* ─── Size presets ───────────────────────────────────────────────────── */

const sizeConfig: Record<MinimapSize, { width: number; height: number }> = {
  sm: { width: 180, height: 140 },
  md: { width: 260, height: 200 },
  lg: { width: 360, height: 280 },
};

/* ─── Helpers ────────────────────────────────────────────────────────── */

/** Convert lat/lng to normalised [0–1] coordinates within the bounding box. */
function normaliseCoordinates(
  stages: Stage[],
): { stageId: string; x: number; y: number }[] {
  if (stages.length === 0) return [];
  if (stages.length === 1) {
    return [{ stageId: stages[0].id, x: 0.5, y: 0.5 }];
  }

  const lats = stages.map((s) => s.location.latitude);
  const lngs = stages.map((s) => s.location.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  const padding = 0.1; // 10% padding

  return stages.map((s) => ({
    stageId: s.id,
    x: padding + ((s.location.longitude - minLng) / lngRange) * (1 - 2 * padding),
    // Invert y because latitude increases upward but screen y increases downward
    y: padding + ((maxLat - s.location.latitude) / latRange) * (1 - 2 * padding),
  }));
}

/* ─── Component ──────────────────────────────────────────────────────── */

const QuestMinimap: React.FC<QuestMinimapProps> = ({
  stages,
  currentStageIndex,
  completedStageIds,
  defaultVisible = true,
  defaultSize = 'md',
  className = '',
}) => {
  const [visible, setVisible] = useState(defaultVisible);
  const [size, setSize] = useState<MinimapSize>(defaultSize);
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);
  const points = normaliseCoordinates(sortedStages);
  const { width, height } = sizeConfig[size];

  const cycleSize = useCallback(() => {
    setSize((prev) => {
      if (prev === 'sm') return 'md';
      if (prev === 'md') return 'lg';
      return 'sm';
    });
  }, []);

  // Set up the constraint boundary as the window
  useEffect(() => {
    if (constraintsRef.current) {
      constraintsRef.current.style.position = 'fixed';
      constraintsRef.current.style.inset = '0';
      constraintsRef.current.style.pointerEvents = 'none';
      constraintsRef.current.style.zIndex = '9998';
    }
  }, []);

  return (
    <>
      {/* Drag constraints boundary */}
      <div ref={constraintsRef} />

      {/* Toggle button when hidden */}
      {!visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => setVisible(true)}
          className={[
            'fixed bottom-4 right-4 z-[9999] p-3 rounded-xl',
            'bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/30',
            'hover:bg-white/15 transition-colors cursor-pointer',
            className,
          ].join(' ')}
          aria-label="Show minimap"
        >
          <Map size={18} className="text-violet-400" />
        </motion.button>
      )}

      {/* Minimap */}
      {visible && (
        <motion.div
          drag
          dragControls={dragControls}
          dragMomentum={false}
          dragConstraints={constraintsRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{ width, height: height + 36 }} // +36 for toolbar
          className={[
            'fixed bottom-4 right-4 z-[9999] rounded-2xl overflow-hidden',
            'bg-navy-950/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40',
            'pointer-events-auto select-none',
            className,
          ].join(' ')}
        >
          {/* Toolbar */}
          <div
            className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="flex items-center gap-1.5">
              <GripVertical size={12} className="text-slate-500" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Minimap
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={cycleSize}
                className="p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                title={`Resize (${size})`}
                aria-label="Resize minimap"
              >
                {size === 'lg' ? (
                  <Minimize2 size={12} className="text-slate-400" />
                ) : (
                  <Maximize2 size={12} className="text-slate-400" />
                )}
              </button>
              <button
                onClick={() => setVisible(false)}
                className="p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                title="Hide minimap"
                aria-label="Hide minimap"
              >
                <EyeOff size={12} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Map area */}
          <div className="relative" style={{ width, height }}>
            {/* Background grid */}
            <svg
              width={width}
              height={height}
              className="absolute inset-0 opacity-10"
              aria-hidden="true"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <React.Fragment key={i}>
                  <line
                    x1={0}
                    y1={(height / 5) * i}
                    x2={width}
                    y2={(height / 5) * i}
                    stroke="white"
                    strokeWidth={0.5}
                  />
                  <line
                    x1={(width / 5) * i}
                    y1={0}
                    x2={(width / 5) * i}
                    y2={height}
                    stroke="white"
                    strokeWidth={0.5}
                  />
                </React.Fragment>
              ))}
            </svg>

            {/* Connection lines between stages */}
            {points.length > 1 && (
              <svg
                width={width}
                height={height}
                className="absolute inset-0"
                aria-hidden="true"
              >
                {points.slice(1).map((point, i) => {
                  const prev = points[i];
                  const isCompleted =
                    completedStageIds.has(sortedStages[i].id) &&
                    completedStageIds.has(sortedStages[i + 1].id);
                  return (
                    <line
                      key={i}
                      x1={prev.x * width}
                      y1={prev.y * height}
                      x2={point.x * width}
                      y2={point.y * height}
                      stroke={isCompleted ? '#34d399' : '#475569'}
                      strokeWidth={1.5}
                      strokeDasharray={isCompleted ? 'none' : '4 3'}
                    />
                  );
                })}
              </svg>
            )}

            {/* Stage markers */}
            {points.map((point, index) => {
              const stage = sortedStages[index];
              const isCompleted = completedStageIds.has(stage.id);
              const isCurrent = index === currentStageIndex;

              return (
                <motion.div
                  key={stage.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: point.x * width, top: point.y * height }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.08, type: 'spring', stiffness: 300 }}
                >
                  {/* Marker */}
                  <div
                    className={[
                      'w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all',
                      isCompleted
                        ? 'bg-emerald-500/30 border-emerald-400'
                        : isCurrent
                          ? 'bg-violet-500/30 border-violet-400 shadow-md shadow-violet-500/40'
                          : 'bg-slate-700/50 border-slate-500',
                    ].join(' ')}
                  >
                    {isCompleted ? (
                      <Check size={10} className="text-emerald-300" />
                    ) : isCurrent ? (
                      <motion.div
                        className="w-2 h-2 rounded-full bg-violet-400"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    ) : (
                      <span className="text-[8px] font-bold text-slate-400">
                        {stage.order}
                      </span>
                    )}
                  </div>

                  {/* Label (only on md/lg) */}
                  {size !== 'sm' && (
                    <span className="mt-0.5 text-[8px] text-slate-400 max-w-[60px] truncate text-center leading-tight">
                      {stage.title}
                    </span>
                  )}
                </motion.div>
              );
            })}

            {/* Current location indicator */}
            {points[currentStageIndex] && (
              <motion.div
                className="absolute -translate-x-1/2 -translate-y-full"
                style={{
                  left: points[currentStageIndex].x * width,
                  top: points[currentStageIndex].y * height - 14,
                }}
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              >
                <MapPin size={14} className="text-violet-400" />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default QuestMinimap;
