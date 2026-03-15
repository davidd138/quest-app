'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Square,
  MinusSquare,
  Upload,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Undo2,
  Loader2,
  AlertTriangle,
  X,
} from 'lucide-react';
import Button from '@/components/ui/Button';

// ---------- Types ----------

export type BulkActionType = 'publish' | 'unpublish' | 'delete' | 'export';

interface BulkActionConfig {
  type: BulkActionType;
  label: string;
  icon: React.ElementType;
  variant: 'primary' | 'secondary' | 'danger';
  destructive?: boolean;
  confirmMessage?: string;
}

export interface BulkActionsProps {
  totalCount: number;
  selectedIds: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onAction: (action: BulkActionType, ids: string[]) => Promise<void>;
  onUndo?: (action: BulkActionType, ids: string[]) => Promise<void>;
  className?: string;
}

// ---------- Constants ----------

const UNDO_WINDOW_MS = 5000;

const ACTION_CONFIGS: BulkActionConfig[] = [
  {
    type: 'publish',
    label: 'Publish',
    icon: Eye,
    variant: 'primary',
  },
  {
    type: 'unpublish',
    label: 'Unpublish',
    icon: EyeOff,
    variant: 'secondary',
  },
  {
    type: 'export',
    label: 'Export',
    icon: Download,
    variant: 'secondary',
  },
  {
    type: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'danger',
    destructive: true,
    confirmMessage: 'Are you sure you want to delete the selected items? This action cannot be undone.',
  },
];

// ---------- Confirmation Dialog ----------

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-navy-900 border border-white/10 rounded-2xl p-6 max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-xl bg-rose-500/10">
            <AlertTriangle size={20} className="text-rose-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">Confirm Action</h3>
            <p className="text-sm text-slate-400">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------- Main Component ----------

const BulkActions: React.FC<BulkActionsProps> = ({
  totalCount,
  selectedIds,
  onSelectAll,
  onDeselectAll,
  onAction,
  onUndo,
  className = '',
}) => {
  const [activeAction, setActiveAction] = useState<BulkActionType | null>(null);
  const [progress, setProgress] = useState(0);
  const [confirmAction, setConfirmAction] = useState<BulkActionConfig | null>(null);
  const [undoState, setUndoState] = useState<{
    action: BulkActionType;
    ids: string[];
    expiresAt: number;
  } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedCount = selectedIds.length;
  const allSelected = selectedCount > 0 && selectedCount === totalCount;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  // Undo countdown
  useEffect(() => {
    if (!undoState) return;

    const remaining = undoState.expiresAt - Date.now();
    if (remaining <= 0) {
      setUndoState(null);
      return;
    }

    undoTimerRef.current = setTimeout(() => {
      setUndoState(null);
    }, remaining);

    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, [undoState]);

  const handleSelectToggle = () => {
    if (allSelected || someSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  const handleAction = useCallback(
    async (config: BulkActionConfig) => {
      if (config.destructive) {
        setConfirmAction(config);
        return;
      }
      await executeAction(config.type);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedIds],
  );

  const executeAction = async (actionType: BulkActionType) => {
    setActiveAction(actionType);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 15, 90));
    }, 200);

    try {
      await onAction(actionType, selectedIds);
      setProgress(100);

      // Set up undo window (except for export)
      if (actionType !== 'export' && onUndo) {
        setUndoState({
          action: actionType,
          ids: [...selectedIds],
          expiresAt: Date.now() + UNDO_WINDOW_MS,
        });
      }
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setActiveAction(null);
        setProgress(0);
      }, 500);
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setConfirmAction(null);
    await executeAction(confirmAction.type);
  };

  const handleUndo = async () => {
    if (!undoState || !onUndo) return;
    const { action, ids } = undoState;
    setUndoState(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    await onUndo(action, ids);
  };

  if (totalCount === 0) return null;

  return (
    <>
      <div
        className={`flex items-center gap-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2.5 ${className}`}
      >
        {/* Select checkbox */}
        <button
          onClick={handleSelectToggle}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label={allSelected ? 'Deselect all' : 'Select all'}
        >
          {allSelected ? (
            <CheckSquare size={18} className="text-violet-400" />
          ) : someSelected ? (
            <MinusSquare size={18} className="text-violet-400" />
          ) : (
            <Square size={18} />
          )}
        </button>

        {/* Selected count */}
        <span className="text-sm text-slate-300 min-w-[100px]">
          {selectedCount > 0 ? (
            <>
              <span className="font-medium text-white">{selectedCount}</span> of{' '}
              {totalCount} selected
            </>
          ) : (
            <span className="text-slate-500">None selected</span>
          )}
        </span>

        {/* Divider */}
        {selectedCount > 0 && (
          <div className="w-px h-5 bg-white/10 mx-1" />
        )}

        {/* Action buttons */}
        <AnimatePresence>
          {selectedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              {ACTION_CONFIGS.map((config) => {
                const Icon = config.icon;
                const isActive = activeAction === config.type;
                return (
                  <Button
                    key={config.type}
                    variant={config.variant === 'danger' ? 'danger' : 'secondary'}
                    size="sm"
                    disabled={!!activeAction}
                    onClick={() => handleAction(config)}
                  >
                    {isActive ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Icon size={14} />
                    )}
                    {config.label}
                  </Button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        {activeAction && (
          <div className="flex-1 ml-2">
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-violet-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Deselect */}
        {selectedCount > 0 && !activeAction && (
          <button
            onClick={onDeselectAll}
            className="ml-auto text-slate-500 hover:text-white transition-colors"
            aria-label="Deselect all"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Undo toast */}
      <AnimatePresence>
        {undoState && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-navy-800 border border-white/10 rounded-xl px-4 py-3 shadow-2xl"
          >
            <span className="text-sm text-slate-300">
              {undoState.action === 'delete' ? 'Deleted' : undoState.action === 'publish' ? 'Published' : 'Unpublished'}{' '}
              {undoState.ids.length} item{undoState.ids.length !== 1 ? 's' : ''}
            </span>
            <Button variant="ghost" size="sm" onClick={handleUndo}>
              <Undo2 size={14} />
              Undo
            </Button>
            {/* Countdown bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-violet-500 rounded-b-xl"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: UNDO_WINDOW_MS / 1000, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation dialog */}
      <AnimatePresence>
        {confirmAction && (
          <ConfirmDialog
            message={
              confirmAction.confirmMessage ??
              `Are you sure you want to ${confirmAction.label.toLowerCase()} ${selectedCount} item${selectedCount !== 1 ? 's' : ''}?`
            }
            onConfirm={handleConfirm}
            onCancel={() => setConfirmAction(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default BulkActions;
