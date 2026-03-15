'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  UserPlus,
  Trophy,
  Zap,
  Star,
  Compass,
} from 'lucide-react';

export interface UserProfile {
  id: string;
  name: string;
  title?: string;
  level: number;
  avatarUrl?: string;
  questsCompleted: number;
  totalPoints: number;
  achievementCount: number;
  recentActivity?: { quest: string; action: string; time: string }[];
  isFriend?: boolean;
}

interface UserProfileCardProps {
  user: UserProfile;
  visible: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onMessage?: () => void;
  onAddFriend?: () => void;
}

function AvatarCircle({ name, size = 'lg' }: { name: string; size?: 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);
  const colors = [
    'from-violet-500 to-fuchsia-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-cyan-500 to-blue-500',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-10 h-10 text-sm';

  return (
    <div
      className={`${sizeClass} rounded-2xl bg-gradient-to-br ${colors[idx]} flex items-center justify-center font-bold text-white shadow-lg`}
    >
      {initials}
    </div>
  );
}

const positionStyles = {
  top: 'bottom-full mb-3 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-3 left-1/2 -translate-x-1/2',
  left: 'right-full mr-3 top-1/2 -translate-y-1/2',
  right: 'left-full ml-3 top-1/2 -translate-y-1/2',
};

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  visible,
  position = 'top',
  onMessage,
  onAddFriend,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: position === 'top' ? 8 : -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: position === 'top' ? 8 : -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`absolute ${positionStyles[position]} z-50 w-72`}
        >
          <div className="rounded-2xl bg-navy-950/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden">
            {/* Header gradient */}
            <div className="h-16 bg-gradient-to-r from-violet-600/30 via-fuchsia-600/20 to-violet-600/30 relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(139,92,246,0.15),transparent)]" />
            </div>

            {/* Avatar + Info */}
            <div className="px-5 -mt-8 relative">
              <div className="flex items-end gap-3 mb-3">
                <div className="relative">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-16 h-16 rounded-2xl object-cover border-4 border-navy-950 shadow-xl"
                    />
                  ) : (
                    <div className="border-4 border-navy-950 rounded-2xl">
                      <AvatarCircle name={user.name} />
                    </div>
                  )}
                  {/* Level badge */}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-navy-950 shadow-lg">
                    {user.level}
                  </div>
                </div>
                <div className="pb-1">
                  <h4 className="font-heading font-bold text-white text-sm leading-tight">
                    {user.name}
                  </h4>
                  {user.title && (
                    <p className="text-[10px] text-violet-400 font-medium">{user.title}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="rounded-xl bg-white/5 px-2 py-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Compass className="w-3 h-3 text-violet-400" />
                  </div>
                  <p className="text-sm font-bold text-white">{user.questsCompleted}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Quests</p>
                </div>
                <div className="rounded-xl bg-white/5 px-2 py-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Zap className="w-3 h-3 text-emerald-400" />
                  </div>
                  <p className="text-sm font-bold text-emerald-400">
                    {user.totalPoints >= 1000
                      ? `${(user.totalPoints / 1000).toFixed(1)}k`
                      : user.totalPoints}
                  </p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Points</p>
                </div>
                <div className="rounded-xl bg-white/5 px-2 py-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Trophy className="w-3 h-3 text-amber-400" />
                  </div>
                  <p className="text-sm font-bold text-amber-400">{user.achievementCount}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Awards</p>
                </div>
              </div>

              {/* Recent activity */}
              {user.recentActivity && user.recentActivity.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">
                    Recent Activity
                  </p>
                  <div className="space-y-1.5">
                    {user.recentActivity.slice(0, 2).map((a, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-slate-600 flex-shrink-0" />
                        <span className="text-[11px] text-slate-400 truncate">
                          {a.action}{' '}
                          <span className="text-slate-300 font-medium">{a.quest}</span>
                        </span>
                        <span className="text-[10px] text-slate-600 ml-auto flex-shrink-0">
                          {a.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pb-5">
                {!user.isFriend && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onAddFriend}
                    className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-lg shadow-violet-600/25"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Add Friend
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onMessage}
                  className={`${
                    user.isFriend ? 'flex-1' : ''
                  } py-2 px-4 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/10 transition-colors`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Message
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserProfileCard;
