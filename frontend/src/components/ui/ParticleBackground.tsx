'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ColorVariant = 'violet' | 'emerald' | 'mixed';

interface ParticleBackgroundProps {
  /** Number of particles. @default 60 */
  count?: number;
  /** Color palette. @default 'violet' */
  colors?: ColorVariant;
  /** Movement speed multiplier. @default 1 */
  speed?: number;
  /** Draw connecting lines between nearby particles. @default true */
  connectLines?: boolean;
  /** Particles react to cursor position. @default true */
  mouseInteract?: boolean;
  /** Additional class names for the container. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Color palettes (rgba-ready)
// ---------------------------------------------------------------------------

const PALETTES: Record<ColorVariant, string[]> = {
  violet: [
    'rgba(139, 92, 246, 0.6)',
    'rgba(124, 58, 237, 0.5)',
    'rgba(167, 139, 250, 0.4)',
    'rgba(196, 181, 253, 0.3)',
  ],
  emerald: [
    'rgba(52, 211, 153, 0.6)',
    'rgba(16, 185, 129, 0.5)',
    'rgba(110, 231, 183, 0.4)',
    'rgba(167, 243, 208, 0.3)',
  ],
  mixed: [
    'rgba(139, 92, 246, 0.6)',
    'rgba(52, 211, 153, 0.5)',
    'rgba(251, 191, 36, 0.4)',
    'rgba(244, 114, 182, 0.4)',
    'rgba(96, 165, 250, 0.5)',
  ],
};

// ---------------------------------------------------------------------------
// Particle data
// ---------------------------------------------------------------------------

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  count = 60,
  colors = 'violet',
  speed = 1,
  connectLines = true,
  mouseInteract = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // ---- Initialise particles ----
  const initParticles = useCallback(
    (width: number, height: number) => {
      const palette = PALETTES[colors];
      const particles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4 * speed,
          vy: (Math.random() - 0.5) * 0.4 * speed,
          radius: Math.random() * 2 + 1,
          color: palette[Math.floor(Math.random() * palette.length)],
        });
      }

      particlesRef.current = particles;
    },
    [count, colors, speed],
  );

  // ---- Draw loop ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initParticles(rect.width, rect.height);
    };

    resize();

    // Reduced motion — render static dots only
    if (prefersReducedMotion) {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);
      for (const p of particlesRef.current) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      return;
    }

    const CONNECTION_DIST = 120;

    const draw = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (const p of particles) {
        // Mouse interaction
        if (mouseInteract && mouse) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            p.vx -= (dx / dist) * force * 0.02;
            p.vy -= (dy / dist) * force * 0.02;
          }
        }

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Dampen
        p.vx *= 0.999;
        p.vy *= 0.999;

        // Wrap edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      // Draw connecting lines
      if (connectLines) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONNECTION_DIST) {
              const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    // Mouse tracking (throttled implicitly by rAF read)
    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleLeave = () => {
      mouseRef.current = null;
    };

    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('mouseleave', handleLeave);
    window.addEventListener('resize', resize);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('resize', resize);
    };
  }, [initParticles, connectLines, mouseInteract, prefersReducedMotion]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-auto ${className}`}>
      <canvas ref={canvasRef} className="block w-full h-full" aria-hidden="true" />
    </div>
  );
};

export default ParticleBackground;
