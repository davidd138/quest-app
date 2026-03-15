'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Trophy,
  Compass,
  Users,
  Shield,
  Megaphone,
  Trash2,
  Check,
  Circle,
  Filter,
  ChevronDown,
  Inbox as InboxIcon,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

type NotificationType = 'quest_reminder' | 'achievement' | 'friend_request' | 'clan_invite' | 'admin_notice';

interface InboxNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; bg: string; label: string }> = {
  quest_reminder: { icon: Compass, color: 'text-violet-400', bg: 'bg-violet-500/15', label: 'Quest Reminder' },
  achievement: { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/15', label: 'Achievement' },
  friend_request: { icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'Friend Request' },
  clan_invite: { icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-500/15', label: 'Clan Invite' },
  admin_notice: { icon: Megaphone, color: 'text-rose-400', bg: 'bg-rose-500/15', label: 'Admin Notice' },
};

const mockNotifications: InboxNotification[] = [
  { id: 'n1', type: 'quest_reminder', title: 'Quest waiting for you', message: 'You started "The Lost Temple" 3 days ago. Continue your adventure!', timestamp: '2026-03-15T09:30:00Z', read: false },
  { id: 'n2', type: 'achievement', title: 'Achievement Unlocked!', message: 'You earned "First Steps" for completing your first quest stage.', timestamp: '2026-03-15T08:15:00Z', read: false },
  { id: 'n3', type: 'friend_request', title: 'New friend request', message: 'Elena Vasquez wants to be your friend.', timestamp: '2026-03-15T07:00:00Z', read: false },
  { id: 'n4', type: 'clan_invite', title: 'Clan invitation', message: 'You have been invited to join "Shadow Seekers" clan.', timestamp: '2026-03-14T18:45:00Z', read: true },
  { id: 'n5', type: 'admin_notice', title: 'Scheduled maintenance', message: 'QuestMaster will undergo maintenance on March 20th from 02:00-04:00 UTC.', timestamp: '2026-03-14T12:00:00Z', read: true },
  { id: 'n6', type: 'achievement', title: 'Level Up!', message: 'Congratulations! You reached Explorer Level 15.', timestamp: '2026-03-14T10:30:00Z', read: true },
  { id: 'n7', type: 'quest_reminder', title: 'New quest nearby', message: 'A new quest "Harbor Mysteries" is available 500m from your location.', timestamp: '2026-03-13T16:20:00Z', read: true },
  { id: 'n8', type: 'friend_request', title: 'New friend request', message: 'Marcus Chen wants to be your friend.', timestamp: '2026-03-13T14:10:00Z', read: true },
  { id: 'n9', type: 'clan_invite', title: 'Clan invitation', message: 'You have been invited to join "Night Explorers" clan.', timestamp: '2026-03-12T20:00:00Z', read: true },
  { id: 'n10', type: 'admin_notice', title: 'New feature: Voice Rooms', message: 'Voice rooms are now available! Create a room and invite friends to plan quests together.', timestamp: '2026-03-12T09:00:00Z', read: true },
];

function groupByDate(notifications: InboxNotification[]): Record<string, InboxNotification[]> {
  const groups: Record<string, InboxNotification[]> = {};
  const today = new Date('2026-03-15');
  const yesterday = new Date('2026-03-14');

  for (const n of notifications) {
    const date = new Date(n.timestamp);
    let label: string;

    if (date.toDateString() === today.toDateString()) {
      label = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday';
    } else {
      label = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }

  return groups;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function InboxPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [showFilter, setShowFilter] = useState(false);

  const filtered = useMemo(() => {
    if (filterType === 'all') return notifications;
    return notifications.filter((n) => n.type === filterType);
  }, [notifications, filterType]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-violet-400" />
            Inbox
          </h1>
          <p className="text-slate-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <Check className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </motion.div>

      {/* Filter bar */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl glass border border-white/10 text-slate-300 hover:border-violet-500/30 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {filterType === 'all' ? 'All types' : typeConfig[filterType].label}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 mt-2 w-56 glass rounded-xl border border-white/10 shadow-2xl z-20 overflow-hidden"
              >
                <button
                  onClick={() => { setFilterType('all'); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    filterType === 'all' ? 'bg-violet-500/10 text-violet-400' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  All types
                </button>
                {(Object.entries(typeConfig) as [NotificationType, typeof typeConfig[NotificationType]][]).map(([type, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => { setFilterType(type); setShowFilter(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                        filterType === type ? 'bg-violet-500/10 text-violet-400' : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                      {cfg.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {filterType !== 'all' && (
          <button
            onClick={() => setFilterType('all')}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear filter
          </button>
        )}
      </motion.div>

      {/* Grouped notifications */}
      {Object.entries(grouped).map(([dateLabel, items]) => (
        <motion.div key={dateLabel} variants={itemVariants} className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            {dateLabel}
          </h3>
          <div className="space-y-2">
            <AnimatePresence>
              {items.map((notification) => {
                const cfg = typeConfig[notification.type];
                const Icon = cfg.icon;

                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                    className={`glass rounded-xl p-4 border transition-all duration-200 group ${
                      notification.read
                        ? 'border-transparent opacity-70 hover:opacity-100'
                        : 'border-violet-500/20 bg-violet-500/[0.03]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`text-sm font-medium ${notification.read ? 'text-slate-300' : 'text-white'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">
                            {formatTime(notification.timestamp)}
                          </span>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => toggleRead(notification.id)}
                              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors"
                              title={notification.read ? 'Mark as unread' : 'Mark as read'}
                            >
                              {notification.read ? (
                                <Circle className="w-3.5 h-3.5" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="glass rounded-2xl p-12 text-center border border-slate-700/30"
        >
          <InboxIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-semibold text-white mb-2">
            {filterType !== 'all' ? 'No notifications of this type' : 'Inbox is empty'}
          </h3>
          <p className="text-slate-400 text-sm">
            {filterType !== 'all'
              ? 'Try selecting a different filter to see more notifications.'
              : 'You are all caught up! New notifications will appear here.'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
