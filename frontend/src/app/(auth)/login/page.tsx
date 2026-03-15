'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Star,
  Map,
  Trophy,
  Users,
  ChevronLeft,
  ChevronRight,
  Zap,
  Target,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// ---------- Animated 3D Compass SVG ----------

function AnimatedCompass() {
  return (
    <motion.div
      className="relative w-28 h-28"
      animate={{ rotateY: [0, 360] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      style={{ perspective: 600 }}
    >
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_0_30px_rgba(139,92,246,0.4)]">
        {/* Outer ring */}
        <motion.circle
          cx="60" cy="60" r="55"
          fill="none"
          stroke="url(#compassGrad1)"
          strokeWidth="2"
          strokeDasharray="6 4"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '60px 60px' }}
        />
        {/* Inner ring */}
        <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" />
        {/* Cardinal markers */}
        {[0, 90, 180, 270].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 60 + Math.cos(rad - Math.PI / 2) * 42;
          const y1 = 60 + Math.sin(rad - Math.PI / 2) * 42;
          const x2 = 60 + Math.cos(rad - Math.PI / 2) * 48;
          const y2 = 60 + Math.sin(rad - Math.PI / 2) * 48;
          return (
            <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(167,139,250,0.7)" strokeWidth="2" strokeLinecap="round" />
          );
        })}
        {/* Compass needle - North (violet) */}
        <motion.polygon
          points="60,18 54,60 66,60"
          fill="url(#needleNorth)"
          animate={{ rotate: [0, 10, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '60px 60px' }}
        />
        {/* Compass needle - South (emerald) */}
        <motion.polygon
          points="60,102 54,60 66,60"
          fill="url(#needleSouth)"
          animate={{ rotate: [0, 10, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '60px 60px' }}
        />
        {/* Center dot */}
        <circle cx="60" cy="60" r="5" fill="rgba(139,92,246,0.9)" />
        <circle cx="60" cy="60" r="2.5" fill="white" />
        {/* Gradients */}
        <defs>
          <linearGradient id="compassGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="needleNorth" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="needleSouth" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

// ---------- Mouse Particle Trail ----------

function ParticleTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['rgba(139,92,246,', 'rgba(16,185,129,', 'rgba(251,191,36,'];

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      // Spawn particles
      for (let i = 0; i < 2; i++) {
        particles.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      // Cap particles
      if (particles.current.length > 80) {
        particles.current = particles.current.slice(-80);
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) return false;
        const size = p.life * 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.life * 0.6})`;
        ctx.fill();
        return true;
      });
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// ---------- Testimonials Carousel ----------

const testimonials = [
  { name: 'Elena V.', role: 'Explorer Level 42', text: 'QuestMaster turned my weekend walks into unforgettable adventures. The AI characters feel so real!', avatar: 'E' },
  { name: 'Marcus C.', role: 'Explorer Level 38', text: 'I never thought I\'d enjoy history this much. The mystery quests are absolutely addictive.', avatar: 'M' },
  { name: 'Sofia R.', role: 'Explorer Level 55', text: 'Our team building event with QuestMaster was the best we\'ve ever had. Everyone was engaged!', avatar: 'S' },
];

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden h-[140px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-xl p-5 border border-white/10"
        >
          <p className="text-sm text-slate-300 italic leading-relaxed mb-3">
            &ldquo;{testimonials[current].text}&rdquo;
          </p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white">
              {testimonials[current].avatar}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{testimonials[current].name}</p>
              <p className="text-[10px] text-slate-500">{testimonials[current].role}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === current ? 'w-4 bg-violet-500' : 'bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ---------- Animated Stats Counter ----------

function StatCounter({ value, label }: { value: string; label: string }) {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/\D/g, ''));

  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const increment = numericValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [numericValue]);

  const suffix = value.replace(/[\d,]/g, '');

  return (
    <div className="text-center">
      <p className="text-2xl font-heading font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

// ---------- Main Page ----------

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch {
      // error is set via useAuth
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <ParticleTrail />

      <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
        {/* Left: Enhanced Hero Section */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="hidden lg:flex flex-col items-start justify-center px-8 space-y-8"
        >
          {/* Compass + Brand */}
          <div className="flex items-center gap-5">
            <AnimatedCompass />
            <div>
              <h1 className="font-heading text-5xl font-bold text-white leading-tight">
                Quest
                <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
                  Master
                </span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">Your adventure begins here</p>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <h2 className="font-heading text-3xl font-bold text-white leading-tight mb-3">
              Embark on
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent">
                Interactive Adventures
              </span>
            </h2>
            <p className="text-slate-400 leading-relaxed max-w-md">
              Explore immersive quests, converse with AI characters, and unlock achievements in a world of interactive storytelling.
            </p>
          </div>

          {/* How it works: 3 steps */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-4">How it works</p>
            <div className="flex items-center gap-3">
              {[
                { icon: Compass, label: 'Discover', desc: 'Find quests near you', color: 'violet' },
                { icon: Map, label: 'Explore', desc: 'Navigate real locations', color: 'emerald' },
                { icon: Trophy, label: 'Conquer', desc: 'Earn rewards & glory', color: 'amber' },
              ].map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                  className="flex-1"
                >
                  <div className="flex items-center gap-3 mb-0.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        step.color === 'violet'
                          ? 'bg-violet-600/15 text-violet-400'
                          : step.color === 'emerald'
                          ? 'bg-emerald-600/15 text-emerald-400'
                          : 'bg-amber-600/15 text-amber-400'
                      }`}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    {i < 2 && (
                      <ChevronRight className="w-4 h-4 text-slate-700 flex-shrink-0 -mr-2" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white mt-2">{step.label}</p>
                  <p className="text-xs text-slate-500">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-2 gap-3 w-full"
          >
            {[
              { icon: MessageSquare, text: 'AI Voice Characters', color: 'text-violet-400' },
              { icon: Map, text: 'Real-World Maps', color: 'text-emerald-400' },
              { icon: Users, text: 'Multiplayer Quests', color: 'text-cyan-400' },
              { icon: Zap, text: 'Live Leaderboards', color: 'text-amber-400' },
            ].map((feat) => (
              <div key={feat.text} className="flex items-center gap-2 text-xs text-slate-400">
                <feat.icon className={`w-3.5 h-3.5 ${feat.color} flex-shrink-0`} />
                {feat.text}
              </div>
            ))}
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="w-full"
          >
            <TestimonialCarousel />
          </motion.div>

          {/* Animated stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="flex gap-8 pt-2"
          >
            <StatCounter value="10,000+" label="Adventurers" />
            <StatCounter value="500+" label="Quests" />
            <StatCounter value="50+" label="Cities" />
          </motion.div>

          {/* App store badges placeholder */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="flex gap-3"
          >
            {['App Store', 'Google Play'].map(store => (
              <div
                key={store}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded bg-white/10" />
                <div>
                  <p className="text-[9px] text-slate-500 leading-none">Available on</p>
                  <p className="text-xs text-white font-medium leading-tight">{store}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="glass rounded-2xl p-8 md:p-10 shadow-2xl border border-slate-700/50 max-w-md mx-auto relative overflow-hidden">
            {/* Subtle gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-500" />

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-xl font-bold text-white">QuestMaster</span>
            </div>

            <h2 className="font-heading text-2xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400 mb-8">Sign in to continue your adventure</p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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

              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={!submitting ? { scale: 1.02 } : undefined}
                whileTap={!submitting ? { scale: 0.98 } : undefined}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40 flex items-center justify-center gap-2 relative overflow-hidden"
              >
                {/* Sweep animation */}
                <motion.div
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                />
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="relative flex items-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </motion.button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
