'use client';

import { useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Settings,
  Maximize2,
  Minimize2,
} from 'lucide-react';

// ---------- Types ----------

export type WidgetSize = 'small' | 'medium' | 'large';

interface DashboardWidgetProps {
  title: string;
  children: ReactNode;
  size?: WidgetSize;
  actions?: ReactNode;
  onRefresh?: () => void;
  onSettingsClick?: () => void;
  draggable?: boolean;
  className?: string;
  defaultCollapsed?: boolean;
}

// ---------- Size classes ----------

const sizeClasses: Record<WidgetSize, string> = {
  small: 'col-span-1',
  medium: 'col-span-1 md:col-span-2',
  large: 'col-span-1 md:col-span-2 lg:col-span-3',
};

// ---------- Component ----------

export default function DashboardWidget({
  title,
  children,
  size = 'small',
  actions,
  onRefresh,
  onSettingsClick,
  draggable = true,
  className = '',
  defaultCollapsed = false,
}: DashboardWidgetProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [currentSize, setCurrentSize] = useState<WidgetSize>(size);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  }, [onRefresh, refreshing]);

  const toggleSize = useCallback(() => {
    const sizeOrder: WidgetSize[] = ['small', 'medium', 'large'];
    const idx = sizeOrder.indexOf(currentSize);
    setCurrentSize(sizeOrder[(idx + 1) % sizeOrder.length]);
  }, [currentSize]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`${sizeClasses[currentSize]} ${className}`}
    >
      <div className="glass rounded-2xl border border-white/10 overflow-hidden group">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
          {/* Drag handle */}
          {draggable && (
            <div className="cursor-grab opacity-0 group-hover:opacity-40 hover:!opacity-70 transition-opacity">
              <GripVertical className="w-4 h-4 text-slate-400" />
            </div>
          )}

          {/* Title */}
          <h3 className="font-heading font-semibold text-white text-sm flex-1">{title}</h3>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {actions}

            {onRefresh && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
                aria-label="Refresh widget"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                />
              </button>
            )}

            {onSettingsClick && (
              <button
                onClick={onSettingsClick}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
                aria-label="Widget settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={toggleSize}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              aria-label="Resize widget"
            >
              {currentSize === 'small' ? (
                <Maximize2 className="w-3.5 h-3.5" />
              ) : (
                <Minimize2 className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              aria-label={collapsed ? 'Expand widget' : 'Collapse widget'}
            >
              {collapsed ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="p-5">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
