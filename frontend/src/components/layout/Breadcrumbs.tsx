'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Human-readable labels for known path segments.
 * Dynamic segments (e.g. quest IDs) are handled via the `dynamicLabels` prop.
 */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  quests: 'Quests',
  discover: 'Discover',
  leaderboard: 'Leaderboard',
  achievements: 'Achievements',
  profile: 'Profile',
  settings: 'Settings',
  history: 'History',
  social: 'Social',
  notifications: 'Notifications',
  analytics: 'Analytics',
  admin: 'Admin',
  users: 'Users',
  new: 'New',
  edit: 'Edit',
  'quest-play': 'Play',
  'voice-chat': 'Voice Chat',
  stage: 'Stage',
  data: 'My Data',
};

interface BreadcrumbsProps {
  /** Override labels for dynamic path segments, e.g. { 'abc-123': 'Dragon Valley Quest' } */
  dynamicLabels?: Record<string, string>;
  /** Additional CSS classes on the nav element */
  className?: string;
}

export default function Breadcrumbs({ dynamicLabels = {}, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Filter out route-group segments (wrapped in parentheses) and empty strings
  const segments = pathname
    .split('/')
    .filter((seg) => seg && !seg.startsWith('('));

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label =
      dynamicLabels[segment] ||
      SEGMENT_LABELS[segment] ||
      decodeURIComponent(segment).replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const isLast = index === segments.length - 1;

    return { href, label, isLast, segment };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-sm text-slate-400 overflow-x-auto scrollbar-hide ${className}`}
    >
      <ol className="flex items-center gap-1 min-w-0" role="list">
        {/* Home link */}
        <li className="flex items-center flex-shrink-0">
          <Link
            href="/dashboard"
            className="hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>

        {crumbs.map(({ href, label, isLast }) => (
          <li key={href} className="flex items-center min-w-0">
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mx-1" aria-hidden="true" />
            {isLast ? (
              <span
                className="text-slate-200 font-medium truncate max-w-[160px] md:max-w-[240px]"
                aria-current="page"
              >
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-white transition-colors truncate max-w-[120px] md:max-w-[200px]"
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
