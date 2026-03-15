'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Compass, Map, Mic, Sparkles } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  icon: React.ElementType;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenido a QuestMaster',
    description:
      'Descubre aventuras interactivas con personajes IA, mapas reales y conversaciones de voz. Te guiaremos por la plataforma.',
    targetSelector: '[data-tour="logo"]',
    position: 'right',
    icon: Sparkles,
  },
  {
    id: 'sidebar',
    title: 'Navega por el menu',
    description:
      'Usa la barra lateral para acceder al dashboard, quests, logros, ranking y mas. Todo a un clic de distancia.',
    targetSelector: '[data-tour="sidebar-nav"]',
    position: 'right',
    icon: Map,
  },
  {
    id: 'quests',
    title: 'Explora las quests',
    description:
      'Busca aventuras por categoria, dificultad o ubicacion. Cada quest tiene etapas con personajes unicos.',
    targetSelector: '[data-tour="quests-link"]',
    position: 'right',
    icon: Compass,
  },
  {
    id: 'start-quest',
    title: 'Comienza tu primera quest',
    description:
      'Selecciona una quest, revisa sus etapas en el mapa y pulsa "Comenzar" para iniciar la aventura.',
    targetSelector: '[data-tour="dashboard-content"]',
    position: 'bottom',
    icon: Sparkles,
  },
  {
    id: 'voice',
    title: 'Chat de voz con IA',
    description:
      'En cada etapa, habla con personajes IA en tiempo real. Usa tu microfono para resolver desafios y avanzar.',
    targetSelector: '[data-tour="dashboard-content"]',
    position: 'bottom',
    icon: Mic,
  },
];

const STORAGE_KEY = 'qm-onboarding-completed';

interface OnboardingTourProps {
  forceShow?: boolean;
}

export function OnboardingTour({ forceShow = false }: OnboardingTourProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      return;
    }
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  const updateTargetRect = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    if (!step) return;
    const el = document.querySelector(step.targetSelector);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isVisible) return;
    updateTargetRect();

    const handleResize = () => updateTargetRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isVisible, currentStep, updateTargetRect]);

  // Observe target element size changes
  useEffect(() => {
    if (!isVisible) return;
    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    const el = document.querySelector(step.targetSelector);
    if (!el) return;

    resizeObserverRef.current = new ResizeObserver(() => updateTargetRect());
    resizeObserverRef.current.observe(el);

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [isVisible, currentStep, updateTargetRect]);

  const completeTour = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      completeTour();
    }
  }, [currentStep, completeTour]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    completeTour();
  }, [completeTour]);

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;
  const padding = 12;

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const style: React.CSSProperties = { position: 'fixed' };

    switch (step.position) {
      case 'right':
        style.top = targetRect.top + targetRect.height / 2;
        style.left = targetRect.right + padding + 16;
        style.transform = 'translateY(-50%)';
        break;
      case 'left':
        style.top = targetRect.top + targetRect.height / 2;
        style.right = window.innerWidth - targetRect.left + padding + 16;
        style.transform = 'translateY(-50%)';
        break;
      case 'bottom':
        style.top = targetRect.bottom + padding + 16;
        style.left = targetRect.left + targetRect.width / 2;
        style.transform = 'translateX(-50%)';
        break;
      case 'top':
        style.bottom = window.innerHeight - targetRect.top + padding + 16;
        style.left = targetRect.left + targetRect.width / 2;
        style.transform = 'translateX(-50%)';
        break;
    }

    return style;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999]" role="dialog" aria-label="Onboarding tour">
          {/* Dark overlay with spotlight cutout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <mask id="spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {targetRect && (
                    <rect
                      x={targetRect.left - padding}
                      y={targetRect.top - padding}
                      width={targetRect.width + padding * 2}
                      height={targetRect.height + padding * 2}
                      rx={16}
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.75)"
                mask="url(#spotlight-mask)"
              />
            </svg>

            {/* Spotlight border glow */}
            {targetRect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="absolute rounded-2xl border-2 border-violet-500/60 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                style={{
                  left: targetRect.left - padding,
                  top: targetRect.top - padding,
                  width: targetRect.width + padding * 2,
                  height: targetRect.height + padding * 2,
                }}
              />
            )}
          </motion.div>

          {/* Tooltip card */}
          <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={getTooltipStyle()}
            className="z-[10000] w-[340px] max-w-[90vw]"
          >
            <div className="bg-navy-900/90 backdrop-blur-2xl border border-white/15 rounded-2xl p-5 shadow-2xl shadow-violet-500/10">
              {/* Skip button */}
              <button
                onClick={handleSkip}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Omitir tour"
              >
                <X size={16} />
              </button>

              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center mb-3">
                <StepIcon size={20} className="text-violet-400" />
              </div>

              {/* Content */}
              <h3 className="font-heading text-lg font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-5">
                {step.description}
              </p>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {TOUR_STEPS.map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? 'w-6 bg-violet-500'
                        : i < currentStep
                        ? 'w-1.5 bg-violet-500/50'
                        : 'w-1.5 bg-slate-600'
                    }`}
                    animate={{ scale: i === currentStep ? 1 : 0.9 }}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handleSkip}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium"
                >
                  Omitir
                </button>

                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrev}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <ChevronLeft size={14} />
                      Anterior
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-600/25"
                  >
                    {currentStep === TOUR_STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
                    {currentStep < TOUR_STEPS.length - 1 && <ChevronRight size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
