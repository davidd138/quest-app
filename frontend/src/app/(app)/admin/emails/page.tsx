'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Eye,
  Send,
  CheckCircle,
  ChevronRight,
  Sparkles,
  UserPlus,
  Trophy,
  Award,
  BarChart3,
  Trash2,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  variables: string[];
  subject: string;
  previewHtml: string;
}

const templates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Bienvenida',
    description: 'Enviado al registrarse un nuevo usuario',
    icon: UserPlus,
    variables: ['user_name', 'app_url', 'unsubscribe_url'],
    subject: 'Bienvenido a QuestMaster - Tu aventura comienza ahora',
    previewHtml: `
      <div style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:28px;">QuestMaster</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:13px;text-transform:uppercase;letter-spacing:2px;">Aventuras Interactivas</p>
        </div>
        <div style="background:#1e293b;padding:32px;border-radius:0 0 12px 12px;">
          <h2 style="color:#fff;margin:0 0 12px;">Bienvenido a QuestMaster, <span style="color:#8b5cf6;">{{user_name}}</span>!</h2>
          <p style="line-height:1.6;">Estamos encantados de tenerte en nuestra comunidad de aventureros. Con QuestMaster podras explorar ubicaciones reales, hablar con personajes de IA y completar desafios increibles.</p>
          <div style="text-align:center;margin:24px 0;">
            <a style="display:inline-block;background:#8b5cf6;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Explorar Quests</a>
          </div>
          <p style="font-size:12px;color:#94a3b8;text-align:center;margin-top:24px;">
            <a href="#" style="color:#8b5cf6;">Cancelar suscripcion</a>
          </p>
        </div>
      </div>
    `,
  },
  {
    id: 'quest_completed',
    name: 'Quest completada',
    description: 'Cuando un usuario completa una quest',
    icon: Trophy,
    variables: ['user_name', 'quest_title', 'score', 'total_points', 'app_url', 'unsubscribe_url'],
    subject: 'Quest completada: {{quest_title}} - {{score}} puntos!',
    previewHtml: `
      <div style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:28px;">QuestMaster</h1>
        </div>
        <div style="background:#1e293b;padding:32px;border-radius:0 0 12px 12px;">
          <h2 style="color:#fff;margin:0 0 12px;">Quest completada!</h2>
          <p>Felicidades, <strong>{{user_name}}</strong>! Has completado <strong style="color:#10b981;">"{{quest_title}}"</strong>.</p>
          <div style="background:#0f172a;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
            <p style="font-size:36px;font-weight:700;color:#10b981;margin:0;">{{score}}/{{total_points}}</p>
            <p style="font-size:14px;color:#94a3b8;margin:4px 0 0;">Puntuacion</p>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'achievement_unlocked',
    name: 'Logro desbloqueado',
    description: 'Cuando se desbloquea un logro',
    icon: Award,
    variables: ['user_name', 'achievement_title', 'achievement_description', 'app_url', 'unsubscribe_url'],
    subject: 'Logro desbloqueado: {{achievement_title}}',
    previewHtml: `
      <div style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:28px;">QuestMaster</h1>
        </div>
        <div style="background:#1e293b;padding:32px;border-radius:0 0 12px 12px;">
          <h2 style="color:#fff;margin:0 0 12px;">Logro desbloqueado!</h2>
          <p>Enhorabuena, <strong>{{user_name}}</strong>!</p>
          <div style="background:#0f172a;border:1px solid #f59e0b;border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
            <p style="font-size:24px;font-weight:700;color:#f59e0b;margin:0;">{{achievement_title}}</p>
            <p style="font-size:14px;color:#94a3b8;margin:8px 0 0;">{{achievement_description}}</p>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'weekly_summary',
    name: 'Resumen semanal',
    description: 'Resumen de actividad semanal',
    icon: BarChart3,
    variables: ['user_name', 'quests_completed', 'points_earned', 'rank', 'streak_days', 'app_url', 'unsubscribe_url'],
    subject: 'Tu semana en QuestMaster: {{quests_completed}} quests, {{points_earned}} puntos',
    previewHtml: `
      <div style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:28px;">QuestMaster</h1>
        </div>
        <div style="background:#1e293b;padding:32px;border-radius:0 0 12px 12px;">
          <h2 style="color:#fff;margin:0 0 12px;">Tu resumen semanal</h2>
          <p>Hola <strong>{{user_name}}</strong>, aqui tienes tu actividad:</p>
          <div style="display:flex;gap:12px;margin:20px 0;">
            <div style="background:#0f172a;border-radius:12px;padding:20px;text-align:center;flex:1;">
              <p style="font-size:28px;font-weight:700;color:#8b5cf6;margin:0;">{{quests_completed}}</p>
              <p style="font-size:12px;color:#94a3b8;">Quests</p>
            </div>
            <div style="background:#0f172a;border-radius:12px;padding:20px;text-align:center;flex:1;">
              <p style="font-size:28px;font-weight:700;color:#10b981;margin:0;">{{points_earned}}</p>
              <p style="font-size:12px;color:#94a3b8;">Puntos</p>
            </div>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'account_deletion',
    name: 'Eliminacion de cuenta',
    description: 'Confirmacion de solicitud de eliminacion',
    icon: Trash2,
    variables: ['user_name', 'app_url', 'unsubscribe_url'],
    subject: 'Confirmacion: solicitud de eliminacion de cuenta QuestMaster',
    previewHtml: `
      <div style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:28px;">QuestMaster</h1>
        </div>
        <div style="background:#1e293b;padding:32px;border-radius:0 0 12px 12px;">
          <h2 style="color:#fff;margin:0 0 12px;">Eliminacion de cuenta</h2>
          <p>Hola <strong>{{user_name}}</strong>, hemos recibido tu solicitud.</p>
          <div style="background:rgba(244,63,94,0.1);border:1px solid rgba(244,63,94,0.3);border-radius:12px;padding:20px;margin:20px 0;">
            <p style="color:#fda4af;font-size:14px;margin:0;">Tu cuenta sera eliminada en 30 dias.</p>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'quest_approved',
    name: 'Quest aprobada',
    description: 'Cuando un admin aprueba una quest',
    icon: ThumbsUp,
    variables: ['user_name', 'quest_title', 'app_url', 'unsubscribe_url'],
    subject: 'Quest aprobada: {{quest_title}}',
    previewHtml: `
      <div style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:28px;">QuestMaster</h1>
        </div>
        <div style="background:#1e293b;padding:32px;border-radius:0 0 12px 12px;">
          <h2 style="color:#fff;margin:0 0 12px;">Tu quest ha sido aprobada!</h2>
          <p>Buenas noticias, <strong>{{user_name}}</strong>! Tu quest <strong style="color:#10b981;">"{{quest_title}}"</strong> ya esta disponible.</p>
        </div>
      </div>
    `,
  },
  {
    id: 'quest_rejected',
    name: 'Quest rechazada',
    description: 'Cuando un admin rechaza una quest',
    icon: ThumbsDown,
    variables: ['user_name', 'quest_title', 'reason', 'app_url', 'unsubscribe_url'],
    subject: 'Quest pendiente de cambios: {{quest_title}}',
    previewHtml: `
      <div style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:28px;">QuestMaster</h1>
        </div>
        <div style="background:#1e293b;padding:32px;border-radius:0 0 12px 12px;">
          <h2 style="color:#fff;margin:0 0 12px;">Quest no aprobada</h2>
          <p>Hola <strong>{{user_name}}</strong>, tu quest <strong style="color:#f59e0b;">"{{quest_title}}"</strong> necesita cambios.</p>
          <div style="background:#0f172a;border:1px solid rgba(245,158,11,0.3);border-radius:12px;padding:20px;margin:20px 0;">
            <p style="color:#f59e0b;font-size:13px;font-weight:600;margin:0 0 8px;">MOTIVO</p>
            <p style="margin:0;">{{reason}}</p>
          </div>
        </div>
      </div>
    `,
  },
];

