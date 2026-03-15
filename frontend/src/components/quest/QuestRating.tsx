'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Loader2 } from 'lucide-react';
import { useMutation, useQuery } from '@/hooks/useGraphQL';
import { RATE_QUEST } from '@/lib/graphql/mutations';
import { GET_QUEST_RATINGS } from '@/lib/graphql/queries';

interface QuestRatingStats {
  averageRating: number;
  totalRatings: number;
  distribution: number[];
}

interface QuestRatingProps {
  questId: string;
  compact?: boolean;
  className?: string;
}

function StarButton({
  index,
  rating,
  hoverRating,
  onHover,
  onClick,
  disabled,
}: {
  index: number;
  rating: number;
  hoverRating: number;
  onHover: (index: number) => void;
  onClick: (index: number) => void;
  disabled: boolean;
}) {
  const isActive = index <= (hoverRating || rating);
  const isHovered = hoverRating > 0 && index <= hoverRating;

  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(0)}
      onClick={() => onClick(index)}
      className="relative p-0.5 focus:outline-none disabled:cursor-not-allowed"
      aria-label={`${index} star${index > 1 ? 's' : ''}`}
    >
      <Star
        size={28}
        className={`transition-all duration-200 ${
          isActive
            ? 'text-amber-400 fill-amber-400'
            : 'text-slate-600 fill-transparent'
        } ${isHovered ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : ''}`}
      />
      {isActive && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 rounded-full bg-amber-400/10 blur-sm -z-10"
        />
      )}
    </motion.button>
  );
}

function RatingDistribution({ stats }: { stats: QuestRatingStats }) {
  const maxCount = Math.max(...(stats.distribution || [1]), 1);

  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = stats.distribution?.[star - 1] ?? 0;
        const percentage = (count / maxCount) * 100;

        return (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 w-3 text-right">{star}</span>
            <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.6, delay: (5 - star) * 0.1 }}
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
              />
            </div>
            <span className="text-slate-500 w-6 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export function QuestRating({ questId, compact = false, className = '' }: QuestRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const { data: stats, execute: fetchRatings } = useQuery<QuestRatingStats>(GET_QUEST_RATINGS);
  const { loading: submitting, execute: submitRating } = useMutation(RATE_QUEST);

  // Fetch ratings on mount
  React.useEffect(() => {
    fetchRatings({ questId });
  }, [fetchRatings, questId]);

  const handleStarClick = useCallback((star: number) => {
    setRating(star);
    setShowReview(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (rating === 0) return;
    try {
      await submitRating({
        questId,
        rating,
        review: review.trim() || undefined,
      });
      setSubmitted(true);
      setShowReview(false);
      // Refresh stats
      await fetchRatings({ questId });
    } catch (e) {
      console.error('Failed to submit rating:', e);
    }
  }, [rating, review, questId, submitRating, fetchRatings]);

  // Compact display: just show average + star count
  if (compact && stats) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <Star size={14} className="text-amber-400 fill-amber-400" />
        <span className="text-sm font-medium text-white">
          {stats.averageRating.toFixed(1)}
        </span>
        <span className="text-xs text-slate-500">({stats.totalRatings})</span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        {/* Header with average */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Valoracion</h4>
            {stats && stats.totalRatings > 0 ? (
              <div className="flex items-center gap-2">
                <span className="font-heading text-3xl font-bold text-white">
                  {stats.averageRating.toFixed(1)}
                </span>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i <= Math.round(stats.averageRating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {stats.totalRatings} valoracion{stats.totalRatings !== 1 ? 'es' : ''}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Sin valoraciones aun</p>
            )}
          </div>
        </div>

        {/* Distribution bars */}
        {stats && stats.totalRatings > 0 && (
          <div className="mb-5">
            <RatingDistribution stats={stats} />
          </div>
        )}

        {/* Rating input */}
        {!submitted ? (
          <div>
            <p className="text-xs text-slate-400 mb-2">Tu valoracion</p>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarButton
                  key={i}
                  index={i}
                  rating={rating}
                  hoverRating={hoverRating}
                  onHover={setHoverRating}
                  onClick={handleStarClick}
                  disabled={submitting}
                />
              ))}
            </div>

            {/* Review textarea */}
            <AnimatePresence>
              {showReview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Escribe una resena (opcional)..."
                    maxLength={500}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/25 transition-all resize-none mb-3"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {review.length}/500
                    </span>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || rating === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                      Enviar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-3"
          >
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i <= rating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-600'
                  }
                />
              ))}
            </div>
            <p className="text-sm text-emerald-400 font-medium">Gracias por tu valoracion</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
