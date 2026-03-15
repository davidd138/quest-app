'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls, type PanInfo } from 'framer-motion';

type SnapPoint = 'collapsed' | 'half' | 'full';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoint?: SnapPoint;
  onSnapChange?: (snap: SnapPoint) => void;
  title?: string;
}

const snapHeights: Record<SnapPoint, string> = {
  collapsed: '15vh',
  half: '50vh',
  full: '90vh',
};

const snapValues: Record<SnapPoint, number> = {
  collapsed: 0.15,
  half: 0.5,
  full: 0.9,
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
  exit: { y: '100%' },
};

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  snapPoint = 'half',
  onSnapChange,
  title,
}) => {
  const dragControls = useDragControls();

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const velocity = info.velocity.y;
      const offset = info.offset.y;

      // Fast swipe down => close
      if (velocity > 500 || offset > 200) {
        onClose();
        return;
      }

      // Determine closest snap point based on drag position
      if (!onSnapChange) return;

      const windowHeight = window.innerHeight;
      const currentY = offset;
      const currentFraction = 1 - currentY / windowHeight;

      let closest: SnapPoint = snapPoint;
      let minDist = Infinity;
      for (const [key, value] of Object.entries(snapValues) as [SnapPoint, number][]) {
        const dist = Math.abs(currentFraction - value);
        if (dist < minDist) {
          minDist = dist;
          closest = key;
        }
      }
      onSnapChange(closest);
    },
    [onClose, onSnapChange, snapPoint],
  );

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            onClick={onClose}
            data-testid="drawer-backdrop"
          />

          {/* Drawer */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-navy-950/95 backdrop-blur-xl border-t border-x border-white/10 shadow-2xl shadow-black/40"
            style={{ maxHeight: snapHeights[snapPoint], height: snapHeights[snapPoint] }}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* Drag handle */}
            <div
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
              data-testid="drawer-handle"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Title */}
            {title && (
              <div className="px-5 pb-3 border-b border-white/10">
                <h3 className="font-heading font-semibold text-white text-lg">{title}</h3>
              </div>
            )}

            {/* Content */}
            <div className="px-5 py-4 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100% - 60px)' }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default Drawer;
