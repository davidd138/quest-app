'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Download,
  ArrowLeft,
  Calendar,
  Zap,
  Brain,
  Flame,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_ANALYTICS } from '@/lib/graphql/queries';
import Button from '@/components/ui/Button';
import HeatmapCalendar from '@/components/analytics/HeatmapCalendar';
import SkillRadar from '@/components/analytics/SkillRadar';
import CompletionFunnel from '@/components/analytics/CompletionFunnel';
import type { Analytics } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CHART_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#a78bfa', '#34d399', '#818cf8', '#fb923c'];

type DateRange = '7d' | '30d' | '90d' | '1y';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 shadow-xl border border-slate-700/50">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((item: { name: string; value: number; color: string }, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

export default function DetailedAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const { data: analytics, loading, execute } = useQuery<Analytics>(GET_ANALYTICS);

  useEffect(() => {
    execute();
  }, [execute]);

  // Build heatmap data from recent activity
  const heatmapData = useMemo(() => {
    if (!analytics?.recentActivity) return [];
    const dateMap = new Map<string, number>();
    for (const act of analytics.recentActivity) {
      const dateStr = act.date.split('T')[0];
      dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
    }
    return Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }));
  }, [analytics]);

  // Skill radar data (derived from category breakdown)
  const skillData = useMemo(() => {
    const categories = analytics?.categoryBreakdown || [];
    const skillMap: Record<string, { current: number; previous: number }> = {
      Comunicacion: { current: 0, previous: 0 },
      Conocimiento: { current: 0, previous: 0 },
      Persuasion: { current: 0, previous: 0 },
      Creatividad: { current: 0, previous: 0 },
      Resolucion: { current: 0, previous: 0 },
      Velocidad: { current: 0, previous: 0 },
    };

    // Derive skills from category scores
    for (const cat of categories) {
      const score = Math.round(cat.averageScore);
      if (cat.category === 'educational' || cat.category === 'cultural') {
        skillMap.Conocimiento.current = Math.max(skillMap.Conocimiento.current, score);
      }
      if (cat.category === 'mystery' || cat.category === 'adventure') {
        skillMap.Resolucion.current = Math.max(skillMap.Resolucion.current, score);
      }
      if (cat.category === 'culinary' || cat.category === 'nature') {
        skillMap.Creatividad.current = Math.max(skillMap.Creatividad.current, score);
      }
      if (cat.category === 'urban' || cat.category === 'team_building') {
        skillMap.Comunicacion.current = Math.max(skillMap.Comunicacion.current, score);
      }
      skillMap.Persuasion.current = Math.max(skillMap.Persuasion.current, Math.round(score * 0.8));
      skillMap.Velocidad.current = Math.max(skillMap.Velocidad.current, Math.round(score * 0.7));
    }

    // Simulated previous period (70% of current for demo)
    for (const key of Object.keys(skillMap)) {
      skillMap[key].previous = Math.round(skillMap[key].current * 0.7);
    }

    return Object.entries(skillMap).map(([subject, vals]) => ({
      subject,
      current: vals.current,
      previous: vals.previous,
    }));
  }, [analytics]);

  // Completion funnel
  const funnelData = useMemo(() => {
    const total = analytics?.totalQuests || 0;
    const completed = analytics?.questsCompleted || 0;
    if (total === 0) return [];

    const started = total;
    const stage1 = Math.round(started * 0.8);
    const stage2 = Math.round(started * 0.6);
    const stage3 = Math.round(started * 0.4);

    const stages = [
      { label: 'Iniciadas', count: started, percentage: 100 },
      { label: 'Etapa 1', count: stage1, percentage: Math.round((stage1 / started) * 100) },
      { label: 'Etapa 2', count: stage2, percentage: Math.round((stage2 / started) * 100) },
      { label: 'Etapa 3', count: stage3, percentage: Math.round((stage3 / started) * 100) },
      { label: 'Completadas', count: completed, percentage: Math.round((completed / started) * 100) },
    ];

    return stages;
  }, [analytics]);

  // Time of day analysis
  const timeOfDayData = useMemo(() => {
    const hours: { hour: string; count: number }[] = [];
    for (let i = 0; i < 24; i++) {
      const label = `${i.toString().padStart(2, '0')}:00`;
      // Simulate based on activity patterns
      const activities = analytics?.recentActivity || [];
      let count = 0;
      for (const act of activities) {
        const actHour = new Date(act.date).getHours();
        if (actHour === i) count++;
      }
      hours.push({ hour: label, count });
    }
    return hours;
  }, [analytics]);

  // Category pie
  const categoryPie = useMemo(() => {
    return (analytics?.categoryBreakdown || []).map((cat) => ({
      name: cat.category.replace(/_/g, ' '),
      value: cat.completed,
    }));
  }, [analytics]);

  // Streak history (derived from activity)
  const streakData = useMemo(() => {
    if (!analytics?.recentActivity) return [];
    const dateSet = new Set(analytics.recentActivity.map((a) => a.date.split('T')[0]));
    const days: { date: string; active: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({ date: dateStr.slice(5), active: dateSet.has(dateStr) ? 1 : 0 });
    }
    return days;
  }, [analytics]);

  // Performance trend
  const trendData = useMemo(() => {
    if (!analytics?.recentActivity) return [];
    const byDate = new Map<string, { points: number; count: number }>();
    for (const act of analytics.recentActivity) {
      const date = new Date(act.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      const existing = byDate.get(date) || { points: 0, count: 0 };
      existing.points += act.points;
      existing.count += 1;
      byDate.set(date, existing);
    }
    return Array.from(byDate.entries())
      .slice(-15)
      .map(([date, d]) => ({ date, points: d.points, avg: Math.round(d.points / d.count) }));
  }, [analytics]);

  // AI insights
  const insights = useMemo(() => {
    if (!analytics) return [];
    const msgs: string[] = [];
    if (analytics.completionRate > 70) msgs.push('Tu tasa de completado es excelente. Eres un jugador muy constante.');
    else if (analytics.completionRate > 40) msgs.push('Tu tasa de completado es buena. Intenta terminar las quests que dejas a medias.');
    else msgs.push('Muchas quests quedan sin terminar. Intenta enfocarte en una quest a la vez.');

    if (analytics.favoriteCategory) {
      msgs.push(`Tu categoria favorita es ${analytics.favoriteCategory.replace('_', ' ')}. Prueba otras categorías para mejorar tus habilidades.`);
    }
    if (analytics.totalPlayTime > 600) msgs.push(`Llevas ${Math.round(analytics.totalPlayTime / 60)} horas jugando. Eres toda una leyenda.`);
    if (analytics.averageScore > 80) msgs.push('Tu puntuacion media esta por encima de la media. Sigue así.');

    return msgs;
  }, [analytics]);

  // CSV export
  const exportCSV = () => {
    if (!analytics) return;
    const rows = [
      ['Metrica', 'Valor'],
      ['Total Quests', String(analytics.totalQuests)],
      ['Quests Completadas', String(analytics.questsCompleted)],
      ['Total Puntos', String(analytics.totalPoints)],
      ['Puntuacion Media', String(analytics.averageScore)],
      ['Tiempo Total (min)', String(analytics.totalPlayTime)],
      ['Tasa de Completado', `${analytics.completionRate}%`],
      ['Categoria Favorita', analytics.favoriteCategory || 'N/A'],
      [''],
      ['Categoria', 'Completadas', 'Total', 'Puntuacion Media'],
      ...(analytics.categoryBreakdown || []).map((c) => [
        c.category,
        String(c.completed),
        String(c.total),
        String(c.averageScore),
      ]),
      [''],
      ['Fecha', 'Quest', 'Accion', 'Puntos'],
      ...(analytics.recentActivity || []).map((a) => [a.date, a.questTitle, a.action, String(a.points)]),
    ];

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/analytics"
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-300" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">
              Analytics avanzado
            </h1>
            <p className="text-slate-400 mt-1">Analisis detallado de tu rendimiento</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Date range selector */}
          <div className="flex items-center gap-1 glass rounded-xl border border-white/10 p-1">
            {(['7d', '30d', '90d', '1y'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  dateRange === range
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" leftIcon={Download} onClick={exportCSV}>
            Exportar CSV
          </Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 animate-pulse">
              <div className="h-5 w-40 bg-navy-800 rounded mb-4" />
              <div className="h-48 bg-navy-800 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Row 1: Heatmap (full width) */}
          <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/10 p-6">
            <h3 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-400" />
              Actividad
            </h3>
            <HeatmapCalendar data={heatmapData} />
          </motion.div>

          {/* Row 2: Skill Radar + Completion Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/10 p-6">
              <h3 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-400" />
                Radar de habilidades
              </h3>
              <SkillRadar data={skillData} />
            </motion.div>

            <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/10 p-6">
              <h3 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                Funnel de completado
              </h3>
              <CompletionFunnel stages={funnelData} />
            </motion.div>
          </div>

          {/* Row 3: Time of day + Category pie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/10 p-6">
              <h3 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-400" />
                Analisis por hora del dia
              </h3>
              <div className="h-56">
                {timeOfDayData.some((d) => d.count > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeOfDayData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                      <XAxis
                        dataKey="hour"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                        interval={3}
                      />
                      <YAxis
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Actividades" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    No hay datos disponibles
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/10 p-6">
              <h3 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-violet-400" />
                Preferencia por categoria
              </h3>
              <div className="flex items-center gap-6">
                <div className="h-48 w-48 flex-shrink-0">
                  {categoryPie.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryPie}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          animationDuration={800}
                        >
                          {categoryPie.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                      No hay datos
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  {categoryPie.map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="text-sm text-slate-300 capitalize flex-1">{cat.name}</span>
                      <span className="text-xs text-slate-500">{cat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Row 4: Streak history + Performance trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/10 p-6">
              <h3 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Historial de racha
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={streakData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                      interval={4}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                      domain={[0, 1]}
                      ticks={[0, 1]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="active"
                      name="Activo"
                      fill="#f97316"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/10 p-6">
              <h3 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-400" />
                Tendencia de rendimiento
              </h3>
              <div className="h-48">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                      />
                      <YAxis
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="points"
                        name="Puntos"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6', r: 3 }}
                        activeDot={{ r: 5, fill: '#a78bfa' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="avg"
                        name="Media"
                        stroke="#10b981"
                        strokeWidth={1.5}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    No hay datos disponibles
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* AI Insights */}
          {insights.length > 0 && (
            <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/10 p-6">
              <h3 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Insights
              </h3>
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-3 h-3 text-amber-400" />
                    </div>
                    <p className="text-sm text-slate-300">{insight}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
