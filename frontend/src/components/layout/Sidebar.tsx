'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Compass,
  History,
  Trophy,
  Medal,
  BarChart3,
  Settings,
  PieChart,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Map,
  UsersRound,
  PlusCircle,
  Globe,
  MessageCircle,
  HelpCircle,
  TrendingUp,
  Swords,
  Volume2,
  CalendarCheck,
  CalendarDays,
  Bookmark,
  Flame,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from './Logo';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Daily', href: '/daily', icon: CalendarCheck },
  { label: 'Quests', href: '/quests', icon: Compass },
  { label: 'Trending', href: '/quests/trending', icon: Flame },
  { label: 'Schedule', href: '/schedule', icon: CalendarDays },
  { label: 'Saved', href: '/saved', icon: Bookmark },
  { label: 'Discover', href: '/discover', icon: Map },
  { label: 'Crear', href: '/create', icon: PlusCircle },
  { label: 'Comunidad', href: '/community', icon: Globe },
  { label: 'Multiplayer', href: '/multiplayer', icon: Swords },
  { label: 'Voice Rooms', href: '/voice-rooms', icon: Volume2 },
  { label: 'Social', href: '/social', icon: UsersRound },
  { label: 'Messages', href: '/messages', icon: MessageCircle },
  { label: 'History', href: '/history', icon: History },
  { label: 'Achievements', href: '/achievements', icon: Trophy },
  { label: 'Leaderboard', href: '/leaderboard', icon: Medal },
  { label: 'Stats', href: '/stats', icon: TrendingUp },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const adminNav: NavItem[] = [
  { label: 'Manage Quests', href: '/admin/quests', icon: Settings, adminOnly: true },
  { label: 'Team Analytics', href: '/admin/analytics', icon: PieChart, adminOnly: true },
  { label: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
];

const bottomNav: NavItem[] = [
  { label: 'Help', href: '/help', icon: HelpCircle },
  { label: 'Ajustes', href: '/settings', icon: Settings },
  { label: 'Profile', href: '/profile', icon: User },
];

function NavLink({
  item,
  collapsed,
  isActive,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      {...(item.href === '/quests' ? { 'data-tour': 'quests-link' } : {})}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
        ${isActive
          ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
        }
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {collapsed && (
        <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-navy-800 text-white text-sm font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 shadow-xl border border-slate-700/50">
          {item.label}
        </div>
      )}
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const isAdmin =
    user?.role === 'admin' || (user?.groups && user.groups.includes('admins'));

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div data-tour="logo" className={`px-4 py-6 ${collapsed ? 'flex justify-center' : ''}`}>
        <Logo size={collapsed ? 'sm' : 'md'} linkTo="/dashboard" />
      </div>

      {/* Main Nav */}
      <nav data-tour="sidebar-nav" className="flex-1 px-3 space-y-1">
        {mainNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
          />
        ))}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="my-4 border-t border-slate-700/50" />
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Admin
              </p>
            )}
            {adminNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                collapsed={collapsed}
                isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
              />
            ))}
          </>
        )}

        <div className="my-4 border-t border-slate-700/50" />

        {bottomNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-4 hidden lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass text-slate-300 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-[280px] bg-navy-900/95 backdrop-blur-xl border-r border-slate-700/50 lg:hidden"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <div onClick={() => setMobileOpen(false)}>
              {sidebarContent}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="hidden lg:block fixed inset-y-0 left-0 z-30 bg-navy-900/80 backdrop-blur-xl border-r border-slate-700/50"
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
