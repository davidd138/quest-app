'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Card from '@/components/ui/Card';

// ---------- Types ----------

type TimeRange = '7d' | '30d' | '90d' | '1y';

interface DataPoint {
  date: string;
  users: number;
  completions: number;
}

// ---------- Mock Data ----------

const MOCK_DATA: Record<TimeRange, DataPoint[]> = {
  '7d': [
    { date: 'Mar 9', users: 220, completions: 27 },
    { date: 'Mar 10', users: 235, completions: 25 },
    { date: 'Mar 11', users: 240, completions: 30 },
    { date: 'Mar 12', users: 255, completions: 33 },
    { date: 'Mar 13', users: 260, completions: 35 },
    { date: 'Mar 14', users: 270, completions: 38 },
    { date: 'Mar 15', users: 280, completions: 40 },
  ],
  '30d': [
    { date: 'Feb 14', users: 120, completions: 10 },
    { date: 'Feb 17', users: 130, completions: 12 },
    { date: 'Feb 20', users: 140, completions: 15 },
    { date: 'Feb 23', users: 155, completions: 17 },
    { date: 'Feb 26', users: 165, completions: 19 },
    { date: 'Mar 1', users: 175, completions: 21 },
    { date: 'Mar 4', users: 190, completions: 24 },
    { date: 'Mar 7', users: 210, completions: 28 },
    { date: 'Mar 10', users: 235, completions: 31 },
    { date: 'Mar 13', users: 260, completions: 37 },
    { date: 'Mar 15', users: 280, completions: 40 },
  ],
  '90d': [
    { date: 'Dec', users: 45, completions: 3 },
    { date: 'Jan W1', users: 65, completions: 5 },
    { date: 'Jan W3', users: 85, completions: 8 },
    { date: 'Feb W1', users: 110, completions: 12 },
    { date: 'Feb W3', users: 145, completions: 18 },
    { date: 'Mar W1', users: 195, completions: 25 },
    { date: 'Mar W2', users: 260, completions: 37 },
    { date: 'Mar 15', users: 280, completions: 40 },
  ],
  '1y': [
    { date: 'Apr 25', users: 5, completions: 0 },
    { date: 'Jun 25', users: 15, completions: 2 },
    { date: 'Aug 25', users: 30, completions: 5 },
    { date: 'Oct 25', users: 50, completions: 10 },
    { date: 'Dec 25', users: 80, completions: 15 },
    { date: 'Jan 26', users: 120, completions: 20 },
    { date: 'Feb 26', users: 190, completions: 30 },
    { date: 'Mar 26', users: 280, completions: 40 },
  ],
};

// ---------- Component ----------

export default function UserActivityChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [showUsers, setShowUsers] = useState(true);
  const [showCompletions, setShowCompletions] = useState(true);

  const data = MOCK_DATA[timeRange];

  return (
    <Card variant="elevated" padding="none">
      <div className="px-5 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-heading font-semibold text-white">Daily Active Users & Completions</h3>
        <div className="flex items-center gap-4">
          {/* Series toggles */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUsers(!showUsers)}
              className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                showUsers ? 'text-violet-400' : 'text-slate-600 line-through'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${showUsers ? 'bg-violet-500' : 'bg-slate-700'}`} />
              Users
            </button>
            <button
              onClick={() => setShowCompletions(!showCompletions)}
              className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                showCompletions ? 'text-emerald-400' : 'text-slate-600 line-through'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${showCompletions ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              Completions
            </button>
          </div>

          {/* Time range selector */}
          <div className="flex gap-1">
            {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  timeRange === range
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                fontSize: 13,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}
              itemStyle={{ color: '#94a3b8' }}
            />
            {showUsers && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="users"
                stroke="#8b5cf6"
                fill="url(#userGrad)"
                strokeWidth={2}
                dot={{ r: 3, fill: '#8b5cf6' }}
                activeDot={{ r: 5, stroke: '#8b5cf6', strokeWidth: 2, fill: '#1e293b' }}
                name="Active Users"
              />
            )}
            {showCompletions && (
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="completions"
                stroke="#10b981"
                fill="url(#compGrad)"
                strokeWidth={2}
                dot={{ r: 3, fill: '#10b981' }}
                activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#1e293b' }}
                name="Completions"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
