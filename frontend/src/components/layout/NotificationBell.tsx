'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trophy, Compass, Users, Star, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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
  quest_completed: 'text-emerald-400 bg-emerald-500/10',
  achievement: 'text-amber-400 bg-amber-500/10',
  friend_request: 'text-cyan-400 bg-cyan-500/10',
  level_up: 'text-violet-400 bg-violet-500/10',
  new_quest: 'text-fuchsia-400 bg-fuchsia-500/10',
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

// Mock notifications - replace with real data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'quest_completed',
    title: 'Quest completada',
    message: 'Has completado "El Misterio de la Alhambra"',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Logro desbloqueado',
    message: 'Explorador Veterano - 10 quests completadas',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
  },
  {
    id: '3',
    type: 'friend_request',
    title: 'Solicitud de amistad',
    message: 'Elena V. quiere ser tu amiga',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: false,
  },
  {
    id: '4',
    type: 'level_up',
    title: 'Subida de nivel',
    message: 'Has alcanzado el nivel 15',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
  {
    id: '5',
    type: 'new_quest',
    title: 'Nueva quest disponible',
    message: '"Secretos de Barcelona" ya disponible',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    read: true,
  },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications] = useState<Notification[]>(mockNotifications);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-violet-500 text-white text-[10px] font-bold px-1 shadow-lg shadow-violet-500/50"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-xl glass border border-slate-700/50 shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-violet-400 font-medium">
                  {unreadCount} sin leer
                </span>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => {
                const Icon = iconMap[notification.type];
                const colors = colorMap[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-slate-700/30 hover:bg-white/5 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-violet-500/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${colors}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-1">
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-violet-400 hover:text-violet-300 hover:bg-white/5 transition-colors"
            >
              Ver todas
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
