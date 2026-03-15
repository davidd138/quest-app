'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Webhook,
  Plus,
  Play,
  Pause,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';

type WebhookStatus = 'active' | 'inactive';
type DeliveryStatus = 'success' | 'failed' | 'pending';

interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  events: string[];
  status: WebhookStatus;
  createdAt: string;
}

interface DeliveryLog {
  id: string;
  webhookId: string;
  event: string;
  statusCode: number;
  status: DeliveryStatus;
  timestamp: string;
  duration: string;
}

const availableEvents = [
  { id: 'quest.completed', label: 'Quest completada', description: 'Se dispara al completar una quest' },
  { id: 'achievement.unlocked', label: 'Logro desbloqueado', description: 'Se dispara al desbloquear un logro' },
  { id: 'user.signup', label: 'Registro de usuario', description: 'Se dispara al registrarse un nuevo usuario' },
  { id: 'quest.created', label: 'Quest creada', description: 'Se dispara al crear una nueva quest' },
];

const initialWebhooks: WebhookConfig[] = [
  {
    id: 'wh-1',
    url: 'https://api.example.com/webhooks/questmaster',
    secret: 'whsec_a1b2c3d4e5f6g7h8i9j0',
    events: ['quest.completed', 'achievement.unlocked'],
    status: 'active',
    createdAt: '2026-03-01',
  },
  {
    id: 'wh-2',
    url: 'https://hooks.slack.com/services/T00/B00/abc123',
    secret: 'whsec_k1l2m3n4o5p6q7r8s9t0',
    events: ['user.signup'],
    status: 'active',
    createdAt: '2026-02-20',
  },
  {
    id: 'wh-3',
    url: 'https://old-integration.example.com/callback',
    secret: 'whsec_u1v2w3x4y5z6a7b8c9d0',
    events: ['quest.created'],
    status: 'inactive',
    createdAt: '2026-01-15',
  },
];

const initialDeliveries: DeliveryLog[] = [
  { id: 'dl-1', webhookId: 'wh-1', event: 'quest.completed', statusCode: 200, status: 'success', timestamp: '2026-03-15 14:32:10', duration: '120ms' },
  { id: 'dl-2', webhookId: 'wh-2', event: 'user.signup', statusCode: 200, status: 'success', timestamp: '2026-03-15 13:15:45', duration: '95ms' },
  { id: 'dl-3', webhookId: 'wh-1', event: 'achievement.unlocked', statusCode: 500, status: 'failed', timestamp: '2026-03-15 12:08:22', duration: '3200ms' },
  { id: 'dl-4', webhookId: 'wh-1', event: 'quest.completed', statusCode: 200, status: 'success', timestamp: '2026-03-14 19:45:03', duration: '145ms' },
  { id: 'dl-5', webhookId: 'wh-2', event: 'user.signup', statusCode: 408, status: 'failed', timestamp: '2026-03-14 16:30:17', duration: '5000ms' },
  { id: 'dl-6', webhookId: 'wh-1', event: 'quest.completed', statusCode: 200, status: 'success', timestamp: '2026-03-14 11:22:55', duration: '88ms' },
];

const statusCodeColor = (code: number) => {
  if (code >= 200 && code < 300) return 'text-emerald-400';
  if (code >= 400 && code < 500) return 'text-amber-400';
  return 'text-rose-400';
};

