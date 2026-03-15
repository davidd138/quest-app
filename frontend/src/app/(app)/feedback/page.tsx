'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Wrench,
  HelpCircle,
  Upload,
  ChevronUp,
  Clock,
  CheckCircle,
  Eye,
  Zap,
  AlertTriangle,
  AlertOctagon,
  Info,
  ThumbsUp,
  Sparkles,
  Send,
} from 'lucide-react';

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';
type Priority = 'low' | 'medium' | 'high' | 'critical';
type Mood = 'frustrated' | 'neutral' | 'happy';
type FeedbackStatus = 'submitted' | 'reviewing' | 'planned' | 'done';

interface FeedbackItem {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  priority: Priority;
  status: FeedbackStatus;
  createdAt: string;
}

interface FeatureRequest {
  id: string;
  title: string;
  votes: number;
  status: FeedbackStatus;
  voted: boolean;
}

const typeConfig: Record<FeedbackType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  bug: { label: 'Bug', icon: Bug, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  feature: { label: 'Funcionalidad', icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  improvement: { label: 'Mejora', icon: Wrench, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  other: { label: 'Otro', icon: HelpCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
};

const priorityConfig: Record<Priority, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  low: { label: 'Baja', icon: Info, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  medium: { label: 'Media', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  high: { label: 'Alta', icon: AlertOctagon, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  critical: { label: 'Critica', icon: Zap, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
};

const statusConfig: Record<FeedbackStatus, { label: string; icon: React.ElementType; color: string }> = {
  submitted: { label: 'Enviado', icon: Send, color: 'text-slate-400' },
  reviewing: { label: 'En revision', icon: Eye, color: 'text-amber-400' },
  planned: { label: 'Planificado', icon: Clock, color: 'text-violet-400' },
  done: { label: 'Completado', icon: CheckCircle, color: 'text-emerald-400' },
};

const moodOptions: { value: Mood; emoji: string; label: string }[] = [
  { value: 'frustrated', emoji: '\uD83D\uDE24', label: 'Frustrado' },
  { value: 'neutral', emoji: '\uD83D\uDE10', label: 'Neutral' },
  { value: 'happy', emoji: '\uD83D\uDE0A', label: 'Contento' },
];

const myFeedback: FeedbackItem[] = [
  { id: 'fb-1', type: 'bug', title: 'Error al cargar mapa en Safari', description: 'El mapa no se renderiza correctamente en Safari 17.', priority: 'high', status: 'reviewing', createdAt: '2026-03-14' },
  { id: 'fb-2', type: 'feature', title: 'Modo offline para quests', description: 'Poder descargar quests para jugar sin conexion.', priority: 'medium', status: 'planned', createdAt: '2026-03-10' },
  { id: 'fb-3', type: 'improvement', title: 'Mejorar transiciones de pagina', description: 'Las transiciones entre paginas podrian ser mas fluidas.', priority: 'low', status: 'done', createdAt: '2026-03-05' },
];

const initialFeatureRequests: FeatureRequest[] = [
  { id: 'fr-1', title: 'Modo multijugador cooperativo', votes: 142, status: 'planned', voted: false },
  { id: 'fr-2', title: 'Quests personalizadas por la comunidad', votes: 118, status: 'reviewing', voted: false },
  { id: 'fr-3', title: 'Integracion con Apple Watch / Wear OS', votes: 95, status: 'submitted', voted: false },
  { id: 'fr-4', title: 'Sistema de clanes / equipos', votes: 87, status: 'planned', voted: false },
  { id: 'fr-5', title: 'Modo foto con filtros AR', votes: 73, status: 'submitted', voted: false },
  { id: 'fr-6', title: 'Marketplace de objetos virtuales', votes: 61, status: 'reviewing', voted: false },
];

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'votes'>('form');
  const [type, setType] = useState<FeedbackType>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [mood, setMood] = useState<Mood>('neutral');
  const [showThankYou, setShowThankYou] = useState(false);
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>(initialFeatureRequests);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setShowThankYou(true);
    setTitle('');
    setDescription('');
    setType('bug');
    setPriority('medium');
    setMood('neutral');
    setTimeout(() => setShowThankYou(false), 4000);
  };

  const toggleVote = (id: string) => {
    setFeatureRequests((prev) =>
      prev.map((fr) =>
        fr.id === id
          ? { ...fr, voted: !fr.voted, votes: fr.voted ? fr.votes - 1 : fr.votes + 1 }
          : fr,
      ),
    );
  };

  const tabs = [
    { id: 'form' as const, label: 'Nuevo feedback', icon: MessageSquare },
    { id: 'history' as const, label: 'Mis envios', icon: Clock },
    { id: 'votes' as const, label: 'Votar funcionalidades', icon: ThumbsUp },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-white">Feedback</h1>
        <p className="text-slate-400 mt-1">Ayudanos a mejorar QuestMaster con tus sugerencias</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-slate-300 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Form Tab */}
        {activeTab === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Thank You Animation */}
            <AnimatePresence>
              {showThankYou && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass rounded-2xl p-8 text-center border border-emerald-500/30 mb-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                  >
                    <Sparkles className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-heading font-bold text-white mb-2">Gracias por tu feedback!</h3>
                  <p className="text-slate-400">Tu opinion nos ayuda a mejorar QuestMaster cada dia</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 border border-slate-700/30 space-y-6">
              {/* Type Selector */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Tipo de feedback</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.entries(typeConfig) as [FeedbackType, typeof typeConfig[FeedbackType]][]).map(
                    ([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setType(key)}
                          className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-sm ${
                            type === key
                              ? `${config.bg} ${config.color} border-current/20`
                              : 'border-slate-700/30 text-slate-400 hover:border-slate-600/30'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Titulo</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Resume tu feedback en una frase"
                  className="w-full px-4 py-2.5 bg-navy-800/50 border border-slate-700/30 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Descripcion</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe tu feedback con el mayor detalle posible..."
                  className="w-full px-4 py-2.5 bg-navy-800/50 border border-slate-700/30 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                />
              </div>

              {/* Screenshot Upload (placeholder) */}
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Captura de pantalla (opcional)</label>
                <div className="border-2 border-dashed border-slate-700/30 rounded-xl p-8 text-center hover:border-violet-500/30 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Arrastra una imagen o haz clic para subir</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG hasta 5MB</p>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Prioridad</label>
                <div className="flex gap-2">
                  {(Object.entries(priorityConfig) as [Priority, typeof priorityConfig[Priority]][]).map(
                    ([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPriority(key)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                            priority === key
                              ? `${config.bg} ${config.color} ${config.border}`
                              : 'border-slate-700/30 text-slate-400 hover:text-slate-300'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {config.label}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Como te sientes?</label>
                <div className="flex gap-3">
                  {moodOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMood(option.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                        mood === option.value
                          ? 'border-violet-500/30 bg-violet-500/10'
                          : 'border-slate-700/30 hover:border-slate-600/30'
                      }`}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="text-xs text-slate-400">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-500 transition-colors"
              >
                <Send className="w-4 h-4" />
                Enviar feedback
              </button>
            </form>
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {myFeedback.map((fb) => {
              const tConfig = typeConfig[fb.type];
              const sConfig = statusConfig[fb.status];
              const pConfig = priorityConfig[fb.priority];
              const TypeIcon = tConfig.icon;
              const StatusIcon = sConfig.icon;
              return (
                <div
                  key={fb.id}
                  className="glass rounded-2xl p-5 border border-slate-700/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${tConfig.bg} ${tConfig.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {tConfig.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${pConfig.bg} ${pConfig.color}`}>
                          {pConfig.label}
                        </span>
                      </div>
                      <h4 className="text-white font-medium">{fb.title}</h4>
                      <p className="text-sm text-slate-400 mt-1">{fb.description}</p>
                      <p className="text-xs text-slate-500 mt-2">{fb.createdAt}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${sConfig.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {sConfig.label}
                    </div>
                  </div>
                </div>
              );
            })}
            {myFeedback.length === 0 && (
              <div className="glass rounded-2xl p-12 text-center border border-slate-700/30">
                <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No has enviado feedback todavia</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Votes Tab */}
        {activeTab === 'votes' && (
          <motion.div
            key="votes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <p className="text-sm text-slate-400 mb-4">
              Vota por las funcionalidades que mas te gustaria ver en QuestMaster
            </p>
            {featureRequests
              .sort((a, b) => b.votes - a.votes)
              .map((fr) => {
                const sConfig = statusConfig[fr.status];
                const StatusIcon = sConfig.icon;
                return (
                  <div
                    key={fr.id}
                    className="glass rounded-2xl p-5 border border-slate-700/30 flex items-center gap-4"
                  >
                    <button
                      onClick={() => toggleVote(fr.id)}
                      className={`flex flex-col items-center gap-0.5 p-2 rounded-xl border transition-all min-w-[56px] ${
                        fr.voted
                          ? 'border-violet-500/30 bg-violet-500/20 text-violet-400'
                          : 'border-slate-700/30 text-slate-400 hover:border-violet-500/20'
                      }`}
                    >
                      <ChevronUp className="w-4 h-4" />
                      <span className="text-sm font-bold">{fr.votes}</span>
                    </button>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{fr.title}</h4>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${sConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {sConfig.label}
                      </div>
                    </div>
                  </div>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
