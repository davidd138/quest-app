'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RatingEntry {
  stars: number;
  count: number;
}

interface RatingDistributionProps {
  ratings: RatingEntry[];
  averageRating: number;
  totalReviews: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RatingDistribution({
  ratings,
  averageRating,
  totalReviews,
}: RatingDistributionProps) {
  const maxCount = Math.max(...ratings.map((r) => r.count), 1);

  // Sort descending by stars (5 -> 1)
  const sorted = [...ratings].sort((a, b) => b.stars - a.stars);

  return (
    <div>
      {/* Average rating display */}
      <div className="flex items-center gap-4 mb-6">
        <div className="text-center">
          <p className="text-4xl font-heading font-bold text-white">
            {averageRating.toFixed(1)}
          </p>
          <div className="flex items-center gap-0.5 mt-1 justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(averageRating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-600'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {totalReviews.toLocaleString()} reviews
          </p>
        </div>

        {/* Bars */}
        <div className="flex-1 space-y-2">
          {sorted.map((rating, i) => {
            const pct =
              totalReviews > 0
                ? Math.round((rating.count / totalReviews) * 100)
                : 0;
            const barWidth = Math.max((rating.count / maxCount) * 100, 2);

            return (
              <div key={rating.stars} className="flex items-center gap-2">
                {/* Star label */}
                <div className="flex items-center gap-1 w-10 shrink-0 justify-end">
                  <span className="text-xs text-slate-400">{rating.stars}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </div>

                {/* Bar */}
                <div className="flex-1 h-5 bg-white/[0.03] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.06,
                      ease: 'easeOut',
                    }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, rgba(251,191,36,0.7), rgba(245,158,11,0.9))`,
                    }}
                  />
                </div>

                {/* Count and percentage */}
                <div className="w-16 shrink-0 text-right">
                  <span className="text-xs text-slate-400">{rating.count}</span>
                  <span className="text-[10px] text-slate-600 ml-1">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
