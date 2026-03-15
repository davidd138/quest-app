'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConfettiProps {
  /** Whether the confetti burst is active. */
  active: boolean;
  /** Duration in milliseconds before auto-cleanup. @default 3000 */
  duration?: number;
  /** Number of confetti particles. @default 100 */
  particleCount?: number;
  /** Custom colors (CSS color strings). */
  colors?: string[];
  /** Additional class names for the container. */
  className?: string;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  drag: number;
  wind: number;
  opacity: number;
}

// ---------------------------------------------------------------------------
// Default colors (festive QuestMaster palette)
// ---------------------------------------------------------------------------

const DEFAULT_COLORS = [
  '#8b5cf6', // violet-500
  '#a78bfa', // violet-400
  '#34d399', // emerald-400
  '#fbbf24', // amber-400
  '#f472b6', // pink-400
  '#60a5fa', // blue-400
  '#fb923c', // orange-400
  '#e879f9', // fuchsia-400
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Confetti: React.FC<ConfettiProps> = ({
  active,
  duration = 3000,
  particleCount = 100,
  colors = DEFAULT_COLORS,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const startTimeRef = useRef<number>(0);
  const prefersReducedMotion = useReducedMotion();

  const createParticles = useCallback(
    (width: number, height: number) => {
      const particles: ConfettiParticle[] = [];
      const cx = width / 2;
      const cy = height * 0.35;

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 6 + 3;

        particles.push({
          x: cx + (Math.random() - 0.5) * 40,
          y: cy + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * velocity * (0.5 + Math.random()),
          vy: Math.sin(angle) * velocity * -1 - Math.random() * 2,
          width: Math.random() * 8 + 4,
          height: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 12,
          gravity: 0.12 + Math.random() * 0.06,
          drag: 0.97 + Math.random() * 0.02,
          wind: (Math.random() - 0.5) * 0.1,
          opacity: 1,
        });
      }

      particlesRef.current = particles;
    },
    [particleCount, colors],
  );

  useEffect(() => {
    if (!active || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    createParticles(w, h);
    startTimeRef.current = performance.now();

    const draw = (timestamp: number) => {
      const elapsed = timestamp - startTimeRef.current;
      const fadeProgress = Math.max(0, (elapsed - duration * 0.6) / (duration * 0.4));

      ctx.clearRect(0, 0, w, h);

      let alive = false;

      for (const p of particlesRef.current) {
        p.vy += p.gravity;
        p.vx += p.wind;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - fadeProgress);

        if (p.y < h + 50 && p.opacity > 0) {
          alive = true;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
          ctx.restore();
        }
      }

      if (alive && elapsed < duration) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active, duration, createParticles, prefersReducedMotion]);

  // Don't render canvas at all when reduced motion is preferred
  if (prefersReducedMotion) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-50 ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default Confetti;
