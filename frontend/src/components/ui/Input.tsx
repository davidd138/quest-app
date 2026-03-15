'use client';

import React from 'react';
import { type LucideIcon } from 'lucide-react';

type InputVariant = 'default' | 'search';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: LucideIcon;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      className = '',
      id,
      ...inputProps
    },
    ref,
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <LeftIcon size={16} />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full bg-white/5 backdrop-blur-xl border rounded-xl text-sm text-white placeholder:text-slate-500 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50',
              error
                ? 'border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/50'
                : 'border-white/10',
              LeftIcon ? 'pl-10' : 'pl-4',
              'pr-4 py-2.5',
              variant === 'search' ? 'rounded-full' : '',
              className,
            ].join(' ')}
            {...inputProps}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-rose-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
