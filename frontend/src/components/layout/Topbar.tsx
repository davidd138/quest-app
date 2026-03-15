'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, ChevronRight, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const breadcrumbMap: Record<string, string> = {
  dashboard: 'Dashboard',
  quests: 'Quests',
  history: 'History',
  achievements: 'Achievements',
  leaderboard: 'Leaderboard',
  analytics: 'Analytics',
  profile: 'Profile',
  admin: 'Admin',
  users: 'Users',
};

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="hidden md:flex items-center gap-1.5 text-sm">
      <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors">
        Home
      </Link>
      {segments.map((seg, i) => {
        const label = breadcrumbMap[seg] || seg;
        const href = '/' + segments.slice(0, i + 1).join('/');
        const isLast = i === segments.length - 1;
        return (
          <span key={seg + i} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            {isLast ? (
              <span className="text-slate-200 font-medium">{label}</span>
            ) : (
              <Link href={href} className="text-slate-500 hover:text-slate-300 transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function Topbar() {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[260px] z-20 h-16">
      <div className="h-full glass border-b border-slate-700/50 flex items-center justify-between px-4 lg:px-6">
        {/* Left: spacer for mobile menu + breadcrumb */}
        <div className="flex items-center gap-4">
          <div className="w-10 lg:hidden" /> {/* Space for mobile menu button */}
          <Breadcrumb />
        </div>

        {/* Center: Search (optional) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search quests..."
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/25 transition-all duration-200"
            />
          </div>
        </div>

        {/* Right: Notifications + Avatar */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
          </button>

          {/* User Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/5 transition-all duration-200"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || 'Avatar'}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-200 leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 leading-tight">
                  {user?.totalPoints?.toLocaleString() || 0} pts
                </p>
              </div>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl glass border border-slate-700/50 shadow-2xl overflow-hidden"
                >
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <div className="border-t border-slate-700/50" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
