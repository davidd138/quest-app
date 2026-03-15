'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  allowNavigation?: boolean;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  allowNavigation = false,
}) => {
  return (
    <div className="w-full" role="navigation" aria-label="Progress steps">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;
          const isClickable = allowNavigation && onStepClick && (isCompleted || isCurrent);
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              {/* Step circle + label */}
              <div className="flex flex-col items-center relative z-10">
                <motion.button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick?.(index)}
                  className={[
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors relative',
                    isCompleted
                      ? 'bg-emerald-500 text-white cursor-pointer'
                      : isCurrent
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                      : 'bg-navy-800 text-slate-500 border border-slate-700/50',
                    isClickable && !isCurrent ? 'hover:ring-2 hover:ring-emerald-400/40' : '',
                    !isClickable && isUpcoming ? 'cursor-default' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  whileHover={isClickable ? { scale: 1.08 } : undefined}
                  whileTap={isClickable ? { scale: 0.95 } : undefined}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`${step.label}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <Check size={18} strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <span>{index + 1}</span>
                  )}

                  {/* Pulse ring for current step */}
                  {isCurrent && (
                    <motion.span
                      className="absolute inset-0 rounded-full border-2 border-violet-500"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </motion.button>

                {/* Label */}
                <span
                  className={[
                    'mt-2 text-xs font-medium text-center max-w-[80px] truncate',
                    isCompleted
                      ? 'text-emerald-400'
                      : isCurrent
                      ? 'text-white'
                      : 'text-slate-500',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 h-0.5 bg-navy-800 mx-2 relative -mt-5">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{
                      width: isCompleted ? '100%' : isCurrent ? '0%' : '0%',
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
