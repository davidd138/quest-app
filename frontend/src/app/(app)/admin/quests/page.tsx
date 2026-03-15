'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  MapPin,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { useQuery, useMutation } from '@/hooks/useGraphQL';
import { LIST_QUESTS } from '@/lib/graphql/queries';
import { DELETE_QUEST, UPDATE_QUEST } from '@/lib/graphql/mutations';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { Quest, QuestConnection, QuestCategory, QuestDifficulty } from '@/types';
import { DIFFICULTY_COLORS } from '@/lib/constants';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.05 } },
};

const rowVariants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 8, transition: { duration: 0.2 } },
};

const difficultyColorMap: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative glass rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <AlertTriangle size={20} className="text-rose-400" />
          </div>
          <h3 className="font-heading font-bold text-white text-lg">{title}</h3>
        </div>
        <p className="text-slate-400 text-sm mb-6">{message}</p>
        <div className="flex items-center gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" loading={loading} onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function AdminQuestsContent() {
  const router = useRouter();
  const { data: questConnection, loading, execute: fetchQuests } = useQuery<QuestConnection>(LIST_QUESTS);
  const { execute: deleteQuest, loading: deleting } = useMutation(DELETE_QUEST);
  const { execute: updateQuest } = useMutation(UPDATE_QUEST);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<QuestCategory | ''>('');
  const [difficultyFilter, setDifficultyFilter] = useState<QuestDifficulty | ''>('');
  const [deleteTarget, setDeleteTarget] = useState<Quest | null>(null);

  useEffect(() => {
    fetchQuests({ limit: 100 });
  }, [fetchQuests]);

  const quests = questConnection?.items ?? [];

  const filteredQuests = useMemo(() => {
    return quests.filter((q) => {
      const matchesSearch =
        !searchQuery ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || q.category === categoryFilter;
      const matchesDifficulty = !difficultyFilter || q.difficulty === difficultyFilter;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [quests, searchQuery, categoryFilter, difficultyFilter]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteQuest({ id: deleteTarget.id });
      setDeleteTarget(null);
      fetchQuests({ limit: 100 });
    } catch {
      // Error handled by hook
    }
  }, [deleteTarget, deleteQuest, fetchQuests]);

  const handleTogglePublish = useCallback(
    async (quest: Quest) => {
      try {
        await updateQuest({
          input: { id: quest.id, isPublished: !quest.isPublished },
        });
        fetchQuests({ limit: 100 });
      } catch {
        // Error handled by hook
      }
    },
    [updateQuest, fetchQuests],
  );

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">
            Quest Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create, edit, and manage quests
          </p>
        </div>
        <Button leftIcon={Plus} onClick={() => router.push('/admin/quests/new')}>
          Create New Quest
        </Button>
      </div>

      {/* Filters */}
      <Card padding="md" className="mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search quests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as QuestCategory | '')}
                className="pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-violet-500/50 transition-colors"
              >
                <option value="">All Categories</option>
                <option value="adventure">Adventure</option>
                <option value="mystery">Mystery</option>
                <option value="cultural">Cultural</option>
                <option value="educational">Educational</option>
                <option value="culinary">Culinary</option>
                <option value="nature">Nature</option>
                <option value="urban">Urban</option>
                <option value="team_building">Team Building</option>
              </select>
            </div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as QuestDifficulty | '')}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-violet-500/50 transition-colors"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none" variant="elevated">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredQuests.length === 0 ? (
          <div className="p-12 text-center">
            <Layers size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No quests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Title
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Category
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Difficulty
                  </th>
                  <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Stages
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
                  {filteredQuests.map((quest) => {
                    const diffColor = DIFFICULTY_COLORS[quest.difficulty];
                    const colorClasses = difficultyColorMap[diffColor] ?? difficultyColorMap.violet;

                    return (
                      <motion.tr
                        key={quest.id}
                        variants={rowVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-violet-800/30 flex items-center justify-center flex-shrink-0">
                              <MapPin size={16} className="text-violet-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-white text-sm truncate max-w-[200px]">
                                {quest.title}
                              </p>
                              <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                {quest.location.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-300 capitalize">
                            {quest.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${colorClasses}`}
                          >
                            {quest.difficulty}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm text-slate-300">{quest.stages.length}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              quest.isPublished
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {quest.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleTogglePublish(quest)}
                              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                              title={quest.isPublished ? 'Unpublish' : 'Publish'}
                            >
                              {quest.isPublished ? (
                                <EyeOff size={16} className="text-slate-400" />
                              ) : (
                                <Eye size={16} className="text-emerald-400" />
                              )}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => router.push(`/admin/quests/${quest.id}/edit`)}
                              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                              title="Edit"
                            >
                              <Edit3 size={16} className="text-violet-400" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setDeleteTarget(quest)}
                              className="p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} className="text-rose-400" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Quest"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone and all associated data will be permanently removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </motion.div>
  );
}

export default function AdminQuestsPage() {
  return (
    <AdminGuard>
      <AdminQuestsContent />
    </AdminGuard>
  );
}
