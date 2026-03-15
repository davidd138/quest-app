'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, LifeBuoy, type LucideIcon } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
  /** Error message to display. */
  message?: string;
  /** Callback fired when the user clicks "Reintentar". */
  onRetry?: () => void;
  /** Override the default icon. */
  icon?: LucideIcon;
  /** Optional support contact link. */
  supportHref?: string;
  /** Extra wrapper classes. */
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Ha ocurrido un error inesperado.',
  onRetry,
  icon: Icon = AlertTriangle,
  supportHref = 'mailto:soporte@questmaster.app',
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={[
        'w-full max-w-md mx-auto rounded-2xl p-8 text-center',
        'bg-white/5 backdrop-blur-xl border border-rose-500/20 shadow-xl shadow-rose-500/5',
        className,
      ].join(' ')}
      role="alert"
    >
      {/* Icon */}
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20">
        <Icon size={28} className="text-rose-400" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-2">
        Algo salio mal
      </h3>

      {/* Message */}
      <p className="text-sm text-slate-400 leading-relaxed mb-6">
        {message}
      </p>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3">
        {onRetry && (
          <Button
            variant="primary"
            size="md"
            leftIcon={RefreshCw}
            onClick={onRetry}
          >
            Reintentar
          </Button>
        )}

        {supportHref && (
          <a
            href={supportHref}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <LifeBuoy size={12} />
            Contactar soporte
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default ErrorState;
