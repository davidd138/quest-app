'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Layers,
  Calendar,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export interface ModerationItem {
  id: string;
  title: string;
  creator?: string;
  description: string;
  stageCount?: number;
  createdAt: string;
  status?: string;
  metadata?: Record<string, string | number>;
}

interface ModerationQueueProps {
  items: ModerationItem[];
  loading?: boolean;
  pendingCount?: number;
  onApprove: (id: string) => void | Promise<void>;
  onReject: (id: string, reason: string) => void | Promise<void>;
  approving?: string | null;
  rejecting?: string | null;
}

const itemVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function ModerationQueue({
  items,
  loading,
  pendingCount,
  onApprove,
  onReject,
  approving,
  rejecting,
}: ModerationQueueProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleReject = useCallback(async () => {
    if (!rejectTarget) return;
    await onReject(rejectTarget, rejectReason);
    setRejectTarget(null);
    setRejectReason('');
  }, [rejectTarget, rejectReason, onReject]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-12 text-center">
        <Check size={40} className="text-emerald-500 mx-auto mb-3" />
        <p className="text-slate-400">No items in the queue</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Badge */}
      {pendingCount !== undefined && pendingCount > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
            <Clock size={12} />
            {pendingCount} pending
          </span>
        </div>
      )}

      <AnimatePresence>
        {items.map((item) => {
          const isExpanded = expanded.has(item.id);

          return (
            <motion.div
              key={item.id}
              variants={itemVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              layout
            >
              <Card padding="none" variant="elevated" className="overflow-hidden">
                {/* Header row */}
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white text-sm truncate">
                        {item.title}
                      </h4>
                      {item.status && (
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            item.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : item.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {item.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {item.creator && (
                        <span className="flex items-center gap-1">
                          <User size={10} />
                          {item.creator}
                        </span>
                      )}
                      {item.stageCount !== undefined && (
                        <span className="flex items-center gap-1">
                          <Layers size={10} />
                          {item.stageCount} stages
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onApprove(item.id)}
                      disabled={approving === item.id}
                      className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                      title="Approve"
                    >
                      {approving === item.id ? (
                        <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check size={16} className="text-emerald-400" />
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setRejectTarget(item.id)}
                      disabled={rejecting === item.id}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                      title="Reject"
                    >
                      {rejecting === item.id ? (
                        <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <X size={16} className="text-rose-400" />
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleExpanded(item.id)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                      title="Preview"
                    >
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Expandable preview */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 border-t border-white/5">
                        <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                          {item.description}
                        </p>
                        {item.metadata && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {Object.entries(item.metadata).map(([key, value]) => (
                              <span
                                key={key}
                                className="inline-flex px-2 py-0.5 rounded-md bg-white/5 text-xs text-slate-400"
                              >
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Rejection reason modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setRejectTarget(null);
              setRejectReason('');
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative glass rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/10"
          >
            <h3 className="font-heading font-bold text-white text-lg mb-4">
              Rejection Reason
            </h3>

            {/* Preset reasons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                'Does not meet quality standards',
                'Inappropriate content',
                'Incomplete or missing information',
                'Duplicate quest',
                'Violates community guidelines',
              ].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setRejectReason(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors border ${
                    rejectReason === preset
                      ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
            />

            <div className="flex items-center gap-3 justify-end mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={rejecting === rejectTarget}
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                Reject
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
