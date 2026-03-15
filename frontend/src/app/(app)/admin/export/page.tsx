'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileSpreadsheet,
  FileJson,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Database,
  Users,
  Map,
  BarChart3,
  X,
} from 'lucide-react';
import { AdminGuard } from '@/components/layout/AdminGuard';
import Button from '@/components/ui/Button';

// ---------- Types ----------

type ExportType = 'users_csv' | 'quests_csv' | 'analytics_csv' | 'full_json';
type ExportStatus = 'idle' | 'previewing' | 'generating' | 'ready' | 'error';

interface ExportOption {
  id: ExportType;
  title: string;
  description: string;
  icon: React.ElementType;
  format: string;
  estimatedSize: string;
}

interface ExportHistoryEntry {
  id: string;
  type: ExportType;
  status: 'completed' | 'failed';
  timestamp: string;
  size: string;
  records: number;
}

// ---------- Config ----------

const exportOptions: ExportOption[] = [
  {
    id: 'users_csv',
    title: 'Users Export',
    description: 'All user accounts with registration date, status, points, and activity stats',
    icon: Users,
    format: 'CSV',
    estimatedSize: '~2.4 MB',
  },
  {
    id: 'quests_csv',
    title: 'Quests Export',
    description: 'All quests with stages, ratings, completion counts, and metadata',
    icon: Map,
    format: 'CSV',
    estimatedSize: '~1.8 MB',
  },
  {
    id: 'analytics_csv',
    title: 'Analytics Export',
    description: 'Platform analytics: daily active users, completions, voice sessions, revenue',
    icon: BarChart3,
    format: 'CSV',
    estimatedSize: '~850 KB',
  },
  {
    id: 'full_json',
    title: 'Full Database Export',
    description: 'Complete database dump across all 6 DynamoDB tables in structured JSON',
    icon: Database,
    format: 'JSON',
    estimatedSize: '~12 MB',
  },
];

const mockHistory: ExportHistoryEntry[] = [
  { id: 'h1', type: 'users_csv', status: 'completed', timestamp: '2026-03-14T18:30:00Z', size: '2.3 MB', records: 14523 },
  { id: 'h2', type: 'analytics_csv', status: 'completed', timestamp: '2026-03-13T10:00:00Z', size: '812 KB', records: 365 },
  { id: 'h3', type: 'full_json', status: 'failed', timestamp: '2026-03-12T22:15:00Z', size: '-', records: 0 },
  { id: 'h4', type: 'quests_csv', status: 'completed', timestamp: '2026-03-10T14:45:00Z', size: '1.7 MB', records: 842 },
  { id: 'h5', type: 'users_csv', status: 'completed', timestamp: '2026-03-08T09:00:00Z', size: '2.1 MB', records: 13890 },
];

const mockPreviewData: Record<ExportType, string[][]> = {
  users_csv: [
    ['userId', 'email', 'displayName', 'status', 'totalPoints', 'questsCompleted', 'createdAt'],
    ['u-001', 'ana@example.com', 'Ana Garcia', 'active', '4520', '12', '2025-09-01'],
    ['u-002', 'carlos@example.com', 'Carlos Lopez', 'active', '3210', '8', '2025-09-15'],
    ['u-003', 'maria@example.com', 'Maria Torres', 'suspended', '1580', '4', '2025-10-02'],
  ],
  quests_csv: [
    ['questId', 'title', 'category', 'difficulty', 'stages', 'rating', 'completions', 'published'],
    ['q-001', 'Lost Temple of Sol', 'adventure', 'hard', '5', '4.8', '342', 'true'],
    ['q-002', 'Culinary Secrets', 'culinary', 'easy', '3', '4.5', '891', 'true'],
    ['q-003', 'Mystery at the Prado', 'mystery', 'legendary', '7', '4.9', '127', 'true'],
  ],
  analytics_csv: [
    ['date', 'dau', 'questCompletions', 'voiceSessions', 'avgSessionMin', 'newUsers'],
    ['2026-03-14', '1245', '342', '189', '12.4', '87'],
    ['2026-03-13', '1189', '298', '167', '11.8', '72'],
    ['2026-03-12', '1302', '378', '204', '13.1', '95'],
  ],
  full_json: [
    ['table', 'records', 'lastUpdated'],
    ['users', '14523', '2026-03-15T00:00:00Z'],
    ['quests', '842', '2026-03-15T00:00:00Z'],
    ['progress', '45210', '2026-03-15T00:00:00Z'],
    ['conversations', '28901', '2026-03-15T00:00:00Z'],
    ['scores', '31456', '2026-03-15T00:00:00Z'],
    ['achievements', '18934', '2026-03-15T00:00:00Z'],
  ],
};

