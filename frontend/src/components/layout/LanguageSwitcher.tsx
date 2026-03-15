'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const prefersReducedMotion = useReducedMotion();

  const toggleLocale = () => {
    setLocale(locale === 'es' ? 'en' : 'es');
  };

  const springTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 500, damping: 30 };

  return (
    <button
      onClick={toggleLocale}
      className="relative flex items-center h-8 w-[68px] rounded-full bg-navy-800/60 border border-slate-700/50 backdrop-blur-sm cursor-pointer transition-colors duration-200 hover:border-violet-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
      aria-label={t('lang.switch')}
      title={t('lang.switch')}
      type="button"
    >
      {/* Sliding indicator */}
      <motion.div
        className="absolute top-0.5 w-[30px] h-[28px] rounded-full bg-gradient-to-br from-violet-500/80 to-emerald-500/80 shadow-lg"
        animate={{ left: locale === 'es' ? '2px' : '34px' }}
        transition={springTransition}
        aria-hidden="true"
      />

      {/* ES label */}
      <span
        className={`relative z-10 flex-1 text-center text-xs font-semibold transition-colors duration-200 select-none ${
          locale === 'es' ? 'text-white' : 'text-slate-500'
        }`}
        aria-hidden="true"
      >
        ES
      </span>

      {/* EN label */}
      <span
        className={`relative z-10 flex-1 text-center text-xs font-semibold transition-colors duration-200 select-none ${
          locale === 'en' ? 'text-white' : 'text-slate-500'
        }`}
        aria-hidden="true"
      >
        EN
      </span>
    </button>
  );
}