export default function AdminEmailsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(templates[0]);
  const [testSent, setTestSent] = useState(false);

  const handleSendTest = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-white">Plantillas de Email</h1>
            <p className="text-slate-400 mt-1">Previsualiza y prueba las plantillas de notificacion</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-2"
        >
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 px-1">
            Plantillas ({templates.length})
          </h3>
          {templates.map((template) => {
            const Icon = template.icon;
            const isActive = selectedTemplate.id === template.id;
            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'glass border-violet-500/30 shadow-lg shadow-violet-500/10'
                    : 'border-transparent hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-violet-500/20' : 'bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-violet-400' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {template.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{template.description}</p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-violet-400' : 'text-slate-600'}`}
                  />
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Preview Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Template Info */}
          <div className="glass rounded-2xl p-6 border border-slate-700/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedTemplate.name}</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Asunto: <span className="text-slate-300">{selectedTemplate.subject}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendTest}
                  disabled={testSent}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    testSent
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/30'
                  }`}
                >
                  {testSent ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Enviado
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar test
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Variables */}
            <div className="flex flex-wrap gap-2">
              {selectedTemplate.variables.map((variable) => (
                <span
                  key={variable}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono"
                >
                  <Sparkles className="w-3 h-3" />
                  {`{{${variable}}}`}
                </span>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="glass rounded-2xl border border-slate-700/30 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/30 bg-white/[0.02]">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Vista previa</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTemplate.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <div
                  className="max-w-lg mx-auto"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.previewHtml }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
