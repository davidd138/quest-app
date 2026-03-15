'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, UserMinus, Check, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface FriendRequest {
  id: string;
  name: string;
  level: number;
  mutualFriends: number;
  sentAt: string;
}

const mockRequests: FriendRequest[] = [
  { id: 'r1', name: 'Isabella Torres', level: 34, mutualFriends: 3, sentAt: '2026-03-15T08:00:00Z' },
  { id: 'r2', name: 'Noah Kim', level: 22, mutualFriends: 1, sentAt: '2026-03-14T16:30:00Z' },
  { id: 'r3', name: 'Zara Ahmed', level: 45, mutualFriends: 5, sentAt: '2026-03-13T10:15:00Z' },
];

export default function FriendRequestsPage() {
  const [requests, setRequests] = useState(mockRequests);

  const handleAccept = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDecline = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <Link href="/friends" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Friends
        </Link>
        <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3 mt-2">
          <UserPlus className="w-8 h-8 text-violet-400" />
          Friend Requests
        </h1>
        <p className="text-slate-400 mt-1">{requests.length} pending request{requests.length !== 1 ? 's' : ''}</p>
      </motion.div>

      <AnimatePresence>
        {requests.map((request) => (
          <motion.div
            key={request.id}
            layout
            variants={itemVariants}
            exit={{ opacity: 0, x: -100, height: 0 }}
            className="glass rounded-xl p-5 flex items-center gap-4 border border-white/5"
          >
            <Avatar name={request.name} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white">{request.name}</p>
              <p className="text-xs text-slate-500">Level {request.level} &middot; {request.mutualFriends} mutual friends</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAccept(request.id)}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Accept
              </button>
              <button
                onClick={() => handleDecline(request.id)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                Decline
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {requests.length === 0 && (
        <motion.div variants={itemVariants} className="glass rounded-2xl p-12 text-center border border-slate-700/30">
          <UserMinus className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-semibold text-white mb-2">No pending requests</h3>
          <p className="text-slate-400 text-sm">All friend requests have been handled.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
