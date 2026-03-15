'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Globe,
  Users,
  MapPin,
  Cpu,
  Mic,
  Map,
  Shield,
  ChevronRight,
  Send,
  Github,
  Twitter,
  Linkedin,
  Mail,
  ExternalLink,
  Zap,
  Heart,
  Star,
} from 'lucide-react';

/* ── Animated counter ──────────────────────────────────────────────── */

function AnimatedCounter({ target, label, suffix = '' }: { target: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-heading font-bold text-white">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-slate-400 mt-2">{label}</p>
    </div>
  );
}

/* ── Particle Background ───────────────────────────────────────────── */

function ParticleHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})`;
        ctx.fill();
      }
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}

/* ── Team members ──────────────────────────────────────────────────── */

const team = [
  { name: 'David Perez', role: 'Fundador & CEO', initials: 'DP' },
  { name: 'Laura Martinez', role: 'CTO', initials: 'LM' },
  { name: 'Carlos Ruiz', role: 'Disenador Principal', initials: 'CR' },
  { name: 'Ana Garcia', role: 'Lead Developer', initials: 'AG' },
];

/* ── Tech stack ────────────────────────────────────────────────────── */

const techStack = [
  { name: 'Next.js', icon: Zap, color: 'text-white' },
  { name: 'AWS', icon: Cpu, color: 'text-amber-400' },
  { name: 'OpenAI', icon: Mic, color: 'text-emerald-400' },
  { name: 'Mapbox', icon: Map, color: 'text-blue-400' },
];

/* ── Timeline ──────────────────────────────────────────────────────── */

const timeline = [
  { date: 'Sep 2025', title: 'Idea inicial', description: 'Concepto de quests interactivas con IA de voz' },
  { date: 'Nov 2025', title: 'Prototipo', description: 'Primera version funcional con conversaciones de voz' },
  { date: 'Ene 2026', title: 'Lanzamiento v1.0', description: 'Lanzamiento publico con 50+ quests iniciales' },
  { date: 'Mar 2026', title: 'Expansion', description: 'Nuevas funcionalidades: eventos, moderacion, GDPR' },
];

/* ── Press ──────────────────────────────────────────────────────────── */

const press = [
  { outlet: 'TechCrunch', quote: 'QuestMaster reinventa la exploracion urbana con IA conversacional', date: 'Feb 2026' },
  { outlet: 'Wired', quote: 'La plataforma que convierte cualquier ciudad en un juego de aventuras', date: 'Ene 2026' },
  { outlet: 'El Pais', quote: 'Turismo interactivo: la startup espanola que usa IA para crear aventuras', date: 'Mar 2026' },
];

/* ── Page ──────────────────────────────────────────────────────────── */

export default function AboutPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSent, setFormSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => setFormSent(false), 4000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <ParticleHero />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-950" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6 max-w-3xl"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-violet-500/30">
            <Compass className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
            Convierte el mundo en tu{' '}
            <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              aventura
            </span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            QuestMaster es la plataforma de aventuras interactivas que combina exploracion del mundo real
            con personajes de IA, conversaciones de voz en tiempo real y desafios inmersivos.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass rounded-3xl p-10 border border-slate-700/30"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedCounter target={250} label="Quests disponibles" suffix="+" />
            <AnimatedCounter target={45} label="Paises" />
            <AnimatedCounter target={12000} label="Usuarios activos" suffix="+" />
            <AnimatedCounter target={98} label="Satisfaccion" suffix="%" />
          </div>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="py-16 px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-white mb-6">Nuestra mision</h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            Creemos que cada esquina del mundo tiene una historia que contar. Nuestra mision es
            democratizar la exploracion, haciendo que cualquier persona pueda vivir aventuras
            inolvidables en su propia ciudad o en cualquier lugar del planeta, guiada por
            personajes de inteligencia artificial que hacen cada experiencia unica e irrepetible.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 text-violet-400">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">Hecho con pasion en Barcelona</span>
          </div>
        </motion.div>
      </section>

      {/* Team */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-heading text-3xl font-bold text-white mb-2">Nuestro equipo</h2>
            <p className="text-slate-400">Las personas detras de QuestMaster</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 text-center border border-slate-700/30"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/30 to-emerald-500/30 flex items-center justify-center mx-auto mb-4 border border-violet-500/20">
                  <span className="text-lg font-heading font-bold text-white">{member.initials}</span>
                </div>
                <h4 className="font-semibold text-white text-sm">{member.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-heading text-3xl font-bold text-white mb-2">Tecnologia</h2>
            <p className="text-slate-400">Construido con las mejores herramientas</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {techStack.map((tech, i) => {
              const Icon = tech.icon;
              return (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-6 text-center border border-slate-700/30 hover:border-violet-500/30 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-navy-800 flex items-center justify-center mx-auto mb-3">
                    <Icon className={`w-7 h-7 ${tech.color}`} />
                  </div>
                  <h4 className="font-semibold text-white">{tech.name}</h4>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-heading text-3xl font-bold text-white mb-2">Nuestra historia</h2>
            <p className="text-slate-400">El camino hasta aqui</p>
          </motion.div>
          <div className="relative">
            <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/40 to-transparent" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.date}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-10"
                >
                  <div className="absolute left-0 top-1 w-[31px] h-[31px] rounded-full bg-navy-800 border border-violet-500/30 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                  </div>
                  <div className="glass rounded-xl p-5 border border-slate-700/30">
                    <span className="text-xs text-violet-400 font-medium">{item.date}</span>
                    <h4 className="text-white font-semibold mt-1">{item.title}</h4>
                    <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Press */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-heading text-3xl font-bold text-white mb-2">En los medios</h2>
            <p className="text-slate-400">Lo que dicen de QuestMaster</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {press.map((item, i) => (
              <motion.div
                key={item.outlet}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 border border-slate-700/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-heading font-bold text-violet-400">{item.outlet}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic">&ldquo;{item.quote}&rdquo;</p>
                <p className="text-xs text-slate-500 mt-3">{item.date}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-6">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="font-heading text-3xl font-bold text-white mb-2">Contacto</h2>
            <p className="text-slate-400">Tienes preguntas? Nos encantaria escucharte</p>
          </motion.div>
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="glass rounded-2xl p-8 border border-slate-700/30 space-y-5"
          >
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full px-4 py-2.5 bg-navy-800/50 border border-slate-700/30 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                required
                className="w-full px-4 py-2.5 bg-navy-800/50 border border-slate-700/30 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Mensaje</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData((f) => ({ ...f, message: e.target.value }))}
                required
                rows={4}
                className="w-full px-4 py-2.5 bg-navy-800/50 border border-slate-700/30 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                placeholder="Cuentanos en que podemos ayudarte..."
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-500 transition-colors"
            >
              {formSent ? (
                <>
                  <Star className="w-4 h-4" />
                  Mensaje enviado!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar mensaje
                </>
              )}
            </button>
          </motion.form>
          <div className="flex items-center justify-center gap-6 mt-8">
            <a href="#" className="text-slate-500 hover:text-violet-400 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-slate-500 hover:text-violet-400 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-slate-500 hover:text-violet-400 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-slate-500 hover:text-violet-400 transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
