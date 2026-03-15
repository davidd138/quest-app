'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Cookie, X, Settings, Check } from 'lucide-react';

const STORAGE_KEY = 'qm_cookie_consent';

interface CookiePreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  functional: boolean;
  consentedAt: string;
}

function getStoredPreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return null;
}

function savePreferences(prefs: CookiePreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [functional, setFunctional] = useState(false);

  useEffect(() => {
    const prefs = getStoredPreferences();
    if (!prefs) {
      // Small delay to avoid layout shift on initial render
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = useCallback(() => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics: true,
      functional: true,
      consentedAt: new Date().toISOString(),
    };
    savePreferences(prefs);
    setVisible(false);
    setShowConfig(false);
  }, []);

  const acceptNecessaryOnly = useCallback(() => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics: false,
      functional: false,
      consentedAt: new Date().toISOString(),
    };
    savePreferences(prefs);
    setVisible(false);
    setShowConfig(false);
  }, []);

  const saveCustomPreferences = useCallback(() => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics,
      functional,
      consentedAt: new Date().toISOString(),
    };
    savePreferences(prefs);
    setVisible(false);
    setShowConfig(false);
  }, [analytics, functional]);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Configuration Modal */}
          <AnimatePresence>
            {showConfig && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              >
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowConfig(false)}
                />

                {/* Modal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 w-full max-w-lg glass rounded-2xl border border-slate-700/50 shadow-2xl"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                          <Settings className="w-5 h-5 text-violet-400" />
                        </div>
                        <h2 className="font-heading text-lg font-bold text-white">
                          Configurar cookies
                        </h2>
                      </div>
                      <button
                        onClick={() => setShowConfig(false)}
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-slate-400 text-sm mb-6">
                      Seleccione que tipos de cookies desea aceptar. Las cookies necesarias no se
                      pueden desactivar ya que son esenciales para el funcionamiento de la plataforma.
                    </p>

                    {/* Cookie categories */}
                    <div className="space-y-4">
                      {/* Necessary - always on */}
                      <div className="glass rounded-xl p-4 border border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-white">
                              Cookies necesarias
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Esenciales para la autenticacion, seguridad y funcionamiento basico de
                              la plataforma. No se pueden desactivar.
                            </p>
                          </div>
                          <div className="ml-4">
                            <div className="w-12 h-7 rounded-full bg-emerald-500/30 flex items-center justify-end px-1 cursor-not-allowed">
                              <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Analytics */}
                      <div className="glass rounded-xl p-4 border border-slate-700/30">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-white">
                              Cookies analiticas
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Nos ayudan a entender como los usuarios interactuan con la plataforma
                              para mejorar la experiencia. Los datos se anonimizan.
                            </p>
                          </div>
                          <div className="ml-4">
                            <button
                              onClick={() => setAnalytics(!analytics)}
                              className={`w-12 h-7 rounded-full flex items-center px-1 transition-all duration-200 ${
                                analytics
                                  ? 'bg-violet-500/30 justify-end'
                                  : 'bg-slate-700/50 justify-start'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full transition-colors duration-200 ${
                                  analytics ? 'bg-violet-400' : 'bg-slate-500'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Functional */}
                      <div className="glass rounded-xl p-4 border border-slate-700/30">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-white">
                              Cookies funcionales
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Permiten recordar sus preferencias (idioma, tema, configuracion de
                              visualizacion) para una experiencia personalizada.
                            </p>
                          </div>
                          <div className="ml-4">
                            <button
                              onClick={() => setFunctional(!functional)}
                              className={`w-12 h-7 rounded-full flex items-center px-1 transition-all duration-200 ${
                                functional
                                  ? 'bg-violet-500/30 justify-end'
                                  : 'bg-slate-700/50 justify-start'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full transition-colors duration-200 ${
                                  functional ? 'bg-violet-400' : 'bg-slate-500'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={acceptNecessaryOnly}
                        className="flex-1 py-2.5 rounded-xl border border-slate-700/50 text-slate-300 hover:bg-white/5 text-sm font-medium transition-all duration-200"
                      >
                        Solo necesarias
                      </button>
                      <button
                        onClick={saveCustomPreferences}
                        className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-violet-600/25"
                      >
                        Guardar preferencias
                      </button>
                    </div>

                    {/* Privacy link */}
                    <p className="text-center mt-4">
                      <Link
                        href="/privacy"
                        className="text-xs text-slate-500 hover:text-violet-400 transition-colors underline"
                      >
                        Consultar Politica de Privacidad completa
                      </Link>
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Banner */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
          >
            <div className="max-w-4xl mx-auto glass rounded-2xl border border-slate-700/50 shadow-2xl p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Icon and text */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Cookie className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-white mb-1">
                      Utilizamos cookies
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Esta plataforma utiliza cookies propias y de terceros para garantizar su
                      correcto funcionamiento, mejorar la experiencia de usuario y analizar el uso del
                      servicio. Puede aceptar todas las cookies, solo las necesarias, o configurar sus
                      preferencias.{' '}
                      <Link
                        href="/privacy"
                        className="text-violet-400 hover:text-violet-300 underline"
                      >
                        Mas informacion
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    onClick={() => setShowConfig(true)}
                    className="px-4 py-2.5 rounded-xl border border-slate-700/50 text-slate-300 hover:bg-white/5 text-sm font-medium transition-all duration-200 whitespace-nowrap"
                  >
                    Configurar
                  </button>
                  <button
                    onClick={acceptNecessaryOnly}
                    className="px-4 py-2.5 rounded-xl border border-slate-700/50 text-slate-300 hover:bg-white/5 text-sm font-medium transition-all duration-200 whitespace-nowrap"
                  >
                    Solo necesarias
                  </button>
                  <button
                    onClick={acceptAll}
                    className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-violet-600/25 whitespace-nowrap"
                  >
                    Aceptar todas
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
