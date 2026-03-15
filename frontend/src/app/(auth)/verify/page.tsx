'use client';

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" /></div>}>
      <VerifyPageContent />
    </Suspense>
  );
}

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = useCallback(
    (index: number, value: string) => {
      // Handle paste
      if (value.length > 1) {
        const pasted = value.replace(/\D/g, '').slice(0, CODE_LENGTH);
        const newDigits = [...digits];
        for (let i = 0; i < pasted.length && index + i < CODE_LENGTH; i++) {
          newDigits[index + i] = pasted[i];
        }
        setDigits(newDigits);
        const nextIndex = Math.min(index + pasted.length, CODE_LENGTH - 1);
        inputRefs.current[nextIndex]?.focus();
        return;
      }

      // Single character
      const digit = value.replace(/\D/g, '');
      const newDigits = [...digits];
      newDigits[index] = digit;
      setDigits(newDigits);

      // Auto-advance
      if (digit && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [digits],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
      }
    },
    [digits],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
      if (!pasted) return;
      const newDigits = [...digits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setDigits(newDigits);
      const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
    },
    [digits],
  );

  const code = digits.join('');
  const isComplete = code.length === CODE_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;
    setError('');
    setSubmitting(true);

    try {
      // Simulate verification
      await new Promise((r) => setTimeout(r, 1200));
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch {
      setError('Invalid verification code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(RESEND_COOLDOWN);
    setError('');
    // Simulate resend
    await new Promise((r) => setTimeout(r, 800));
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl p-8 md:p-10 shadow-2xl border border-slate-700/50 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
            className="w-24 h-24 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6"
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </motion.div>
          </motion.div>

          <h2 className="font-heading text-2xl font-bold text-white mb-2">
            Email Verified!
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Your account has been successfully verified. Redirecting to login...
          </p>

          {/* Animated dots */}
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-emerald-500"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-8 md:p-10 shadow-2xl border border-slate-700/50 relative overflow-hidden"
      >
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-500" />

        {/* Logo */}
        <div className="mb-8">
          <Logo size="md" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/15 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-violet-400" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-white mb-2">
            Verify your email
          </h2>
          <p className="text-slate-400 text-sm">
            {email
              ? <>We sent a 6-digit code to <span className="text-slate-300 font-medium">{email}</span></>
              : 'Enter the 6-digit code sent to your email'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Code inputs */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <input
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl border transition-all duration-200 focus:outline-none ${
                    digit
                      ? 'bg-violet-500/10 border-violet-500/40 text-white focus:ring-2 focus:ring-violet-500/30'
                      : 'bg-navy-800/50 border-slate-700/50 text-slate-200 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20'
                  }`}
                  autoFocus={i === 0}
                />
              </motion.div>
            ))}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={submitting || !isComplete}
            whileHover={!submitting && isComplete ? { scale: 1.02 } : undefined}
            whileTap={!submitting && isComplete ? { scale: 0.98 } : undefined}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Verify Email'
            )}
          </motion.button>
        </form>

        {/* Resend code */}
        <div className="mt-6 text-center">
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${resendCooldown > 0 ? '' : 'hover:rotate-180 transition-transform duration-300'}`} />
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : 'Resend code'}
          </button>
        </div>

        {/* Back to login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
