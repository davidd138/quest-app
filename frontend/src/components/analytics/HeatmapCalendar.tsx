'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface ActivityData {
  date: string; // ISO date string YYYY-MM-DD
  count: number;
}

interface HeatmapCalendarProps {
  data: ActivityData[];
  weeks?: number;
}

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function getIntensityClass(count: number, max: number): string {
  if (count === 0) return 'bg-slate-800/60';
  const ratio = count / Math.max(max, 1);
  if (ratio < 0.25) return 'bg-violet-200/40';
  if (ratio < 0.5) return 'bg-violet-400/50';
  if (ratio < 0.75) return 'bg-violet-500/70';
  return 'bg-violet-600';
}

export default function HeatmapCalendar({ data, weeks = 52 }: HeatmapCalendarProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; count: number } | null>(null);

  const { grid, monthLabels, totalCount, maxCount } = useMemo(() => {
    // Build a map of date -> count
    const countMap = new Map<string, number>();
    let max = 0;
    let total = 0;

    for (const entry of data) {
      countMap.set(entry.date, (countMap.get(entry.date) || 0) + entry.count);
    }
    for (const c of countMap.values()) {
      if (c > max) max = c;
      total += c;
    }

    // Generate grid: weeks columns x 7 day rows
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const totalDays = weeks * 7;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + 1);

    // Adjust to start on Monday
    const dayOfWeek = startDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(startDate.getDate() + mondayOffset);

    const gridData: { date: string; count: number; isToday: boolean; week: number; day: number }[] = [];
    const months: { label: string; week: number }[] = [];
    let lastMonth = -1;

    const cursor = new Date(startDate);
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < 7; d++) {
        const dateStr = cursor.toISOString().split('T')[0];
        const count = countMap.get(dateStr) || 0;

        // Track month labels
        const month = cursor.getMonth();
        if (month !== lastMonth) {
          months.push({ label: MONTH_LABELS[month], week: w });
          lastMonth = month;
        }

        gridData.push({
          date: dateStr,
          count,
          isToday: dateStr === todayStr,
          week: w,
          day: d,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    return { grid: gridData, monthLabels: months, totalCount: total, maxCount: max };
  }, [data, weeks]);

  const cellSize = 12;
  const cellGap = 2;
  const labelOffset = 20;
  const topOffset = 18;
  const svgWidth = labelOffset + weeks * (cellSize + cellGap);
  const svgHeight = topOffset + 7 * (cellSize + cellGap);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {totalCount} actividades en el periodo
        </p>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span>Menos</span>
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm ${getIntensityClass(r * (maxCount || 1), maxCount || 1)}`}
            />
          ))}
          <span>Mas</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          className="block"
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Month labels */}
          {monthLabels.map((m, i) => (
            <text
              key={i}
              x={labelOffset + m.week * (cellSize + cellGap)}
              y={12}
              className="fill-slate-500"
              fontSize={10}
            >
              {m.label}
            </text>
          ))}

          {/* Day labels */}
          {DAY_LABELS.map((label, i) => (
            <text
              key={i}
              x={0}
              y={topOffset + i * (cellSize + cellGap) + cellSize - 2}
              className="fill-slate-600"
              fontSize={9}
            >
              {i % 2 === 0 ? label : ''}
            </text>
          ))}

          {/* Cells */}
          {grid.map((cell, i) => {
            const x = labelOffset + cell.week * (cellSize + cellGap);
            const y = topOffset + cell.day * (cellSize + cellGap);

            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={2}
                className={`${getIntensityClass(cell.count, maxCount)} transition-colors duration-150 cursor-pointer ${
                  cell.isToday ? 'stroke-violet-400 stroke-1' : ''
                }`}
                onMouseEnter={(e) => {
                  const rect = (e.target as SVGRectElement).getBoundingClientRect();
                  setTooltip({
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                    date: cell.date,
                    count: cell.count,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 40,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="glass rounded-lg px-3 py-1.5 text-xs shadow-xl border border-slate-700/50">
            <p className="text-white font-medium">
              {tooltip.count} {tooltip.count === 1 ? 'actividad' : 'actividades'}
            </p>
            <p className="text-slate-400">
              {new Date(tooltip.date + 'T12:00:00').toLocaleDateString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
