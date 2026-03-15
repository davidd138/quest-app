'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';

export default function ResetCompletePage() {
  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-8 md:p-10 shadow-2xl border border-slate-700/50 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />

        <div className="mb-8">
          <Logo size="md" />
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
          className="w-24 h-24 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        </motion.div>

        <h2 className="font-heading text-2xl font-bold text-white mb-2">
          Password Reset Complete
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Your password has been successfully reset. You can now sign in with your new credentials.
        </p>

        <div className="glass rounded-xl p-4 border border-emerald-500/20 mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-slate-400 text-left">
              For security, all other active sessions have been signed out. Please sign in again on your other devices.
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold transition-all shadow-lg shadow-violet-600/25"
        >
          Sign In
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
