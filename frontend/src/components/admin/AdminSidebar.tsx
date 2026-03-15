'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Shield,
  Users,
  Map,
  BarChart3,
  ScrollText,
  Settings,
  Mail,
  Webhook,
  Download,
  Flag,
  ChevronDown,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

// ---------- Types ----------

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// ---------- Config ----------

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin/analytics', icon: LayoutDashboard },
      {
        label: 'Moderation Queue',
        href: '/admin/moderation',
        icon: Shield,
        badge: 7,
      },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Quests', href: '/admin/quests', icon: Map },
      { label: 'Reports', href: '/admin/reports', icon: Flag },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { label: 'Audit Log', href: '/admin/audit', icon: ScrollText },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
      { label: 'Emails', href: '/admin/emails', icon: Mail },
      { label: 'Webhooks', href: '/admin/webhooks', icon: Webhook },
      { label: 'Export', href: '/admin/export', icon: Download },
    ],
  },
];

// ---------- Component ----------

const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <aside className="w-60 flex-shrink-0 h-full overflow-y-auto border-r border-white/10 bg-white/[0.02] backdrop-blur-xl">
      {/* Header */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600/40 to-violet-600/40 flex items-center justify-center">
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Admin Panel</h2>
            <p className="text-[10px] text-slate-500">QuestMaster</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navSections.map((section) => {
          const isCollapsed = collapsedSections.has(section.title);
          return (
            <div key={section.title} className="mb-2">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-2 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold hover:text-slate-400 transition-colors"
              >
                <span>{section.title}</span>
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              {/* Section items */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all mb-0.5 ${
                            active
                              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20'
                              : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                          }`}
                        >
                          {/* Active indicator */}
                          {active && (
                            <motion.div
                              layoutId="admin-sidebar-active"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r bg-purple-400"
                              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            />
                          )}

                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="flex-1">{item.label}</span>

                          {/* Badge */}
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="px-5 py-4 mt-auto border-t border-white/10">
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <AlertCircle className="w-3 h-3" />
          <span>Admin actions are audited</span>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
