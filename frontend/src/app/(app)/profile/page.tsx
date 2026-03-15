'use client';

import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Zap,
  Target,
  Shield,
  LogOut,
  Settings,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() || '?';

  const isAdmin = user.role === 'admin' || (user.groups && user.groups.includes('admins'));

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Profile Header */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-2xl p-8 text-center relative overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-emerald-600/5" />

        <div className="relative">
          {/* Avatar */}
          <div className="mx-auto mb-5">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || 'Avatar'}
                className="w-24 h-24 rounded-2xl object-cover mx-auto border-2 border-violet-500/30 shadow-xl shadow-violet-500/10"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center mx-auto shadow-xl shadow-violet-500/20">
                <span className="text-3xl font-bold text-white">{initials}</span>
              </div>
            )}
          </div>

          <h1 className="font-heading text-2xl font-bold text-white">{user.name || 'User'}</h1>
          <p className="text-slate-400 flex items-center justify-center gap-2 mt-1">
            <Mail className="w-4 h-4" />
            {user.email}
          </p>

          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-xs px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-400 font-medium border border-violet-500/20 capitalize">
              {user.role}
            </span>
            <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/20 capitalize">
              {user.status}
            </span>
            {isAdmin && (
              <span className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 font-medium border border-amber-500/20 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 text-center border border-violet-500/20">
          <Zap className="w-6 h-6 text-violet-400 mx-auto mb-2" />
          <p className="text-2xl font-heading font-bold text-white">
            {user.totalPoints.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Total Points</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center border border-emerald-500/20">
          <Target className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-heading font-bold text-white">{user.questsCompleted}</p>
          <p className="text-xs text-slate-400 mt-0.5">Quests Completed</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center border border-amber-500/20">
          <Calendar className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-lg font-heading font-bold text-white">{memberSince}</p>
          <p className="text-xs text-slate-400 mt-0.5">Member Since</p>
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div variants={itemVariants}>
        <h2 className="font-heading text-xl font-bold text-white mb-4">Settings</h2>
        <div className="glass rounded-2xl overflow-hidden divide-y divide-slate-700/30">
          <button className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-white/[0.02] transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-slate-400 group-hover:text-violet-400 transition-colors" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-200">Edit Profile</p>
              <p className="text-xs text-slate-500">Update your name and avatar</p>
            </div>
          </button>

          <button className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-white/[0.02] transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center">
              <Bell className="w-5 h-5 text-slate-400 group-hover:text-violet-400 transition-colors" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-200">Notifications</p>
              <p className="text-xs text-slate-500">Manage notification preferences</p>
            </div>
          </button>

          <button className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-white/[0.02] transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center">
              <Settings className="w-5 h-5 text-slate-400 group-hover:text-violet-400 transition-colors" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-200">Preferences</p>
              <p className="text-xs text-slate-500">Theme, language, and display</p>
            </div>
          </button>

          <button
            onClick={signOut}
            className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-rose-500/5 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-rose-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-rose-400">Sign Out</p>
              <p className="text-xs text-slate-500">Log out of your account</p>
            </div>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
