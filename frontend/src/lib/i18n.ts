'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Locale = 'es' | 'en';

const translations: Record<Locale, Record<string, string>> = {
  es: {
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.quests': 'Aventuras',
    'nav.discover': 'Descubrir',
    'nav.history': 'Historial',
    'nav.achievements': 'Logros',
    'nav.leaderboard': 'Clasificación',
    'nav.analytics': 'Analíticas',
    'nav.social': 'Social',
    'nav.profile': 'Perfil',
    'nav.notifications': 'Notificaciones',
    'nav.admin.quests': 'Gestionar Aventuras',
    'nav.admin.analytics': 'Analíticas del Equipo',
    'nav.admin.users': 'Usuarios',

    // Dashboard
    'dashboard.welcome': 'Bienvenido de nuevo',
    'dashboard.totalPoints': 'Puntos Totales',
    'dashboard.questsCompleted': 'Aventuras Completadas',
    'dashboard.playTime': 'Tiempo de Juego',
    'dashboard.avgScore': 'Puntuación Media',
    'dashboard.activeQuests': 'Aventuras Activas',
    'dashboard.recommended': 'Recomendadas para Ti',
    'dashboard.recentActivity': 'Actividad Reciente',
    'dashboard.achievements': 'Últimos Logros',

    // Quest
    'quest.start': 'Comenzar Aventura',
    'quest.continue': 'Continuar Aventura',
    'quest.stages': 'etapas',
    'quest.minutes': 'minutos',
    'quest.points': 'puntos',
    'quest.difficulty.easy': 'Fácil',
    'quest.difficulty.medium': 'Media',
    'quest.difficulty.hard': 'Difícil',
    'quest.difficulty.legendary': 'Legendaria',
    'quest.category.adventure': 'Aventura',
    'quest.category.mystery': 'Misterio',
    'quest.category.cultural': 'Cultural',
    'quest.category.educational': 'Educativo',
    'quest.category.culinary': 'Culinario',
    'quest.category.nature': 'Naturaleza',
    'quest.category.urban': 'Urbano',
    'quest.category.team_building': 'Team Building',

    // Voice
    'voice.connecting': 'Conectando...',
    'voice.listening': 'Escuchando...',
    'voice.speaking': 'Hablando...',
    'voice.idle': 'Preparado',
    'voice.start': 'Iniciar Conversación',
    'voice.end': 'Finalizar',
    'voice.hint': 'Pista',

    // Auth
    'auth.login': 'Iniciar Sesión',
    'auth.register': 'Crear Cuenta',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.name': 'Nombre completo',
    'auth.signout': 'Cerrar Sesión',
    'auth.confirmCode': 'Código de confirmación',

    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Ha ocurrido un error',
    'common.retry': 'Reintentar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.create': 'Crear',
    'common.search': 'Buscar...',
    'common.noResults': 'No se encontraron resultados',
    'common.viewAll': 'Ver todo',

    // GDPR
    'gdpr.exportData': 'Descargar mis datos',
    'gdpr.deleteAccount': 'Eliminar mi cuenta',
    'gdpr.cookieConsent': 'Usamos cookies para mejorar tu experiencia',
    'gdpr.acceptAll': 'Aceptar todas',
    'gdpr.necessaryOnly': 'Solo necesarias',
    'gdpr.configure': 'Configurar',

    // Accessibility
    'a11y.skipToContent': 'Ir al contenido principal',
    'a11y.shortcuts': 'Atajos de teclado',
    'a11y.shortcutsTitle': 'Atajos de Teclado',
    'a11y.navigation': 'Navegación',
    'a11y.general': 'General',
    'a11y.focusSearch': 'Enfocar búsqueda',
    'a11y.closeModal': 'Cerrar modal',
    'a11y.showShortcuts': 'Mostrar atajos',
    'a11y.goToDashboard': 'Ir al panel',
    'a11y.goToQuests': 'Ir a aventuras',
    'a11y.goToLeaderboard': 'Ir a clasificación',

    // Language
    'lang.switch': 'Cambiar idioma',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.quests': 'Quests',
    'nav.discover': 'Discover',
    'nav.history': 'History',
    'nav.achievements': 'Achievements',
    'nav.leaderboard': 'Leaderboard',
    'nav.analytics': 'Analytics',
    'nav.social': 'Social',
    'nav.profile': 'Profile',
    'nav.notifications': 'Notifications',
    'nav.admin.quests': 'Manage Quests',
    'nav.admin.analytics': 'Team Analytics',
    'nav.admin.users': 'Users',

    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.totalPoints': 'Total Points',
    'dashboard.questsCompleted': 'Quests Completed',
    'dashboard.playTime': 'Play Time',
    'dashboard.avgScore': 'Avg Score',
    'dashboard.activeQuests': 'Active Quests',
    'dashboard.recommended': 'Recommended for You',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.achievements': 'Latest Achievements',

    // Quest
    'quest.start': 'Start Quest',
    'quest.continue': 'Continue Quest',
    'quest.stages': 'stages',
    'quest.minutes': 'minutes',
    'quest.points': 'points',
    'quest.difficulty.easy': 'Easy',
    'quest.difficulty.medium': 'Medium',
    'quest.difficulty.hard': 'Hard',
    'quest.difficulty.legendary': 'Legendary',
    'quest.category.adventure': 'Adventure',
    'quest.category.mystery': 'Mystery',
    'quest.category.cultural': 'Cultural',
    'quest.category.educational': 'Educational',
    'quest.category.culinary': 'Culinary',
    'quest.category.nature': 'Nature',
    'quest.category.urban': 'Urban',
    'quest.category.team_building': 'Team Building',

    // Voice
    'voice.connecting': 'Connecting...',
    'voice.listening': 'Listening...',
    'voice.speaking': 'Speaking...',
    'voice.idle': 'Ready',
    'voice.start': 'Start Conversation',
    'voice.end': 'End Call',
    'voice.hint': 'Hint',

    // Auth
    'auth.login': 'Sign In',
    'auth.register': 'Create Account',
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.name': 'Full name',
    'auth.signout': 'Sign Out',
    'auth.confirmCode': 'Confirmation code',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Retry',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.search': 'Search...',
    'common.noResults': 'No results found',
    'common.viewAll': 'View all',

    // GDPR
    'gdpr.exportData': 'Download my data',
    'gdpr.deleteAccount': 'Delete my account',
    'gdpr.cookieConsent': 'We use cookies to improve your experience',
    'gdpr.acceptAll': 'Accept all',
    'gdpr.necessaryOnly': 'Necessary only',
    'gdpr.configure': 'Configure',

    // Accessibility
    'a11y.skipToContent': 'Skip to main content',
    'a11y.shortcuts': 'Keyboard shortcuts',
    'a11y.shortcutsTitle': 'Keyboard Shortcuts',
    'a11y.navigation': 'Navigation',
    'a11y.general': 'General',
    'a11y.focusSearch': 'Focus search',
    'a11y.closeModal': 'Close modal',
    'a11y.showShortcuts': 'Show shortcuts',
    'a11y.goToDashboard': 'Go to dashboard',
    'a11y.goToQuests': 'Go to quests',
    'a11y.goToLeaderboard': 'Go to leaderboard',

    // Language
    'lang.switch': 'Switch language',
  },
};

const STORAGE_KEY = 'quest-app-locale';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'es';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'es') return stored;
  } catch {
    // localStorage may be unavailable
  }
  return 'es';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    // Sync with localStorage on mount (handles SSR hydration)
    const stored = getInitialLocale();
    if (stored !== locale) {
      setLocaleState(stored);
    }
    // Update html lang attribute
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // localStorage may be unavailable
    }
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = translations[locale][key];
      if (!value) {
        // Fallback to English, then to key itself
        value = translations.en[key] || key;
      }
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value.replace(`{{${paramKey}}}`, String(paramValue));
        });
      }
      return value;
    },
    [locale],
  );

  return React.createElement(
    I18nContext.Provider,
    { value: { locale, setLocale, t } },
    children,
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
