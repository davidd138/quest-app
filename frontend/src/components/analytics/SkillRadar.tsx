'use client';

import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface SkillData {
  subject: string;
  current: number;
  previous: number;
}

interface SkillRadarProps {
  data: SkillData[];
}

const DEFAULT_SKILLS: SkillData[] = [
  { subject: 'Comunicacion', current: 0, previous: 0 },
  { subject: 'Conocimiento', current: 0, previous: 0 },
  { subject: 'Persuasion', current: 0, previous: 0 },
  { subject: 'Creatividad', current: 0, previous: 0 },
  { subject: 'Resolucion', current: 0, previous: 0 },
  { subject: 'Velocidad', current: 0, previous: 0 },
];

export default function SkillRadar({ data }: SkillRadarProps) {
  const chartData = data.length > 0 ? data : DEFAULT_SKILLS;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid stroke="rgba(148,163,184,0.1)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#64748b', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 10 }}
          />
          <Radar
            name="Periodo anterior"
            dataKey="previous"
            stroke="#64748b"
            fill="transparent"
            strokeWidth={1.5}
            strokeDasharray="5 5"
          />
          <Radar
            name="Actual"
            dataKey="current"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.15}
            strokeWidth={2}
            animationDuration={1200}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value: string) => (
              <span className="text-slate-400">{value}</span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
