'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import Button from '@/components/ui/Button';

interface WizardStepProps {
  stepNumber: number;
  title: string;
  description?: string;
  totalSteps: number;
  currentStep: number;
  isValid: boolean;
  children: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  showSkip?: boolean;
  direction?: 1 | -1;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function WizardStep({
  stepNumber,
  title,
  description,
  totalSteps,
  currentStep,
  isValid,
  children,
  onNext,
  onPrevious,
  onSkip,
  nextLabel = 'Siguiente',
  showSkip = false,
  direction = 1,
}: WizardStepProps) {
  if (currentStep !== stepNumber) return null;

  return (
    <motion.div
      key={stepNumber}
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full"
    >
      {/* Step header */}
      <div className="glass rounded-2xl border border-white/10 p-6 md:p-8 backdrop-blur-xl">
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              ${isValid
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-violet-500/20 text-violet-400'
              }
            `}
          >
            {isValid ? (
              <Check className="w-5 h-5" />
            ) : (
              <span className="text-sm font-bold">{stepNumber}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading text-xl font-bold text-white">{title}</h2>
            {description && (
              <p className="text-sm text-slate-400 mt-1">{description}</p>
            )}
          </div>
          <span className="text-xs text-slate-500 font-medium flex-shrink-0">
            {stepNumber} / {totalSteps}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-4">{children}</div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
          <div>
            {onPrevious && stepNumber > 1 && (
              <Button variant="ghost" leftIcon={ChevronLeft} onClick={onPrevious}>
                Anterior
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {showSkip && onSkip && (
              <Button variant="ghost" rightIcon={SkipForward} onClick={onSkip}>
                Saltar
              </Button>
            )}
            {onNext && (
              <Button
                rightIcon={ChevronRight}
                onClick={onNext}
                disabled={!isValid}
              >
                {nextLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
