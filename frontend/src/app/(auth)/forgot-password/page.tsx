'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';

type Step = 'email' | 'code' | 'password' | 'success';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 1200));
      setStep('code');
    } catch {
      setError('Failed to send reset code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setStep('password');
    } catch {
      setError('Invalid code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setStep('success');
    } catch {
      setError('Failed to reset password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepContent: Record<Step, { title: string; subtitle: string }> = {
    email: { title: 'Forgot password?', subtitle: 'Enter your email and we will send you a reset code.' },
    code: { title: 'Check your email', subtitle: `We sent a 6-digit code to ${email}` },
    password: { title: 'New password', subtitle: 'Choose a strong password for your account.' },
    success: { title: 'Password reset!', subtitle: 'Your password has been successfully changed.' },
  };

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

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {(['email', 'code', 'password'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  step === s
                    ? 'w-6 bg-violet-500'
                    : step === 'success' || (['code', 'password'].indexOf(step) > i - 1 && i < ['email', 'code', 'password'].indexOf(step))
                    ? 'bg-emerald-500'
                    : 'bg-slate-700'
                }`}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-heading text-2xl font-bold text-white mb-2">
              {stepContent[step].title}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {stepContent[step].subtitle}
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Step: Email */}
            {step === 'email' && (
              <form onSubmit={handleSendCode} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-navy-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={!submitting ? { scale: 1.02 } : undefined}
                  whileTap={!submitting ? { scale: 0.98 } : undefined}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Reset Code
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </motion.button>
              </form>
            )}

            {/* Step: Code */}
            {step === 'code' && (
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Verification Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-navy-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 font-mono text-lg tracking-widest text-center"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting || code.length !== 6}
                  whileHover={!submitting ? { scale: 1.02 } : undefined}
                  whileTap={!submitting ? { scale: 0.98 } : undefined}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Verify Code
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full text-sm text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Didn&apos;t receive a code? Go back
                </button>
              </form>
            )}

            {/* Step: New Password */}
            {step === 'password' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      className="w-full pl-11 pr-12 py-3 rounded-xl bg-navy-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-navy-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={!submitting ? { scale: 1.02 } : undefined}
                  whileTap={!submitting ? { scale: 0.98 } : undefined}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Reset Password
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </motion.button>
              </form>
            )}

            {/* Step: Success */}
            {step === 'success' && (
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </motion.div>

                <p className="text-slate-300 text-sm">
                  You can now sign in with your new password.
                </p>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold transition-all duration-200 shadow-lg shadow-violet-600/25"
                >
                  Back to Login
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Back to login link */}
        {step !== 'success' && (
          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
