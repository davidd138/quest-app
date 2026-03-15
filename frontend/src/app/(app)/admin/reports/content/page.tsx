'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flag,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  AlertCircle,
  Info,
  Trash2,
  ShieldAlert,
  ShieldOff,
  XCircle,
} from 'lucide-react';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { useQuery } from '@/hooks/useGraphQL';
import { LIST_CONTENT_REPORTS } from '@/lib/graphql/queries';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { ContentReport } from '@/types';

type ReportStatusFilter = 'all' | 'pending' | 'resolved' | 'dismissed';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const contentTypeLabels: Record<string, string> = {
  quest: 'Quest',
  review: 'Review',
  chat_message: 'Chat Message',
  user_profile: 'User Profile',
};

const reasonLabels: Record<string, string> = {
  inappropriate: 'Inappropriate',
  offensive: 'Offensive',
  spam: 'Spam',
  plagiarism: 'Plagiarism',
  other: 'Other',
};

function getPriority(reportCount: number): { label: string; color: string; icon: React.ElementType } {
  if (reportCount >= 5) return { label: 'High', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: AlertTriangle };
  if (reportCount >= 2) return { label: 'Medium', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: AlertCircle };
  return { label: 'Low', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: Info };
}

function ReportsContent() {
  const { data: reports, loading, execute: fetchReports } = useQuery<ContentReport[]>(LIST_CONTENT_REPORTS);

  const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState<ContentReport | null>(null);

  useEffect(() => {
    const vars: Record<string, string | number> = { limit: 100 };
    if (statusFilter !== 'all') vars.status = statusFilter;
    fetchReports(vars);
  }, [fetchReports, statusFilter]);

  const allReports = reports ?? [];

  // Group reports by contentId to determine priority
  const reportCountByContent = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of allReports) {
      const key = `${r.contentType}:${r.contentId}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [allReports]);

  const sortedReports = useMemo(() => {
    return [...allReports].sort((a, b) => {
      // Sort by priority (report count) descending, then date
      const countA = reportCountByContent[`${a.contentType}:${a.contentId}`] ?? 0;
      const countB = reportCountByContent[`${b.contentType}:${b.contentId}`] ?? 0;
      if (countB !== countA) return countB - countA;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [allReports, reportCountByContent]);

  const formatDate = useCallback((iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  }, []);

  const filterOptions: { key: ReportStatusFilter; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'dismissed', label: 'Dismissed' },
    { key: 'all', label: 'All' },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600/30 to-rose-800/30 flex items-center justify-center">
            <Flag size={24} className="text-rose-400" />
          </div>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">
              Reported Content
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Review user reports and take action
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
            <Flag size={12} />
            {allReports.filter((r) => r.status === 'pending').length} pending
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card padding="md" className="mb-6">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          {filterOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                statusFilter === key
                  ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      {/* Reports table */}
      <Card padding="none" variant="elevated">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sortedReports.length === 0 ? (
          <div className="p-12 text-center">
            <Flag size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No reports found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Priority
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Reporter
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Content Type
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Reason
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Date
                  </th>
                  <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {sortedReports.map((report) => {
                    const reportCount = reportCountByContent[`${report.contentType}:${report.contentId}`] ?? 1;
                    const priority = getPriority(reportCount);
                    const PriorityIcon = priority.icon;
                    const isExpanded = expandedId === report.id;

                    return (
                      <React.Fragment key={report.id}>
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : report.id)}
                        >
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${priority.color}`}>
                              <PriorityIcon size={10} />
                              {priority.label}
                              {reportCount > 1 && (
                                <span className="ml-0.5 opacity-70">({reportCount})</span>
                              )}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-300 font-mono truncate">
                              {report.reporterId.slice(0, 8)}...
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex px-2 py-0.5 rounded-md bg-white/5 text-xs text-slate-300 border border-white/10">
                              {contentTypeLabels[report.contentType] ?? report.contentType}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-300">
                              {reasonLabels[report.reason] ?? report.reason}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-400">
                              {formatDate(report.createdAt)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                report.status === 'pending'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : report.status === 'resolved'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                              }`}
                            >
                              {report.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setActionTarget(report)}
                                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                title="Take action"
                              >
                                <ShieldAlert size={16} className="text-violet-400" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                title="Expand"
                              >
                                {isExpanded ? (
                                  <ChevronUp size={16} className="text-slate-400" />
                                ) : (
                                  <ChevronDown size={16} className="text-slate-400" />
                                )}
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>

                        {/* Expandable evidence row */}
                        {isExpanded && (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <td colSpan={7} className="px-5 pb-4">
                              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                  Evidence / Details
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                  {report.details || 'No additional details provided.'}
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                  <span>Content ID: <code className="font-mono text-slate-400">{report.contentId}</code></span>
                                  <span>|</span>
                                  <span>Report ID: <code className="font-mono text-slate-400">{report.id}</code></span>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Action modal */}
      {actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setActionTarget(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative glass rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/10"
          >
            <h3 className="font-heading font-bold text-white text-lg mb-2">
              Take Action
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Report on {contentTypeLabels[actionTarget.contentType] ?? actionTarget.contentType} by reporter {actionTarget.reporterId.slice(0, 8)}...
            </p>

            <div className="space-y-2">
              <button
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
                onClick={() => setActionTarget(null)}
              >
                <XCircle size={18} className="text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-white">Dismiss Report</p>
                  <p className="text-xs text-slate-500">Mark as reviewed, no action needed</p>
                </div>
              </button>

              <button
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 transition-colors text-left"
                onClick={() => setActionTarget(null)}
              >
                <AlertTriangle size={18} className="text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-white">Warn User</p>
                  <p className="text-xs text-slate-500">Send a warning to the content creator</p>
                </div>
              </button>

              <button
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 transition-colors text-left"
                onClick={() => setActionTarget(null)}
              >
                <ShieldOff size={18} className="text-rose-400" />
                <div>
                  <p className="text-sm font-medium text-white">Suspend User</p>
                  <p className="text-xs text-slate-500">Temporarily suspend the content creator</p>
                </div>
              </button>

              <button
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 transition-colors text-left"
                onClick={() => setActionTarget(null)}
              >
                <Trash2 size={18} className="text-rose-400" />
                <div>
                  <p className="text-sm font-medium text-white">Remove Content</p>
                  <p className="text-xs text-slate-500">Delete the reported content permanently</p>
                </div>
              </button>
            </div>

            <div className="flex justify-end mt-6">
              <Button variant="ghost" size="sm" onClick={() => setActionTarget(null)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default function AdminReportsContentPage() {
  return (
    <AdminGuard>
      <ReportsContent />
    </AdminGuard>
  );
}