// ---------- Variants ----------

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ---------- Component ----------

function ExportContent() {
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-03-15');
  const [exportStates, setExportStates] = useState<Record<ExportType, ExportStatus>>(
    { users_csv: 'idle', quests_csv: 'idle', analytics_csv: 'idle', full_json: 'idle' },
  );
  const [previewType, setPreviewType] = useState<ExportType | null>(null);

  const handlePreview = useCallback((type: ExportType) => {
    setPreviewType(type);
    setExportStates((prev) => ({ ...prev, [type]: 'previewing' }));
  }, []);

  const handleClosePreview = useCallback(() => {
    if (previewType) {
      setExportStates((prev) => ({ ...prev, [previewType]: 'idle' }));
    }
    setPreviewType(null);
  }, [previewType]);

  const handleDownload = useCallback((type: ExportType) => {
    setExportStates((prev) => ({ ...prev, [type]: 'generating' }));
    // Simulate export generation
    setTimeout(() => {
      setExportStates((prev) => ({ ...prev, [type]: 'ready' }));
      // Simulate download trigger
      setTimeout(() => {
        setExportStates((prev) => ({ ...prev, [type]: 'idle' }));
      }, 2000);
    }, 1500);
  }, []);

  const getTypeLabel = (type: ExportType) =>
    exportOptions.find((o) => o.id === type)?.title ?? type;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen pb-24"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600/30 to-blue-600/30 flex items-center justify-center">
            <Download className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-white">Data Export</h1>
            <p className="text-sm text-slate-400">
              Export platform data in CSV or JSON format
            </p>
          </div>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 mb-6">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          Date Range
        </h2>
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          const state = exportStates[option.id];
          return (
            <motion.div
              key={option.id}
              whileHover={{ y: -2 }}
              className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 hover:border-white/20 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-600/20 to-blue-600/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-white">{option.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-400 font-mono">
                      {option.format}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {option.description}
                  </p>
                  <p className="text-[10px] text-slate-500 mb-4">
                    Estimated size: {option.estimatedSize}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePreview(option.id)}
                      disabled={state === 'generating'}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all disabled:opacity-50"
                    >
                      <Eye size={12} />
                      Preview
                    </button>
                    <button
                      onClick={() => handleDownload(option.id)}
                      disabled={state === 'generating'}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-600/25 disabled:opacity-50"
                    >
                      {state === 'generating' ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          Generating...
                        </>
                      ) : state === 'ready' ? (
                        <>
                          <CheckCircle2 size={12} />
                          Ready!
                        </>
                      ) : (
                        <>
                          <Download size={12} />
                          Download
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl rounded-2xl bg-navy-900 border border-white/10 overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                Preview: {getTypeLabel(previewType)}
              </h3>
              <button onClick={handleClosePreview} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-x-auto max-h-96">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    {mockPreviewData[previewType][0].map((header, i) => (
                      <th
                        key={i}
                        className="text-left px-3 py-2 text-slate-400 font-semibold border-b border-white/5 whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockPreviewData[previewType].slice(1).map((row, ri) => (
                    <tr key={ri} className="hover:bg-white/5">
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="px-3 py-2 text-slate-300 border-b border-white/5 whitespace-nowrap"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[10px] text-slate-500 mt-3">
                Showing first {mockPreviewData[previewType].length - 1} rows of preview data
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-white/10">
              <button
                onClick={handleClosePreview}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleClosePreview();
                  handleDownload(previewType);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-600/25"
              >
                <span className="flex items-center gap-1.5">
                  <Download size={12} />
                  Download Full Export
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Scheduled Exports (Placeholder) */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Scheduled Exports
          </h2>
          <span className="text-[10px] px-2 py-1 rounded bg-amber-500/20 text-amber-400 font-medium">
            Coming Soon
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Automated recurring exports will be available in a future update. Configure daily, weekly,
          or monthly exports delivered to S3 or via email.
        </p>
      </div>

      {/* Export History */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          Export History
        </h2>
        <div className="space-y-3">
          {mockHistory.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <div className="flex items-center gap-3">
                {entry.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <div>
                  <p className="text-xs font-medium text-white">{getTypeLabel(entry.type)}</p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(entry.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-300">{entry.size}</p>
                {entry.records > 0 && (
                  <p className="text-[10px] text-slate-500">
                    {entry.records.toLocaleString()} records
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminExportPage() {
  return (
    <AdminGuard>
      <ExportContent />
    </AdminGuard>
  );
}
