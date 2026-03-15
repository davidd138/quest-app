'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronDown,
  MessageSquare,
  Star,
  ThumbsUp,
  PenLine,
} from 'lucide-react';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_QUEST } from '@/lib/graphql/queries';
import type { Quest } from '@/types';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ---------------------------------------------------------------------------
// Mock reviews data
// ---------------------------------------------------------------------------

interface Review {
  id: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  rating: number;
  text: string;
  date: string;
  helpfulVotes: number;
  hasVoted: boolean;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    userId: 'u1',
    userName: 'Elena Martinez',
    rating: 5,
    text: 'Absolutely amazing quest! The characters felt so real and immersive. The storyline kept me engaged from start to finish. I loved how each stage built upon the previous one, creating a truly cohesive adventure. Highly recommend!',
    date: '2026-03-14T10:30:00Z',
    helpfulVotes: 24,
    hasVoted: false,
  },
  {
    id: 'r2',
    userId: 'u2',
    userName: 'Carlos Ruiz',
    rating: 4,
    text: 'Great storyline but stage 3 felt a bit long. The character interactions were fantastic though, especially the guide in the second stage. Would love to see a sequel to this quest!',
    date: '2026-03-14T05:15:00Z',
    helpfulVotes: 18,
    hasVoted: true,
  },
  {
    id: 'r3',
    userId: 'u3',
    userName: 'Lucia Perez',
    rating: 5,
    text: 'Best quest I have played so far on the platform. The location was perfect and the challenges were well-balanced. The AI characters responded naturally to my questions.',
    date: '2026-03-13T14:00:00Z',
    helpfulVotes: 31,
    hasVoted: false,
  },
  {
    id: 'r4',
    userId: 'u4',
    userName: 'Pablo Villanueva',
    rating: 3,
    text: 'Good concept but some hints were confusing. I got stuck on the riddle in stage 2 for way too long. The final stage made up for it though.',
    date: '2026-03-12T09:45:00Z',
    helpfulVotes: 7,
    hasVoted: false,
  },
  {
    id: 'r5',
    userId: 'u5',
    userName: 'Ana Garcia',
    rating: 5,
    text: 'Wonderful experience from beginning to end. The voice conversations with the characters were incredibly natural. This is what interactive storytelling should be!',
    date: '2026-03-11T18:20:00Z',
    helpfulVotes: 42,
    hasVoted: false,
  },
  {
    id: 'r6',
    userId: 'u6',
    userName: 'Miguel Torres',
    rating: 4,
    text: 'Very enjoyable quest. The locations were beautiful and well-chosen. Only minor complaint is that the walking distance between some stages was a bit far.',
    date: '2026-03-10T12:00:00Z',
    helpfulVotes: 15,
    hasVoted: false,
  },
  {
    id: 'r7',
    userId: 'u7',
    userName: 'Sofia Hernandez',
    rating: 2,
    text: 'The concept is interesting but I encountered a few bugs during my playthrough. One of the stages did not register my completion properly and I had to redo it.',
    date: '2026-03-09T16:30:00Z',
    helpfulVotes: 9,
    hasVoted: false,
  },
  {
    id: 'r8',
    userId: 'u8',
    userName: 'Javier Moreno',
    rating: 5,
    text: 'Incredible attention to detail. Every character has a unique personality and the challenges are creative and fun. One of the best experiences I have had exploring the city.',
    date: '2026-03-08T20:15:00Z',
    helpfulVotes: 36,
    hasVoted: false,
  },
];

type SortOption = 'newest' | 'highest' | 'lowest';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ReviewCard({
  review,
  onVote,
}: {
  review: Review;
  onVote: (id: string) => void;
}) {
  const dateStr = new Date(review.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.div
      variants={itemVariants}
      className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-emerald-500/30 flex items-center justify-center shrink-0">
          {review.avatarUrl ? (
            <img
              src={review.avatarUrl}
              alt={review.userName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-white">
              {review.userName.charAt(0)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-white">
              {review.userName}
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s < review.rating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500">{dateStr}</span>
          </div>

          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {review.text}
          </p>

          {/* Helpful vote */}
          <div className="mt-3">
            <button
              onClick={() => onVote(review.id)}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
                review.hasVoted
                  ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                  : 'bg-white/5 text-slate-400 border border-white/5 hover:border-white/10 hover:text-slate-300'
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              Helpful ({review.helpfulVotes})
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function QuestReviewsPage() {
  const params = useParams();
  const questId = params.id as string;

  const {
    data: quest,
    loading,
    execute: fetchQuest,
  } = useQuery<Quest>(GET_QUEST);

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);

  useEffect(() => {
    if (questId) fetchQuest({ id: questId });
  }, [questId, fetchQuest]);

  // Sort reviews
  const sortedReviews = useMemo(() => {
    const copy = [...reviews];
    switch (sortBy) {
      case 'newest':
        return copy.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      case 'highest':
        return copy.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return copy.sort((a, b) => a.rating - b.rating);
      default:
        return copy;
    }
  }, [reviews, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const total = reviews.length;
    const avg =
      total > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / total
        : 0;
    const distribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((r) => r.rating === stars).length,
    }));
    return { total, avg: Math.round(avg * 10) / 10, distribution };
  }, [reviews]);

  const handleVote = useCallback((reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              hasVoted: !r.hasVoted,
              helpfulVotes: r.hasVoted
                ? r.helpfulVotes - 1
                : r.helpfulVotes + 1,
            }
          : r,
      ),
    );
  }, []);

  if (loading || !quest) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 rounded-lg animate-shimmer bg-navy-800" />
        <div className="h-32 rounded-2xl animate-shimmer bg-navy-800" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl animate-shimmer bg-navy-800" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <Link
          href={`/quests/${questId}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quest
        </Link>
        <h1 className="font-heading text-3xl font-bold text-white">Reviews</h1>
        <p className="text-slate-400 mt-1">{quest.title}</p>
      </motion.div>

      {/* Stats summary */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6"
      >
        <div className="text-center md:border-r md:border-white/10 md:pr-6">
          <p className="text-5xl font-heading font-bold text-white">
            {stats.avg.toFixed(1)}
          </p>
          <div className="flex items-center gap-0.5 mt-2 justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(stats.avg)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-600'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {stats.total} review{stats.total !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex-1 space-y-1.5 w-full">
          {stats.distribution.map((d) => {
            const pct =
              stats.total > 0 ? Math.round((d.count / stats.total) * 100) : 0;
            return (
              <div key={d.stars} className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-4 text-right">
                  {d.stars}
                </span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <div className="flex-1 h-3 bg-white/[0.03] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="h-full rounded-full bg-amber-400/80"
                  />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50 transition-colors cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        {/* Write review button */}
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shadow-lg shadow-violet-600/20">
          <PenLine className="w-4 h-4" />
          Write a Review
        </button>
      </motion.div>

      {/* Review list */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="text-center py-12"
          >
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No reviews yet. Be the first!</p>
          </motion.div>
        ) : (
          sortedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} onVote={handleVote} />
          ))
        )}
      </div>

      {/* Spacer */}
      <div className="h-8" />
    </motion.div>
  );
}
