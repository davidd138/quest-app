'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Trophy,
  Compass,
  Users,
  Star,
  Zap,
  CheckCheck,
  Filter,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'quest_completed' | 'achievement' | 'friend_request' | 'level_up' | 'new_quest';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const iconMap = {
  quest_completed: Compass,
  achievement: Trophy,
  friend_request: Users,
  level_up: Star,
  new_quest: Zap,
};

const colorMap = {
  quest_completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  achievement: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  friend_request: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  level_up: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  new_quest: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
};

const typeLabels: Record<string, string> = {
  quest_completed: 'Quest',
  achievement: 'Logro',
  friend_request: 'Social',
  level_up: 'Nivel',
  new_quest: 'Nueva quest',
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} dia${days > 1 ? 's' : ''}`;
  const weeks = Math.floor(days / 7);
  return `hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
}

// Mock data
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'quest_completed',
    title: 'Quest completada',
    message: 'Has completado "El Misterio de la Alhambra" con una puntuacion de 950 puntos. Tu mejor resultado hasta ahora.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Logro desbloqueado: Explorador Veterano',
    message: 'Has completado 10 quests diferentes. Sigue asi para desbloquear "Leyenda Viviente".',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
  },
  {
    id: '3',
    type: 'friend_request',
    title: 'Solicitud de amistad',
    message: 'Elena V. (Nivel 42) quiere ser tu amiga. Teneis 3 quests en comun.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: false,
  },
  {
    id: '4',
    type: 'level_up',
    title: 'Subida de nivel',
    message: 'Has alcanzado el nivel 15. Nuevas quests desbloqueadas: "La Catedral Perdida" y "Ruta del Camino".',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
  {
    id: '5',
    type: 'new_quest',
    title: 'Nueva quest disponible',
    message: '"Secretos de Barcelona" ya esta disponible en tu zona. Dificultad: Intermedia. Duracion estimada: 2h.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    read: true,
  },
  {
    id: '6',
    type: 'achievement',
    title: 'Logro desbloqueado: Conversador',
    message: 'Has tenido 25 conversaciones con personajes IA. Los personajes recuerdan tus aventuras.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    read: true,
  },
  {
    id: '7',
    type: 'quest_completed',
    title: 'Quest completada',
    message: 'Has completado "Ruta de los Templarios" en modo dificil. Bonus de 200 puntos obtenido.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96),
    read: true,
  },
  {
    id: '8',
    type: 'friend_request',
    title: 'Marcus C. acepto tu solicitud',
    message: 'Ahora podeis competir juntos en quests multijugador.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120),
    read: true,
  },
  {
    id: '9',
    type: 'new_quest',
    title: 'Quest de temporada',
    message: '"Misterios de Semana Santa" - Quest limitada disponible hasta el 15 de abril.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 168),
    read: true,
  },
];

type FilterType = 'all' | 'quest_completed' | 'achievement' | 'friend_request' | 'level_up' | 'new_quest';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<FilterType>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered =
    filter === 'all' ? notifications : notifications.filter((n) => n.type === filter);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'quest_completed', label: 'Quests' },
    { value: 'achievement', label: 'Logros' },
    { value: 'friend_request', label: 'Social' },
    { value: 'level_up', label: 'Niveles' },
    { value: 'new_quest', label: 'Nuevas' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-600/15 text-violet-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Notificaciones</h1>
            <p className="text-sm text-slate-400">
              {unreadCount > 0
                ? `${unreadCount} sin leer`
                : 'Todas leidas'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 hover:bg-violet-600/20 text-sm font-medium transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como leidas
          </motion.button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filter === f.value
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((notification, index) => {
            const Icon = iconMap[notification.type];
            const colors = colorMap[notification.type];
            return (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                onClick={() => toggleRead(notification.id)}
                className={`glass rounded-xl border cursor-pointer transition-all duration-200 hover:border-slate-600/50 ${
                  !notification.read
                    ? 'border-violet-500/20 bg-violet-500/5'
                    : 'border-slate-700/50'
                }`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-2.5 rounded-xl flex-shrink-0 border ${colors}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-sm font-semibold ${!notification.read ? 'text-white' : 'text-slate-300'}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-600 whitespace-nowrap flex-shrink-0">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                      </div>

                      <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors}`}>
                          {typeLabels[notification.type]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Bell className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No hay notificaciones</p>
            <p className="text-sm text-slate-600 mt-1">
              Las notificaciones apareceran aqui cuando haya novedades
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
