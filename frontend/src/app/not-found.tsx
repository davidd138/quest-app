'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
      <div className="glass rounded-3xl border border-violet-500/20 p-10 md:p-14 max-w-lg w-full text-center shadow-2xl shadow-violet-500/5">
        {/* Animated spinning compass */}
        <motion.div
          className="mx-auto mb-8 w-24 h-24 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center"
          aria-hidden="true"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-violet-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <circle cx="12" cy="12" r="10" />
            <polygon
              points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
              fill="currentColor"
              opacity="0.3"
            />
          </motion.svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-3xl md:text-4xl font-bold text-white mb-3"
        >
          Lost in the quest?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 text-lg mb-2"
        >
          The page you&apos;re looking for doesn&apos;t exist.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-slate-500 text-sm mb-8"
        >
          It may have been moved, or perhaps the URL is incorrect.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-medium text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Link
            href="/quests"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse Quests
          </Link>
        </motion.div>

        {/* Search suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-10 pt-6 border-t border-white/5"
        >
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
            Popular destinations
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Quests', 'Leaderboard', 'Achievements', 'Discover'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-xs px-3 py-1.5 rounded-lg bg-navy-800/50 text-slate-400 hover:text-violet-300 hover:bg-navy-800 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
