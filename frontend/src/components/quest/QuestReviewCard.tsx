'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, Flag, User } from 'lucide-react';

interface QuestReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  review: string;
  createdAt: string;
  helpfulCount: number;
  isHelpful?: boolean;
}

interface QuestReviewCardProps {
  review: QuestReview;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  className?: string;
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return 'ahora mismo';
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  if (diffWeeks < 5) return `hace ${diffWeeks}sem`;
  return `hace ${diffMonths}mes${diffMonths !== 1 ? 'es' : ''}`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={
            i <= rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-600 fill-transparent'
          }
        />
      ))}
    </div>
  );
}

export function QuestReviewCard({
  review,
  onHelpful,
  onReport,
  className = '',
}: QuestReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState(review.isHelpful ?? false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [showReportConfirm, setShowReportConfirm] = useState(false);

  const handleHelpful = useCallback(() => {
    if (isHelpful) return;
    setIsHelpful(true);
    setHelpfulCount((prev) => prev + 1);
    onHelpful?.(review.id);
  }, [isHelpful, onHelpful, review.id]);

  const handleReport = useCallback(() => {
    setShowReportConfirm(false);
    onReport?.(review.id);
  }, [onReport, review.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4
        hover:border-white/15 transition-all duration-200
        ${className}
      `}
    >
      {/* Header: avatar, name, rating, date */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {review.userAvatar ? (
            <img
              src={review.userAvatar}
              alt={review.userName}
              className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center">
              <User size={18} className="text-slate-400" />
            </div>
          )}
        </div>

        {/* Name + rating + date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-white truncate">
              {review.userName}
            </h4>
            <span className="text-xs text-slate-500 flex-shrink-0">
              {getRelativeTime(review.createdAt)}
            </span>
          </div>
          <div className="mt-0.5">
            <StarRating rating={review.rating} />
          </div>
        </div>
      </div>

      {/* Review text */}
      {review.review && (
        <p className="text-sm text-slate-300 leading-relaxed mb-3">
          {review.review}
        </p>
      )}

      {/* Actions: helpful + report */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <button
          onClick={handleHelpful}
          disabled={isHelpful}
          className={`
            flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all
            ${
              isHelpful
                ? 'bg-violet-500/15 text-violet-400 cursor-default'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }
          `}
          aria-label={isHelpful ? 'Marcado como util' : 'Marcar como util'}
        >
          <ThumbsUp size={13} className={isHelpful ? 'fill-violet-400' : ''} />
          <span>Util</span>
          {helpfulCount > 0 && (
            <span className="text-slate-500">({helpfulCount})</span>
          )}
        </button>

        <div className="relative">
          {showReportConfirm ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={handleReport}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-all"
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowReportConfirm(false)}
                className="text-xs text-slate-500 hover:text-slate-400 px-2 py-1 rounded-lg hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowReportConfirm(true)}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-500/5 transition-all"
              aria-label="Reportar resena"
            >
              <Flag size={12} />
              <span>Reportar</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
