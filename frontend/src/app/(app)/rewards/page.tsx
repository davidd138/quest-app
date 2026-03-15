'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  ShoppingBag,
  History,
  Sparkles,
  Tag,
  Timer,
  Crown,
  Palette,
  Shield,
  Lightbulb,
  Award,
} from 'lucide-react';
import RewardCard from '@/components/quest/RewardCard';
import PointsBalance from '@/components/quest/PointsBalance';

// ---------- Types ----------

export type RewardCategory = 'avatars' | 'themes' | 'titles' | 'badges' | 'hints';
export type RewardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Reward {
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

export interface Transaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  date: string;
}

// ---------- Mock Data ----------

const mockRewards: Reward[] = [
  // Avatars
  { id: 'r1', name: 'Dragon Rider', description: 'Un avatar epico con un dragon de fuego', category: 'avatars', rarity: 'epic', cost: 2500, icon: 'dragon', owned: false },
  { id: 'r2', name: 'Shadow Explorer', description: 'Misterioso explorador de las sombras', category: 'avatars', rarity: 'rare', cost: 1200, icon: 'shadow', owned: true },
  { id: 'r3', name: 'Golden Knight', description: 'Caballero dorado legendario', category: 'avatars', rarity: 'legendary', cost: 5000, icon: 'knight', owned: false },
  { id: 'r4', name: 'Forest Sprite', description: 'Espiritu del bosque encantado', category: 'avatars', rarity: 'common', cost: 500, icon: 'sprite', owned: true },

  // Themes
  { id: 'r5', name: 'Neon Cyberpunk', description: 'Tema con luces neon y estilo futurista', category: 'themes', rarity: 'epic', cost: 3000, icon: 'neon', owned: false },
  { id: 'r6', name: 'Midnight Ocean', description: 'Tonos profundos del oceano nocturno', category: 'themes', rarity: 'rare', cost: 1500, icon: 'ocean', owned: false },
  { id: 'r7', name: 'Autumn Leaves', description: 'Colores calidos de otono', category: 'themes', rarity: 'common', cost: 600, icon: 'autumn', owned: true },

  // Titles
  { id: 'r8', name: 'Maestro de Quests', description: 'Titulo exclusivo para expertos', category: 'titles', rarity: 'legendary', cost: 8000, icon: 'master', owned: false },
  { id: 'r9', name: 'Explorador Nocturno', description: 'Titulo para aventureros nocturnos', category: 'titles', rarity: 'rare', cost: 1800, icon: 'night', owned: false },
  { id: 'r10', name: 'Aprendiz', description: 'El comienzo de tu leyenda', category: 'titles', rarity: 'common', cost: 300, icon: 'apprentice', owned: true },

  // Badges
  { id: 'r11', name: 'Estrella de Oro', description: 'Insignia dorada de excelencia', category: 'badges', rarity: 'epic', cost: 2000, icon: 'gold-star', owned: false },
  { id: 'r12', name: 'Escudo de Fuego', description: 'Insignia de poder ardiente', category: 'badges', rarity: 'rare', cost: 1000, icon: 'fire-shield', owned: true },
  { id: 'r13', name: 'Corona Celestial', description: 'La insignia mas rara del juego', category: 'badges', rarity: 'legendary', cost: 10000, icon: 'celestial', owned: false, seasonal: true, seasonEndDate: '2026-04-15T23:59:59Z' },

  // Hints
  { id: 'r14', name: 'Pack 5 Pistas', description: '5 pistas para usar en quests dificiles', category: 'hints', rarity: 'common', cost: 200, icon: 'hint-5', owned: false },
  { id: 'r15', name: 'Pack 15 Pistas', description: '15 pistas con descuento', category: 'hints', rarity: 'rare', cost: 500, icon: 'hint-15', owned: false },
  { id: 'r16', name: 'Pistas Infinitas (24h)', description: 'Pistas ilimitadas durante 24 horas', category: 'hints', rarity: 'epic', cost: 1500, icon: 'hint-unlimited', owned: false, seasonal: true, seasonEndDate: '2026-03-31T23:59:59Z' },
];

