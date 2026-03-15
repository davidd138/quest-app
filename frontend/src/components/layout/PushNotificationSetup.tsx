'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useNotifications } from '@/hooks/useNotifications';

const DISMISSED_KEY = 'qm-notif-banner-dismissed';

export default function PushNotificationSetup() {
  const {
    permission,
    supported,
    preferences,
    requestPermission,
    setPreferences,
  } = useNotifications();

  const [showBanner, setShowBanner] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!supported) return;
    if (permission === 'granted' || permission === 'denied') return;

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [supported, permission]);

  const handleEnable = async () => {
    setRequesting(true);
    const result = await requestPermission();
    setRequesting(false);

    if (result === 'granted') {
      setShowPrefs(true);
      setShowBanner(false);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(DISMISSED_KEY, 'true');
  };

  if (!supported) return null;

  return (
    <>
      {/* Permission banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-4 right-4 z-50 max-w-sm w-full"
          >
            <div className="glass rounded-2xl border border-white/10 p-5 shadow-2xl">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white">
                    Activa las notificaciones
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Recibe alertas de nuevas quests, logros y actualizaciones de la comunidad.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" onClick={handleEnable} loading={requesting}>
                      Activar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleDismiss}>
                      Ahora no
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preferences modal */}
      <AnimatePresence>
        {showPrefs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowPrefs(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold text-white">
                    Notificaciones activadas
                  </h3>
                  <p className="text-xs text-slate-400">Elige que quieres recibir</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'questUpdates' as const, label: 'Actualizaciones de quests', desc: 'Nuevas quests y cambios en quests activas' },
                  { key: 'achievements' as const, label: 'Logros', desc: 'Cuando desbloqueas medallas y logros' },
                  { key: 'social' as const, label: 'Social', desc: 'Actividad de amigos y comunidad' },
                  { key: 'marketing' as const, label: 'Novedades', desc: 'Eventos especiales y nuevas funcionalidades' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={preferences[item.key]}
                      onChange={(e) =>
                        setPreferences({ [item.key]: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-violet-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <Button
                fullWidth
                className="mt-6"
                onClick={() => setShowPrefs(false)}
              >
                Guardar preferencias
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline status for settings page - permission denied */}
      {permission === 'denied' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <BellOff className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-rose-300">Notificaciones bloqueadas</p>
            <p className="text-xs text-slate-400">
              Habilita las notificaciones desde la configuracion de tu navegador.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
