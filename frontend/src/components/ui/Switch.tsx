'use client';

import React from 'react';
import { motion } from 'framer-motion';

type SwitchSize = 'sm' | 'md' | 'lg';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: SwitchSize;
  id?: string;
}

const trackSizes: Record<SwitchSize, string> = {
  sm: 'w-8 h-[18px]',
  md: 'w-11 h-6',
  lg: 'w-14 h-8',
};

const thumbSizes: Record<SwitchSize, { width: number; height: number; travel: number }> = {
  sm: { width: 14, height: 14, travel: 14 },
  md: { width: 20, height: 20, travel: 20 },
  lg: { width: 26, height: 26, travel: 24 },
};

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onChange, label, disabled = false, size = 'md', id }, ref) => {
    const thumbConfig = thumbSizes[size];
    const generatedId = React.useId();
    const switchId = id || `switch-${generatedId}`;

    return (
      <div className="inline-flex items-center gap-3">
        <button
          ref={ref}
          id={switchId}
          role="switch"
          type="button"
          aria-checked={checked}
          aria-label={label || undefined}
          disabled={disabled}
          onClick={() => !disabled && onChange(!checked)}
          className={[
            'relative inline-flex items-center rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950',
            trackSizes[size],
            checked ? 'bg-violet-600' : 'bg-slate-600',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <motion.span
            className="block rounded-full bg-white shadow-sm"
            style={{ width: thumbConfig.width, height: thumbConfig.height }}
            animate={{ x: checked ? thumbConfig.travel : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
        {label && (
          <label
            htmlFor={switchId}
            className={[
              'text-sm select-none',
              disabled ? 'text-slate-500 cursor-not-allowed' : 'text-slate-300 cursor-pointer',
            ].join(' ')}
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);

Switch.displayName = 'Switch';

export default Switch;
