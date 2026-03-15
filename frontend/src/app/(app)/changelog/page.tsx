'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Wrench,
  Bug,
  Search,
  Calendar,
  Tag,
  Shield,
  Sun,
  Scale,
  Rocket,
} from 'lucide-react';

type Category = 'new' | 'improvement' | 'bugfix';

interface ChangeItem {
  text: string;
  category: Category;
}

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  description: string;
  icon: React.ElementType;
  changes: ChangeItem[];
}

const categoryConfig: Record<Category, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  new: { label: 'Nueva funcionalidad', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Sparkles },
  improvement: { label: 'Mejora', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Wrench },
  bugfix: { label: 'Correccion', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: Bug },
};

const changelog: ChangelogEntry[] = [
  {
    version: '1.3.0',
    date: '15 Mar 2026',
    title: 'Content Moderation & Community Safety',
    description: 'Herramientas avanzadas de moderacion de contenido y seguridad para la comunidad.',
    icon: Shield,
    changes: [
      { text: 'Sistema de moderacion automatica de contenido con IA', category: 'new' },
      { text: 'Panel de reportes para administradores', category: 'new' },
      { text: 'Filtros de lenguaje inapropiado en conversaciones de voz', category: 'new' },
      { text: 'Sistema de advertencias y sanciones progresivas', category: 'new' },
      { text: 'Mejoras en el rendimiento del sistema de reportes', category: 'improvement' },
      { text: 'Correccion en la deteccion de contenido duplicado', category: 'bugfix' },
    ],
  },
  {
    version: '1.2.0',
    date: '28 Feb 2026',
    title: 'Seasonal Events & Weather Integration',
    description: 'Eventos estacionales dinamicos e integracion con datos meteorologicos en tiempo real.',
    icon: Sun,
    changes: [
      { text: 'Eventos estacionales automaticos (Navidad, Halloween, Verano)', category: 'new' },
      { text: 'Integracion con API meteorologica para quests al aire libre', category: 'new' },
      { text: 'Quests especiales que se activan segun el clima', category: 'new' },
      { text: 'Calendario de eventos con notificaciones', category: 'new' },
      { text: 'Mejor rendimiento en la carga de mapas con datos meteorologicos', category: 'improvement' },
      { text: 'Optimizacion del cache de datos estacionales', category: 'improvement' },
      { text: 'Correccion de zona horaria en eventos programados', category: 'bugfix' },
    ],
  },
  {
    version: '1.1.0',
    date: '10 Feb 2026',
    title: 'GDPR Compliance & Data Rights',
    description: 'Cumplimiento total con GDPR y herramientas de gestion de datos personales.',
    icon: Scale,
    changes: [
      { text: 'Panel de privacidad con control granular de datos', category: 'new' },
      { text: 'Exportacion completa de datos personales (DSAR)', category: 'new' },
      { text: 'Eliminacion automatica de cuenta con periodo de gracia de 30 dias', category: 'new' },
      { text: 'Consentimiento de cookies configurable', category: 'new' },
      { text: 'Registro de actividad de datos para auditorias', category: 'new' },
      { text: 'Mejoras en la encriptacion de datos en transito', category: 'improvement' },
      { text: 'Mejora en la politica de retencion de logs', category: 'improvement' },
      { text: 'Correccion en la anonimizacion de datos de conversaciones', category: 'bugfix' },
    ],
  },
  {
    version: '1.0.0',
    date: '25 Ene 2026',
    title: 'Initial Launch - QuestMaster',
    description: 'Lanzamiento oficial de la plataforma QuestMaster con todas las funcionalidades core.',
    icon: Rocket,
    changes: [
      { text: 'Creacion y gestion de quests interactivas con multiples etapas', category: 'new' },
      { text: 'Conversaciones de voz en tiempo real con personajes IA', category: 'new' },
      { text: 'Mapas interactivos con Mapbox GL y vista 3D', category: 'new' },
      { text: 'Sistema de logros y ranking global', category: 'new' },
      { text: 'Panel de administracion con analiticas', category: 'new' },
      { text: 'Autenticacion segura con Amazon Cognito', category: 'new' },
      { text: 'App movil con Expo React Native', category: 'new' },
      { text: 'Analisis de conversaciones con Amazon Bedrock', category: 'new' },
    ],
  },
];

const allCategories: Category[] = ['new', 'improvement', 'bugfix'];

export default function ChangelogPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');

  const filteredChangelog = changelog
    .map((entry) => {
      const filteredChanges = entry.changes.filter((change) => {
        const matchesCategory = activeFilter === 'all' || change.category === activeFilter;
        const matchesSearch =
          !search ||
          change.text.toLowerCase().includes(search.toLowerCase()) ||
          entry.title.toLowerCase().includes(search.toLowerCase()) ||
          entry.version.includes(search);
        return matchesCategory && matchesSearch;
      });
      return { ...entry, changes: filteredChanges };
    })
    .filter((entry) => entry.changes.length > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-white">Novedades</h1>
        <p className="text-slate-400 mt-1">Historial de cambios y actualizaciones de QuestMaster</p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-4 border border-slate-700/30"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar cambios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-navy-800/50 border border-slate-700/30 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeFilter === 'all'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-slate-300 border border-transparent'
              }`}
            >
              Todos
            </button>
            {allCategories.map((cat) => {
              const config = categoryConfig[cat];
              const Icon = config.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeFilter === cat
                      ? `${config.bg} ${config.color} border ${config.border}`
                      : 'text-slate-400 hover:text-slate-300 border border-transparent'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/40 via-slate-700/30 to-transparent" />

        <div className="space-y-8">
          {filteredChangelog.map((entry, index) => {
            const Icon = entry.icon;
            const isLatest = index === 0 && activeFilter === 'all' && !search;

            return (
              <motion.div
                key={entry.version}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                className="relative pl-14"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 top-1 w-[47px] h-[47px] rounded-xl flex items-center justify-center border ${
                    isLatest
                      ? 'bg-violet-500/20 border-violet-500/40 shadow-lg shadow-violet-500/20'
                      : 'bg-navy-800 border-slate-700/30'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isLatest ? 'text-violet-400' : 'text-slate-500'}`} />
                </div>

                <div className="glass rounded-2xl p-6 border border-slate-700/30">
                  {/* Version header */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-lg font-heading font-bold text-white">v{entry.version}</span>
                    {isLatest && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-medium">
                        <Sparkles className="w-3 h-3" />
                        Ultimo
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {entry.date}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-200 mb-1">{entry.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{entry.description}</p>

                  {/* Changes */}
                  <div className="space-y-2">
                    {entry.changes.map((change, ci) => {
                      const catConfig = categoryConfig[change.category];
                      const CatIcon = catConfig.icon;
                      return (
                        <div key={ci} className="flex items-start gap-2.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium mt-0.5 ${catConfig.bg} ${catConfig.color} border ${catConfig.border}`}
                          >
                            <CatIcon className="w-2.5 h-2.5" />
                            <Tag className="w-2.5 h-2.5" />
                          </span>
                          <span className="text-sm text-slate-300">{change.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredChangelog.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 pl-14"
          >
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No se encontraron cambios con los filtros actuales</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
