'use client';

import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Tab {
  /** Unique key for the tab (used as value). */
  key: string;
  /** Display label. */
  label: string;
  /** Tab panel content. */
  content: React.ReactNode;
  /** Optional icon to render before the label. */
  icon?: React.ReactNode;
}

interface TabsProps {
  /** Array of tab definitions. */
  tabs: Tab[];
  /** Key of the initially active tab (defaults to first). */
  defaultTab?: string;
  /** Controlled active tab key. */
  activeTab?: string;
  /** Callback when the active tab changes. */
  onChange?: (key: string) => void;
  /** Extra wrapper classes. */
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  activeTab: controlledTab,
  onChange,
  className = '',
}) => {
  const [internalTab, setInternalTab] = useState(
    defaultTab ?? tabs[0]?.key ?? '',
  );
  const layoutId = useId();

  const activeKey = controlledTab ?? internalTab;

  const handleSelect = (key: string) => {
    if (!controlledTab) setInternalTab(key);
    onChange?.(key);
  };

  const activeContent = tabs.find((t) => t.key === activeKey)?.content;

  return (
    <div className={className}>
      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10"
        role="tablist"
        aria-orientation="horizontal"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              role="tab"
              id={`tab-${layoutId}-${tab.key}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${layoutId}-${tab.key}`}
              onClick={() => handleSelect(tab.key)}
              className={[
                'relative flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer select-none',
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200',
              ].join(' ')}
            >
              {/* Animated underline / background */}
              {isActive && (
                <motion.span
                  layoutId={`tab-indicator-${layoutId}`}
                  className="absolute inset-0 rounded-lg bg-white/10 border border-white/10"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeKey}
            role="tabpanel"
            id={`tabpanel-${layoutId}-${activeKey}`}
            aria-labelledby={`tab-${layoutId}-${activeKey}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {activeContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tabs;
