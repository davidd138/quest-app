'use client';

import React, { useState, useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';
import type { HeatmapLayer } from 'react-map-gl';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, Eye, EyeOff } from 'lucide-react';

type TimeFilter = '24h' | '7d' | '30d';

interface ActivityPoint {
  id: string;
  latitude: number;
  longitude: number;
  playCount: number;
  lastActive: string;
}

interface ActivityHeatmapProps {
  /** Activity data points to render on the map. */
  points: ActivityPoint[];
  /** Whether the heatmap is initially visible. */
  defaultVisible?: boolean;
}

const TIME_FILTERS: { value: TimeFilter; label: string }[] = [
  { value: '24h', label: 'Last 24h' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

function isWithinTimeFilter(dateStr: string, filter: TimeFilter): boolean {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const hours = diffMs / (1000 * 60 * 60);

  switch (filter) {
    case '24h':
      return hours <= 24;
    case '7d':
      return hours <= 24 * 7;
    case '30d':
      return hours <= 24 * 30;
    default:
      return true;
  }
}

const LEGEND_STOPS = [
  { color: 'bg-blue-500', label: 'Low' },
  { color: 'bg-cyan-400', label: '' },
  { color: 'bg-emerald-400', label: 'Med' },
  { color: 'bg-amber-400', label: '' },
  { color: 'bg-rose-500', label: 'High' },
];

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  points,
  defaultVisible = true,
}) => {
  const [visible, setVisible] = useState(defaultVisible);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');

  const filteredPoints = useMemo(
    () => points.filter((p) => isWithinTimeFilter(p.lastActive, timeFilter)),
    [points, timeFilter],
  );

  const maxPlayCount = useMemo(
    () => Math.max(1, ...filteredPoints.map((p) => p.playCount)),
    [filteredPoints],
  );

  const geojson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: filteredPoints.map((p) => ({
        type: 'Feature' as const,
        properties: { intensity: p.playCount / maxPlayCount },
        geometry: {
          type: 'Point' as const,
          coordinates: [p.longitude, p.latitude],
        },
      })),
    }),
    [filteredPoints, maxPlayCount],
  );

  const heatmapLayer: HeatmapLayer = {
    id: 'activity-heatmap',
    type: 'heatmap',
    source: 'activity-heatmap-source',
    paint: {
      'heatmap-weight': ['get', 'intensity'],
      'heatmap-intensity': 1.2,
      'heatmap-radius': 30,
      'heatmap-opacity': 0.7,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'rgba(0,0,0,0)',
        0.2,
        'rgba(59,130,246,0.5)',
        0.4,
        'rgba(34,211,238,0.6)',
        0.6,
        'rgba(52,211,153,0.7)',
        0.8,
        'rgba(251,191,36,0.8)',
        1,
        'rgba(244,63,94,0.9)',
      ],
    },
  };

  return (
    <>
      {/* Heatmap layer */}
      {visible && filteredPoints.length > 0 && (
        <Source id="activity-heatmap-source" type="geojson" data={geojson}>
          <Layer {...heatmapLayer} />
        </Source>
      )}

      {/* Control panel */}
      <div className="absolute top-4 left-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-3 shadow-xl min-w-[220px]"
        >
          {/* Header with toggle */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-amber-400" />
              <span className="text-sm font-semibold text-white">Activity Heatmap</span>
            </div>
            <button
              onClick={() => setVisible((v) => !v)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              aria-label={visible ? 'Hide heatmap' : 'Show heatmap'}
            >
              {visible ? (
                <EyeOff size={14} className="text-slate-300" />
              ) : (
                <Eye size={14} className="text-slate-300" />
              )}
            </button>
          </div>

          {/* Time filters */}
          <AnimatePresence>
            {visible && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1 mb-3">
                  <Clock size={12} className="text-slate-400 mr-1" />
                  {TIME_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setTimeFilter(f.value)}
                      className={[
                        'px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer',
                        timeFilter === f.value
                          ? 'bg-violet-500/30 text-violet-300 border border-violet-400/30'
                          : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10 hover:text-slate-300',
                      ].join(' ')}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-1">
                  {LEGEND_STOPS.map((stop, i) => (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <div className={`w-full h-2 rounded-sm ${stop.color}`} />
                      {stop.label && (
                        <span className="text-[9px] text-slate-500 mt-0.5">{stop.label}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Point count */}
                <p className="text-[10px] text-slate-500 mt-2 text-center">
                  {filteredPoints.length} active area{filteredPoints.length !== 1 ? 's' : ''}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default ActivityHeatmap;
