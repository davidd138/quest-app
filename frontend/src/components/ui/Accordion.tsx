'use client';

import React, { useState, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  /** Unique key for the item. */
  key: string;
  /** Title displayed in the header. */
  title: React.ReactNode;
  /** Content revealed when expanded. */
  content: React.ReactNode;
}

interface AccordionProps {
  /** Array of accordion items. */
  items: AccordionItem[];
  /** Allow multiple items to be open simultaneously. */
  multiple?: boolean;
  /** Keys of items that are open by default. */
  defaultOpen?: string[];
  /** Extra wrapper classes. */
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  multiple = false,
  defaultOpen = [],
  className = '',
}) => {
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set(defaultOpen));
  const baseId = useId();

  const toggle = useCallback(
    (key: string) => {
      setOpenKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          if (!multiple) next.clear();
          next.add(key);
        }
        return next;
      });
    },
    [multiple],
  );

  return (
    <div className={`space-y-2 ${className}`} role="presentation">
      {items.map((item) => {
        const isOpen = openKeys.has(item.key);
        const headingId = `${baseId}-heading-${item.key}`;
        const panelId = `${baseId}-panel-${item.key}`;

        return (
          <div
            key={item.key}
            className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden"
          >
            <h3>
              <button
                id={headingId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle(item.key);
                  }
                }}
                className="flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span>{item.title}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="flex-shrink-0 ml-2"
                >
                  <ChevronDown size={16} className="text-slate-400" />
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 text-sm text-slate-300">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
