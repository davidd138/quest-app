'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Star,
  Layers,
  TrendingUp,
  Eye,
  ArrowRight,
  MapPin,
  Utensils,
  Landmark,
  Users,
  Ghost,
} from 'lucide-react';

// ---------- Types ----------

type TemplateCategory =
  | 'city_tour'
  | 'mystery'
  | 'food_trail'
  | 'historical'
  | 'team_building';

interface TemplateStage {
  order: number;
  title: string;
  description: string;
  challengeType: 'voice' | 'photo' | 'trivia' | 'exploration';
  estimatedMinutes: number;
}

interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  stages: TemplateStage[];
  estimatedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  uses: number;
  rating: number;
  totalRatings: number;
  featured: boolean;
  createdAt: string;
  author: string;
}

interface TemplateCardProps {
  template: QuestTemplate;
  onUseTemplate: (id: string) => void;
  onPreview: (id: string) => void;
  className?: string;
}

// ---------- Config ----------

const categoryConfig: Record<
  TemplateCategory,
  { label: string; icon: React.ElementType; gradient: string; accent: string; badgeBg: string }
> = {
  city_tour: {
    label: 'City Tour',
    icon: MapPin,
    gradient: 'from-violet-600/40 to-indigo-600/40',
    accent: 'text-violet-400',
    badgeBg: 'bg-violet-500/20',
  },
  mystery: {
    label: 'Mystery',
    icon: Ghost,
    gradient: 'from-slate-500/40 to-zinc-600/40',
    accent: 'text-slate-300',
    badgeBg: 'bg-slate-500/20',
  },
  food_trail: {
    label: 'Food Trail',
    icon: Utensils,
    gradient: 'from-rose-600/40 to-pink-600/40',
    accent: 'text-rose-400',
    badgeBg: 'bg-rose-500/20',
  },
  historical: {
    label: 'Historical',
    icon: Landmark,
    gradient: 'from-amber-600/40 to-orange-600/40',
    accent: 'text-amber-400',
    badgeBg: 'bg-amber-500/20',
  },
  team_building: {
    label: 'Team Building',
    icon: Users,
    gradient: 'from-emerald-600/40 to-teal-600/40',
    accent: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20',
  },
};

const difficultyConfig: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'text-emerald-400' },
  medium: { label: 'Medium', color: 'text-amber-400' },
  hard: { label: 'Hard', color: 'text-rose-400' },
  legendary: { label: 'Legendary', color: 'text-fuchsia-400' },
};

// ---------- Rating Stars ----------

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < Math.round(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-600'
          }`}
        />
      ))}
    </div>
  );
}

// ---------- Component ----------

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onUseTemplate,
  onPreview,
  className = '',
}) => {
  const cat = categoryConfig[template.category];
  const diff = difficultyConfig[template.difficulty];
  const CategoryIcon = cat.icon;

  const hours = Math.floor(template.estimatedDuration / 60);
  const mins = template.estimatedDuration % 60;
  const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={[
        'group relative rounded-2xl overflow-hidden',
        'bg-white/5 backdrop-blur-xl border border-white/10',
        'hover:border-white/20 hover:shadow-xl hover:shadow-violet-500/10',
        'transition-shadow duration-300',
        className,
      ].join(' ')}
    >
      {/* Category gradient accent bar */}
      <div className={`h-1.5 bg-gradient-to-r ${cat.gradient}`} />

      {/* Content */}
      <div className="p-5">
        {/* Top row: category badge + difficulty */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-md ${cat.badgeBg} ${cat.accent}`}
          >
            <CategoryIcon className="w-3 h-3" />
            {cat.label}
          </span>
          <span className={`text-[10px] font-semibold ${diff.color}`}>
            {diff.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-violet-300 transition-colors line-clamp-1">
          {template.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {template.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Layers size={12} />
            {template.stages.length} stages
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {timeLabel}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp size={12} />
            {template.uses.toLocaleString()}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-5">
          <RatingStars rating={template.rating} />
          <span className="text-[10px] text-slate-500">
            ({template.totalRatings})
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(template.id);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
          >
            <Eye size={13} />
            Preview
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUseTemplate(template.id);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-600/25"
          >
            Use Template
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TemplateCard;