export default function AdminWebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(initialWebhooks);
  const [deliveries] = useState<DeliveryLog[]>(initialDeliveries);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [expandedDeliveries, setExpandedDeliveries] = useState(false);

  const toggleWebhookStatus = (id: string) => {
    setWebhooks((prev) =>
      prev.map((wh) =>
        wh.id === id ? { ...wh, status: wh.status === 'active' ? 'inactive' : 'active' } : wh,
      ),
    );
  };

  const deleteWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id));
  };

  const addWebhook = () => {
    if (!newUrl || newEvents.length === 0) return;
    const newWh: WebhookConfig = {
      id: `wh-${Date.now()}`,
      url: newUrl,
      secret: `whsec_${Math.random().toString(36).slice(2, 22)}`,
      events: newEvents,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setWebhooks((prev) => [...prev, newWh]);
    setNewUrl('');
    setNewEvents([]);
    setShowAddForm(false);
  };

  const testWebhook = (id: string) => {
    setTestingId(id);
    setTimeout(() => setTestingId(null), 2000);
  };

  const toggleEvent = (eventId: string) => {
    setNewEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId],
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Webhook className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Webhooks</h1>
              <p className="text-slate-400 mt-1">Gestiona integraciones y notificaciones externas</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/30 text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Anadir Webhook
          </button>
        </div>
      </motion.div>

      {/* Add Webhook Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-2xl p-6 border border-violet-500/20 space-y-4">
              <h3 className="text-lg font-semibold text-white">Nuevo Webhook</h3>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">URL del endpoint</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://api.example.com/webhook"
                  className="w-full px-4 py-2.5 bg-navy-800/50 border border-slate-700/30 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Eventos</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => toggleEvent(event.id)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        newEvents.includes(event.id)
                          ? 'border-violet-500/30 bg-violet-500/10'
                          : 'border-slate-700/30 hover:border-slate-600/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Zap className={`w-3.5 h-3.5 ${newEvents.includes(event.id) ? 'text-violet-400' : 'text-slate-500'}`} />
                        <span className={`text-sm font-medium ${newEvents.includes(event.id) ? 'text-white' : 'text-slate-300'}`}>
                          {event.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 ml-5.5">{event.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addWebhook}
                  disabled={!newUrl || newEvents.length === 0}
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Crear Webhook
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Webhooks Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl border border-slate-700/30 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-700/30">
          <h3 className="text-sm font-medium text-slate-300">
            Webhooks configurados ({webhooks.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-700/20">
          {webhooks.map((wh) => (
            <div key={wh.id} className="px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        wh.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'
                      }`}
                    />
                    <span className="text-sm font-medium text-white truncate">{wh.url}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">Secret:</span>
                      <code className="text-xs text-slate-400 font-mono">
                        {showSecrets[wh.id] ? wh.secret : wh.secret.slice(0, 8) + '...'}
                      </code>
                      <button
                        onClick={() =>
                          setShowSecrets((prev) => ({ ...prev, [wh.id]: !prev[wh.id] }))
                        }
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showSecrets[wh.id] ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(wh.secret)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {wh.events.map((event) => (
                      <span
                        key={event}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => testWebhook(wh.id)}
                    className={`p-2 rounded-lg transition-all ${
                      testingId === wh.id
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Probar webhook"
                  >
                    {testingId === wh.id ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => toggleWebhookStatus(wh.id)}
                    className={`p-2 rounded-lg transition-all ${
                      wh.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 hover:text-white'
                    }`}
                    title={wh.status === 'active' ? 'Desactivar' : 'Activar'}
                  >
                    {wh.status === 'active' ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteWebhook(wh.id)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {webhooks.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Webhook className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No hay webhooks configurados</p>
              <p className="text-sm text-slate-500 mt-1">
                Anade un webhook para recibir notificaciones en tiempo real
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Delivery Log */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl border border-slate-700/30 overflow-hidden"
      >
        <button
          onClick={() => setExpandedDeliveries(!expandedDeliveries)}
          className="w-full px-6 py-4 border-b border-slate-700/30 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
        >
          <h3 className="text-sm font-medium text-slate-300">
            Registro de entregas recientes
          </h3>
          {expandedDeliveries ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        <AnimatePresence>
          {expandedDeliveries && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-700/20">
                    <th className="px-6 py-3 font-medium">Estado</th>
                    <th className="px-6 py-3 font-medium">Evento</th>
                    <th className="px-6 py-3 font-medium">Codigo</th>
                    <th className="px-6 py-3 font-medium">Duracion</th>
                    <th className="px-6 py-3 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/20">
                  {deliveries.map((dl) => (
                    <tr key={dl.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-3">
                        {dl.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : dl.status === 'failed' ? (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-400" />
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-0.5 rounded text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 font-mono">
                          {dl.event}
                        </span>
                      </td>
                      <td className={`px-6 py-3 font-mono ${statusCodeColor(dl.statusCode)}`}>
                        {dl.statusCode}
                      </td>
                      <td className="px-6 py-3 text-slate-400">{dl.duration}</td>
                      <td className="px-6 py-3 text-slate-500">{dl.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
