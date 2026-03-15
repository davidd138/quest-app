'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Application error:', error);
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
      <div className="glass rounded-3xl border border-rose-500/20 p-10 md:p-14 max-w-lg w-full text-center shadow-2xl shadow-rose-500/5">
        {/* Animated broken compass */}
        <motion.div
          className="mx-auto mb-8 w-24 h-24 rounded-full bg-rose-600/10 border border-rose-500/20 flex items-center justify-center"
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
            className="text-rose-400"
            animate={{
              rotate: [0, 15, -15, 10, -10, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: 'easeInOut',
            }}
          >
            <circle cx="12" cy="12" r="10" />
            <polygon
              points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
              fill="currentColor"
              opacity="0.3"
            />
            {/* "crack" lines */}
            <line x1="2" y1="2" x2="6" y2="6" strokeOpacity="0.4" />
            <line x1="18" y1="18" x2="22" y2="22" strokeOpacity="0.4" />
          </motion.svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-3xl md:text-4xl font-bold text-white mb-3"
        >
          Something went wrong
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 text-lg mb-2"
        >
          An unexpected error occurred. We&apos;re on it.
        </motion.p>

        {isDev && error.message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 mb-6 text-left bg-rose-500/5 border border-rose-500/15 rounded-xl p-4 overflow-auto max-h-40"
          >
            <p className="text-xs text-rose-400 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-slate-500 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mt-8"
        >
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-medium text-sm shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-shadow cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
