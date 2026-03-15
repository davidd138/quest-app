'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, Crown, ChevronRight, Star } from 'lucide-react';
import ClanBadge from './ClanBadge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Clan {
  id: string;
  name: string;
  description: string;
  color: string;
  memberCount: number;
  totalPoints: number;
  rank: number;
  isOpen: boolean;
  leader: string;
  recentActivity?: string;
}

interface ClanCardProps {
  clan: Clan;
  featured?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ClanCard: React.FC<ClanCardProps> = ({ clan, featured = false, className = '' }) => {
  const isTop3 = clan.rank <= 3;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={[
        'group relative rounded-2xl overflow-hidden cursor-pointer',
        'backdrop-blur-xl border',
        featured
          ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-white/[0.02] to-transparent'
          : 'border-white/10 bg-white/5',
        'hover:border-white/20 hover:shadow-xl transition-shadow duration-300',
        className,
      ].join(' ')}
      style={{
        boxShadow: isTop3 ? `0 4px 20px ${clan.color}15` : undefined,
      }}
    >
      {/* Glass morphism clan color accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-60"
        style={{ backgroundColor: clan.color }}
      />
      <div
        className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 30% 20%, ${clan.color}, transparent 60%)` }}
      />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <ClanBadge name={clan.name} color={clan.color} size="md" glowing={isTop3} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                {clan.name}
              </h3>
              {isTop3 && <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rank #{clan.rank} &middot; Led by {clan.leader}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 flex-shrink-0 mt-1 transition-colors" />
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {clan.description}
        </p>

        {/* Member avatars stack */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(clan.memberCount, 5) }).map((_, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-navy-900 flex items-center justify-center text-[9px] font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${clan.color}40, ${clan.color}20)`,
                }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            {clan.memberCount > 5 && (
              <div className="w-7 h-7 rounded-full bg-white/10 border-2 border-navy-900 flex items-center justify-center text-[9px] font-bold text-slate-400">
                +{clan.memberCount - 5}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Users className="w-3 h-3" />
            {clan.memberCount}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            {(clan.totalPoints / 1000).toFixed(1)}k pts
          </span>

          {/* Recent activity */}
          {clan.recentActivity && (
            <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
              {clan.recentActivity}
            </span>
          )}
        </div>

        {/* Join button */}
        {clan.isOpen && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-4 py-2 rounded-lg bg-violet-600/20 text-violet-300 text-xs font-medium hover:bg-violet-600/30 transition-colors"
          >
            Join Clan
          </motion.button>
        )}
        {!clan.isOpen && (
          <div className="w-full mt-4 py-2 rounded-lg bg-white/5 text-slate-500 text-xs font-medium text-center">
            Invite Only
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClanCard;
