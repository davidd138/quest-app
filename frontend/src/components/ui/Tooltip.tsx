'use client';

import React, { useState, useRef, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

interface TooltipProps {
  /** Text or ReactNode to display inside the tooltip. */
  content: React.ReactNode;
  /** Preferred position relative to the trigger element. */
  position?: TooltipPosition;
  /** Delay in ms before the tooltip appears. */
  delay?: number;
  /** The element that triggers the tooltip on hover / focus. */
  children: React.ReactNode;
  /** Extra classes on the wrapper span. */
  className?: string;
}

const positionStyles: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowStyles: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-l-transparent border-r-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-l-transparent border-r-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-t-transparent border-b-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-t-transparent border-b-transparent border-l-transparent',
};

const originMap: Record<TooltipPosition, string> = {
  top: '50% 100%',
  bottom: '50% 0%',
  left: '100% 50%',
  right: '0% 50%',
};

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  delay = 300,
  children,
  className = '',
}) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  const show = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  }, []);

  return (
    <span
      className={['relative inline-flex', className].join(' ')}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {/* Trigger */}
      <span aria-describedby={visible ? tooltipId : undefined}>
        {children}
      </span>

      {/* Tooltip */}
      <AnimatePresence>
        {visible && (
          <motion.div
            id={tooltipId}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ transformOrigin: originMap[position] }}
            className={[
              'absolute z-50 pointer-events-none whitespace-nowrap',
              'rounded-lg px-3 py-1.5 text-xs font-medium text-slate-200',
              'bg-slate-800/95 backdrop-blur-md border border-white/10 shadow-lg shadow-black/30',
              positionStyles[position],
            ].join(' ')}
          >
            {content}
            {/* Arrow */}
            <span
              className={[
                'absolute w-0 h-0 border-4',
                arrowStyles[position],
              ].join(' ')}
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

export default Tooltip;
