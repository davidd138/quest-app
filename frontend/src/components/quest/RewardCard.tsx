'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  CheckCircle2,
  Coins,
  Timer,
  Crown,
  Palette,
  Shield,
  Lightbulb,
  Award,
  Sparkles,
} from 'lucide-react';

// ---------- Types ----------

type RewardCategory = 'avatars' | 'themes' | 'titles' | 'badges' | 'hints';
type RewardRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface Reward {
  id: string;
  name: string;
  description: string;
  category: RewardCategory;
  rarity: RewardRarity;
  cost: number;
  icon: string;
  owned: boolean;
  seasonal?: boolean;
  seasonEndDate?: string;
  previewUrl?: string;
}

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onUnlock?: (rewardId: string) => void;
  className?: string;
}

// ---------- Config ----------

const rarityConfig: Record<
  RewardRarity,
  { border: string; glow: string; bg: string; label: string; textColor: string }
> = {
  common: {
    border: 'border-slate-500/30',
    glow: '',
    bg: 'bg-slate-500/10',
    label: 'Comun',
    textColor: 'text-slate-400',
  },
  rare: {
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/15',
    bg: 'bg-blue-500/10',
    label: 'Raro',
    textColor: 'text-blue-400',
  },
  epic: {
    border: 'border-violet-500/30',
    glow: 'shadow-violet-500/20',
    bg: 'bg-violet-500/10',
    label: 'Epico',
    textColor: 'text-violet-400',
  },
  legendary: {
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/25',
    bg: 'bg-amber-500/10',
    label: 'Legendario',
    textColor: 'text-amber-400',
  },
};

const categoryIcons: Record<RewardCategory, React.ElementType> = {
  avatars: Crown,
  themes: Palette,
  titles: Award,
  badges: Shield,
  hints: Lightbulb,
};

// ---------- Component ----------

const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  userPoints,
  onUnlock,
  className = '',
}) => {
  const [purchasing, setPurchasing] = useState(false);
  const [showCoinAnim, setShowCoinAnim] = useState(false);

  const rarity = rarityConfig[reward.rarity];
  const canAfford = userPoints >= reward.cost;
  const CategoryIcon = categoryIcons[reward.category];

  const handleUnlock = useCallback(() => {
    if (!canAfford || reward.owned || purchasing) return;
    setPurchasing(true);
    setShowCoinAnim(true);

    // Simulate purchase
    setTimeout(() => {
      onUnlock?.(reward.id);
      setPurchasing(false);
      setTimeout(() => setShowCoinAnim(false), 600);
    }, 800);
  }, [canAfford, reward, purchasing, onUnlock]);

  const isLocked = !reward.owned && !canAfford;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={[
        'group relative rounded-2xl overflow-hidden',
        'bg-white/5 backdrop-blur-xl border',
        rarity.border,
        rarity.glow ? `shadow-lg ${rarity.glow}` : '',
        'hover:shadow-xl transition-shadow duration-300',
        isLocked ? 'opacity-70' : '',
        className,
      ].join(' ')}
    >
      {/* Rarity glow top strip */}
      <div className={`h-1 bg-gradient-to-r ${
        reward.rarity === 'common' ? 'from-slate-500 to-slate-400' :
        reward.rarity === 'rare' ? 'from-blue-500 to-cyan-400' :
        reward.rarity === 'epic' ? 'from-violet-500 to-fuchsia-400' :
        'from-amber-500 to-yellow-400'
      }`} />

      <div className="p-4">
        {/* Icon + Category + Rarity */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 rounded-xl ${rarity.bg} flex items-center justify-center relative`}>
            {reward.owned ? (
              <CheckCircle2 size={24} className="text-emerald-400" />
            ) : isLocked ? (
              <Lock size={20} className="text-slate-500" />
            ) : (
              <CategoryIcon size={22} className={rarity.textColor} />
            )}

            {/* Coin animation overlay */}
            <AnimatePresence>
              {showCoinAnim && (
                <motion.div
                  initial={{ scale: 0, y: 0 }}
                  animate={{ scale: [0, 1.5, 0], y: -30, opacity: [0, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute"
                >
                  <Coins size={16} className="text-amber-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className={`text-[9px] uppercase tracking-wider font-bold ${rarity.textColor}`}>
              {rarity.label}
            </span>
            {reward.seasonal && (
              <span className="flex items-center gap-1 text-[9px] text-fuchsia-400 font-medium">
                <Timer size={10} />
                Limitado
              </span>
            )}
          </div>
        </div>

        {/* Name & Description */}
        <h4 className="text-sm font-bold text-white mb-1 line-clamp-1 group-hover:text-violet-300 transition-colors">
          {reward.name}
        </h4>
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {reward.description}
        </p>

        {/* Price / Status */}
        {reward.owned ? (
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 size={14} />
            Desbloqueado
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Coins size={14} className="text-amber-400" />
              <span className={`text-sm font-bold ${canAfford ? 'text-white' : 'text-slate-500'}`}>
                {reward.cost.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleUnlock}
              disabled={!canAfford || purchasing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                canAfford
                  ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
            >
              {purchasing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles size={12} />
                </motion.div>
              ) : (
                <Lock size={12} />
              )}
              {purchasing ? 'Comprando...' : 'Desbloquear'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RewardCard;
