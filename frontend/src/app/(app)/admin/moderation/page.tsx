'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  CheckSquare,
  Square,
} from 'lucide-react';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { useQuery, useMutation } from '@/hooks/useGraphQL';
import { LIST_PENDING_QUESTS } from '@/lib/graphql/queries';
import { APPROVE_QUEST } from '@/lib/graphql/mutations';
import ModerationQueue from '@/components/admin/ModerationQueue';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { Quest, QuestConnection } from '@/types';

type ModerationFilter = 'pending' | 'approved' | 'rejected' | 'all';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function ModerationContent() {
  const { data: questConnection, loading, execute: fetchQuests } = useQuery<QuestConnection>(LIST_PENDING_QUESTS);
  const { execute: approveQuest } = useMutation(APPROVE_QUEST);

  const [filter, setFilter] = useState<ModerationFilter>('pending');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    fetchQuests({ limit: 100 });
  }, [fetchQuests]);

  const quests = questConnection?.items ?? [];

  const filteredQuests = useMemo(() => {
    if (filter === 'all') return quests;
    return quests.filter((q) => {
      const quest = q as Quest & { rejectedAt?: string; approvedAt?: string };
      if (filter === 'pending') return !q.isPublished && !quest.rejectedAt;
      if (filter === 'approved') return q.isPublished;
      if (filter === 'rejected') return !!quest.rejectedAt;
      return true;
    });
  }, [quests, filter]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let pending = 0;
    let approvedToday = 0;
    let rejectedToday = 0;

    for (const q of quests) {
      const quest = q as Quest & { rejectedAt?: string; approvedAt?: string };
      if (!q.isPublished && !quest.rejectedAt) pending++;
      if (quest.approvedAt?.startsWith(today)) approvedToday++;
      if (quest.rejectedAt?.startsWith(today)) rejectedToday++;
    }

    return { pending, approvedToday, rejectedToday };
  }, [quests]);

  const handleApprove = useCallback(async (questId: string) => {
    setApprovingId(questId);
    try {
      await approveQuest({ questId, approved: true });
      fetchQuests({ limit: 100 });
    } catch {
      // Error handled by hook
    } finally {
      setApprovingId(null);
    }
  }, [approveQuest, fetchQuests]);

  const handleReject = useCallback(async (questId: string, reason: string) => {
    setRejectingId(questId);
    try {
      await approveQuest({ questId, approved: false, rejectionReason: reason });
      fetchQuests({ limit: 100 });
    } catch {
      // Error handled by hook
    } finally {
      setRejectingId(null);
    }
  }, [approveQuest, fetchQuests]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredQuests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuests.map((q) => q.id)));
    }
  }, [selectedIds, filteredQuests]);

  const handleBulkApprove = useCallback(async () => {
    setBulkProcessing(true);
    try {
      for (const id of selectedIds) {
        await approveQuest({ questId: id, approved: true });
      }
      setSelectedIds(new Set());
      fetchQuests({ limit: 100 });
    } catch {
      // Error handled by hook
    } finally {
      setBulkProcessing(false);
    }
  }, [selectedIds, approveQuest, fetchQuests]);

  const handleBulkReject = useCallback(async () => {
    setBulkProcessing(true);
    try {
      for (const id of selectedIds) {
        await approveQuest({
          questId: id,
          approved: false,
          rejectionReason: 'Bulk rejection by admin',
        });
      }
      setSelectedIds(new Set());
      fetchQuests({ limit: 100 });
    } catch {
      // Error handled by hook
    } finally {
      setBulkProcessing(false);
    }
  }, [selectedIds, approveQuest, fetchQuests]);

  const moderationItems = filteredQuests.map((q) => ({
    id: q.id,
    title: q.title,
    creator: q.createdBy ?? 'Unknown',
    description: q.description,
    stageCount: q.stages?.length ?? 0,
    createdAt: q.createdAt,
    status: q.isPublished ? 'approved' : (q as Quest & { rejectedAt?: string }).rejectedAt ? 'rejected' : 'pending',
    metadata: {
      category: q.category.replace('_', ' '),
      difficulty: q.difficulty,
      points: q.totalPoints,
    },
  }));

  const filterOptions: { key: ModerationFilter; label: string; icon: React.ElementType }[] = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'approved', label: 'Approved', icon: CheckCircle2 },
    { key: 'rejected', label: 'Rejected', icon: XCircle },
    { key: 'all', label: 'All', icon: Filter },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/30 to-violet-800/30 flex items-center justify-center">
            <Shield size={24} className="text-violet-400" />
          </div>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">
              Content Moderation
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Review and approve community quests
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card padding="md" variant="elevated">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-xs text-slate-400">Pending Review</p>
            </div>
          </div>
        </Card>
        <Card padding="md" variant="elevated">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.approvedToday}</p>
              <p className="text-xs text-slate-400">Approved Today</p>
            </div>
          </div>
        </Card>
        <Card padding="md" variant="elevated">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <XCircle size={18} className="text-rose-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.rejectedToday}</p>
              <p className="text-xs text-slate-400">Rejected Today</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card padding="md" className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {filterOptions.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === key
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          {/* Bulk actions */}
          {filteredQuests.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-white/5 transition-colors"
              >
                {selectedIds.size === filteredQuests.length ? (
                  <CheckSquare size={14} className="text-violet-400" />
                ) : (
                  <Square size={14} />
                )}
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
              </button>
              {selectedIds.size > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={CheckCircle2}
                    loading={bulkProcessing}
                    onClick={handleBulkApprove}
                  >
                    Approve All
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={XCircle}
                    loading={bulkProcessing}
                    onClick={handleBulkReject}
                  >
                    Reject All
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Queue table */}
      <Card padding="none" variant="elevated">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredQuests.length === 0 ? (
          <div className="p-12 text-center">
            <Shield size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No quests matching this filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="w-10 px-4 py-3">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                      {selectedIds.size === filteredQuests.length ? (
                        <CheckSquare size={16} className="text-violet-400" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">
                    Quest
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">
                    Creator
                  </th>
                  <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">
                    Stages
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">
                    Created
                  </th>
                  <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredQuests.map((quest) => {
                  const q = quest as Quest & { rejectedAt?: string };
                  const status = quest.isPublished ? 'approved' : q.rejectedAt ? 'rejected' : 'pending';
                  const isSelected = selectedIds.has(quest.id);

                  return (
                    <motion.tr
                      key={quest.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-4 py-4">
                        <button onClick={() => toggleSelect(quest.id)} className="text-slate-400 hover:text-white">
                          {isSelected ? (
                            <CheckSquare size={16} className="text-violet-400" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="min-w-0">
                          <p className="font-medium text-white text-sm truncate max-w-[250px]">
                            {quest.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate max-w-[250px]">
                            {quest.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-300 truncate">
                          {quest.createdBy ?? 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-300">{quest.stages?.length ?? 0}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-400">
                          {new Date(quest.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : status === 'rejected'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {status === 'pending' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleApprove(quest.id)}
                                disabled={approvingId === quest.id}
                                className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                {approvingId === quest.id ? (
                                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <CheckCircle2 size={16} className="text-emerald-400" />
                                )}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleReject(quest.id, '')}
                                disabled={rejectingId === quest.id}
                                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                {rejectingId === quest.id ? (
                                  <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <XCircle size={16} className="text-rose-400" />
                                )}
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default function AdminModerationPage() {
  return (
    <AdminGuard>
      <ModerationContent />
    </AdminGuard>
  );
}
