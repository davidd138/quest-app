'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const typeConfig: Record<
  ToastType,
  { icon: typeof CheckCircle2; classes: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    classes: 'border-emerald-500/30 bg-emerald-500/10',
    iconColor: 'text-emerald-400',
  },
  error: {
    icon: XCircle,
    classes: 'border-rose-500/30 bg-rose-500/10',
    iconColor: 'text-rose-400',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'border-amber-500/30 bg-amber-500/10',
    iconColor: 'text-amber-400',
  },
  info: {
    icon: Info,
    classes: 'border-violet-500/30 bg-violet-500/10',
    iconColor: 'text-violet-400',
  },
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const config = typeConfig[t.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={[
                  'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-lg shadow-black/20',
                  config.classes,
                ].join(' ')}
              >
                <Icon size={18} className={`mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                <p className="text-sm text-slate-200 flex-1">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="flex-shrink-0 p-0.5 rounded text-slate-500 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

export default ToastProvider;
