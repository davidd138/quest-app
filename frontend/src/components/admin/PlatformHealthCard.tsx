'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Wifi,
  Zap,
  Database,
  AlertCircle,
  RefreshCw,
  Clock,
  Server,
} from 'lucide-react';
import Card from '@/components/ui/Card';

// ---------- Types ----------

type HealthStatus = 'healthy' | 'degraded' | 'critical';

interface HealthMetric {
  id: string;
  label: string;
  value: string;
  unit: string;
  status: HealthStatus;
  icon: React.ElementType;
  description: string;
}

// ---------- Mock Data Generator ----------

function generateMockMetrics(): HealthMetric[] {
  // Simulate slight variation on each refresh
  const responseTime = 120 + Math.floor(Math.random() * 60);
  const errorRate = parseFloat((0.2 + Math.random() * 0.5).toFixed(2));
  const wsConnections = 140 + Math.floor(Math.random() * 40);
  const coldStarts = Math.floor(Math.random() * 15);
  const dynCapacity = 45 + Math.floor(Math.random() * 30);

  return [
    {
      id: 'api_response',
      label: 'API Response Time',
      value: String(responseTime),
      unit: 'ms',
      status: responseTime < 150 ? 'healthy' : responseTime < 300 ? 'degraded' : 'critical',
      icon: Clock,
      description: 'Average response time across all AppSync resolvers (p50)',
    },
    {
      id: 'error_rate',
      label: 'Error Rate',
      value: String(errorRate),
      unit: '%',
      status: errorRate < 0.5 ? 'healthy' : errorRate < 2 ? 'degraded' : 'critical',
      icon: AlertCircle,
      description: 'Percentage of requests returning 4xx/5xx in the last hour',
    },
    {
      id: 'ws_connections',
      label: 'WebSocket Connections',
      value: String(wsConnections),
      unit: 'active',
      status: wsConnections < 500 ? 'healthy' : wsConnections < 900 ? 'degraded' : 'critical',
      icon: Wifi,
      description: 'Active OpenAI Realtime API WebSocket connections',
    },
    {
      id: 'cold_starts',
      label: 'Lambda Cold Starts',
      value: String(coldStarts),
      unit: 'today',
      status: coldStarts < 10 ? 'healthy' : coldStarts < 30 ? 'degraded' : 'critical',
      icon: Zap,
      description: 'Number of Lambda cold start invocations since midnight UTC',
    },
    {
      id: 'ddb_capacity',
      label: 'DynamoDB Capacity',
      value: String(dynCapacity),
      unit: '%',
      status: dynCapacity < 60 ? 'healthy' : dynCapacity < 85 ? 'degraded' : 'critical',
      icon: Database,
      description: 'Consumed read/write capacity units vs. provisioned (peak)',
    },
  ];
}

// ---------- Sub-components ----------

const STATUS_STYLES: Record<HealthStatus, { dot: string; bg: string; text: string; label: string }> = {
  healthy: { dot: 'bg-emerald-400', bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Healthy' },
  degraded: { dot: 'bg-amber-400', bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Degraded' },
  critical: { dot: 'bg-rose-400', bg: 'bg-rose-500/10', text: 'text-rose-400', label: 'Critical' },
};

function MetricRow({ metric }: { metric: HealthMetric }) {
  const Icon = metric.icon;
  const style = STATUS_STYLES[metric.status];

  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-white/5 last:border-b-0">
      {/* Status dot */}
      <div className="relative flex-shrink-0">
        <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
        {metric.status !== 'healthy' && (
          <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${style.dot} animate-ping opacity-50`} />
        )}
      </div>

      {/* Icon */}
      <div className={`p-2 rounded-lg ${style.bg} flex-shrink-0`}>
        <Icon size={16} className={style.text} />
      </div>

      {/* Label and description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{metric.label}</p>
        <p className="text-xs text-slate-500 truncate">{metric.description}</p>
      </div>

      {/* Value */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-white">
          {metric.value}
          <span className="text-xs text-slate-500 font-normal ml-1">{metric.unit}</span>
        </p>
        <p className={`text-xs font-medium ${style.text}`}>{style.label}</p>
      </div>
    </div>
  );
}

// ---------- Component ----------

export default function PlatformHealthCard() {
  const [metrics, setMetrics] = useState<HealthMetric[]>(generateMockMetrics);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate network delay
    setTimeout(() => {
      setMetrics(generateMockMetrics());
      setLastRefresh(new Date());
      setIsRefreshing(false);
    }, 400);
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const overallStatus: HealthStatus = metrics.some((m) => m.status === 'critical')
    ? 'critical'
    : metrics.some((m) => m.status === 'degraded')
      ? 'degraded'
      : 'healthy';

  const overallStyle = STATUS_STYLES[overallStatus];

  return (
    <Card variant="elevated" padding="none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <Activity size={16} className="text-violet-400" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-white">Platform Health</h3>
            <p className="text-xs text-slate-500">
              Last updated: {lastRefresh.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Overall status badge */}
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${overallStyle.bg} ${overallStyle.text}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${overallStyle.dot}`} />
            {overallStyle.label}
          </span>

          {/* Refresh button */}
          <button
            onClick={refresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={isRefreshing ? { duration: 0.6, repeat: Infinity, ease: 'linear' } : {}}
            >
              <RefreshCw size={14} className="text-slate-400" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-5 py-2">
        {metrics.map((metric) => (
          <MetricRow key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Server size={12} />
          <span>Region: eu-west-1 | Auto-refresh: 30s | Data source: Mock (CloudWatch integration pending)</span>
        </div>
      </div>
    </Card>
  );
}
