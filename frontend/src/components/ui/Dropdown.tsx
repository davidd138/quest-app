'use client';

import React, { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export interface DropdownDivider {
  type: 'divider';
}

export type DropdownEntry = DropdownItem | DropdownDivider;

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownEntry[];
  align?: 'left' | 'right';
}

function isDivider(entry: DropdownEntry): entry is DropdownDivider {
  return 'type' in entry && entry.type === 'divider';
}

const menuVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -4 },
};

const Dropdown: React.FC<DropdownProps> = ({ trigger, items, align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Auto-detect position
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setPosition(spaceBelow < 220 ? 'top' : 'bottom');
  }, [isOpen]);

  // Keyboard navigation
  const actionableItems = items
    .map((item, i) => ({ item, index: i }))
    .filter(({ item }) => !isDivider(item) && !(item as DropdownItem).disabled);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setIsOpen(true);
          setFocusIndex(0);
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setFocusIndex(-1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusIndex((prev) => {
            const currentIdx = actionableItems.findIndex(({ index }) => index === prev);
            const next = (currentIdx + 1) % actionableItems.length;
            return actionableItems[next].index;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusIndex((prev) => {
            const currentIdx = actionableItems.findIndex(({ index }) => index === prev);
            const next = (currentIdx - 1 + actionableItems.length) % actionableItems.length;
            return actionableItems[next].index;
          });
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusIndex >= 0) {
            const entry = items[focusIndex];
            if (!isDivider(entry) && !entry.disabled) {
              entry.onClick();
              setIsOpen(false);
            }
          }
          break;
      }
    },
    [isOpen, focusIndex, items, actionableItems],
  );

  return (
    <div ref={containerRef} className="relative inline-block" onKeyDown={handleKeyDown}>
      {/* Trigger */}
      <div
        onClick={() => {
          setIsOpen((prev) => !prev);
          setFocusIndex(-1);
        }}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="menu"
            className={[
              'absolute z-50 min-w-[180px] py-1.5 rounded-xl bg-navy-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40',
              align === 'right' ? 'right-0' : 'left-0',
              position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
            ].join(' ')}
          >
            {items.map((entry, i) => {
              if (isDivider(entry)) {
                return <div key={`divider-${i}`} className="my-1.5 border-t border-white/10" />;
              }

              const Icon = entry.icon;
              const isFocused = focusIndex === i;

              return (
                <button
                  key={entry.id}
                  role="menuitem"
                  disabled={entry.disabled}
                  onClick={() => {
                    if (!entry.disabled) {
                      entry.onClick();
                      setIsOpen(false);
                    }
                  }}
                  onMouseEnter={() => setFocusIndex(i)}
                  className={[
                    'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors',
                    entry.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : entry.danger
                      ? isFocused
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'text-rose-400 hover:bg-rose-500/10'
                      : isFocused
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {Icon && <Icon size={16} className="flex-shrink-0" />}
                  <span>{entry.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