const mockTransactions: Transaction[] = [
  { id: 't1', type: 'earn', amount: 500, description: 'Quest: Madrid Tapas Hunt', date: '2026-03-14T18:30:00Z' },
  { id: 't2', type: 'earn', amount: 750, description: 'Quest: Gothic Barcelona', date: '2026-03-13T14:20:00Z' },
  { id: 't3', type: 'spend', amount: 1200, description: 'Avatar: Shadow Explorer', date: '2026-03-12T10:15:00Z' },
  { id: 't4', type: 'earn', amount: 600, description: 'Quest: Basque Pintxos Trail', date: '2026-03-11T16:45:00Z' },
  { id: 't5', type: 'earn', amount: 400, description: 'Quest: Roman Forum Secrets', date: '2026-03-10T11:00:00Z' },
  { id: 't6', type: 'spend', amount: 600, description: 'Tema: Autumn Leaves', date: '2026-03-09T09:30:00Z' },
  { id: 't7', type: 'spend', amount: 300, description: 'Titulo: Aprendiz', date: '2026-03-08T20:00:00Z' },
  { id: 't8', type: 'earn', amount: 350, description: 'Quest: Retiro Park Treasures', date: '2026-03-07T15:10:00Z' },
];

const TABS = [
  { id: 'shop', label: 'Tienda', icon: ShoppingBag },
  { id: 'owned', label: 'Mis Recompensas', icon: Gift },
  { id: 'history', label: 'Historial', icon: History },
] as const;

const CATEGORY_CONFIG: Record<RewardCategory, { label: string; icon: React.ElementType }> = {
  avatars: { label: 'Avatares', icon: Crown },
  themes: { label: 'Temas', icon: Palette },
  titles: { label: 'Titulos', icon: Award },
  badges: { label: 'Insignias', icon: Shield },
  hints: { label: 'Pistas', icon: Lightbulb },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

// ---------- Component ----------

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState<'shop' | 'owned' | 'history'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<RewardCategory | 'all'>('all');
  const [userPoints] = useState(4850);
  const [rewards, setRewards] = useState(mockRewards);

  const recentEarnings = mockTransactions
    .filter((t) => t.type === 'earn')
    .slice(0, 3);

  const filteredRewards = rewards.filter((r) => {
    if (activeTab === 'owned' && !r.owned) return false;
    if (activeTab === 'shop' && r.owned) return false;
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    return true;
  });

  const handleUnlock = useCallback((rewardId: string) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === rewardId ? { ...r, owned: true } : r)),
    );
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-3xl font-bold text-white mb-2"
          >
            Tienda de Recompensas
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-sm"
          >
            Gana puntos completando quests y canjealos por recompensas exclusivas.
          </motion.p>
        </div>

        {/* Points Balance */}
        <PointsBalance points={userPoints} recentEarnings={recentEarnings} />
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Category filters (shop and owned tabs) */}
      {activeTab !== 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2"
        >
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-violet-600 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Tag size={12} />
            Todas
          </button>
          {(Object.entries(CATEGORY_CONFIG) as [RewardCategory, { label: string; icon: React.ElementType }][]).map(
            ([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  selectedCategory === key
                    ? 'bg-violet-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <config.icon size={12} />
                {config.label}
              </button>
            ),
          )}
        </motion.div>
      )}

      {/* Seasonal banner */}
      {activeTab === 'shop' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/20 rounded-2xl p-4 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Recompensas de temporada</p>
            <p className="text-xs text-slate-400">
              Objetos exclusivos por tiempo limitado. No te los pierdas!
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-violet-400">
            <Timer size={14} />
            <span>Tiempo limitado</span>
          </div>
        </motion.div>
      )}

      {/* Rewards Grid */}
      {activeTab !== 'history' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filteredRewards.map((reward) => (
              <motion.div key={reward.id} variants={cardVariants} layout>
                <RewardCard
                  reward={reward}
                  userPoints={userPoints}
                  onUnlock={handleUnlock}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {activeTab !== 'history' && filteredRewards.length === 0 && (
        <div className="text-center py-16">
          <Gift size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">
            {activeTab === 'owned'
              ? 'Aun no tienes recompensas. Visita la tienda para desbloquear.'
              : 'No hay recompensas en esta categoria.'}
          </p>
        </div>
      )}

      {/* Transaction History */}
      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Historial de transacciones
          </h3>
          {mockTransactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.type === 'earn'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-rose-500/15 text-rose-400'
                  }`}
                >
                  {tx.type === 'earn' ? (
                    <Sparkles size={14} />
                  ) : (
                    <ShoppingBag size={14} />
                  )}
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{tx.description}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(tx.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <span
                className={`text-sm font-bold ${
                  tx.type === 'earn' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {tx.type === 'earn' ? '+' : '-'}
                {tx.amount}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
