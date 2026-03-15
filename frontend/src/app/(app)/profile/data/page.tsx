'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Download,
  Trash2,
  ArrowLeft,
  Shield,
  AlertTriangle,
  Clock,
  Database,
  FileJson,
  CheckCircle,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@/hooks/useGraphQL';

const EXPORT_QUERY = `
  query ExportMyData {
    exportMyData {
      user {
        userId
        email
        name
        role
        status
        totalPoints
        questsCompleted
        createdAt
        updatedAt
      }
      progress {
        id
        questId
        currentStageIndex
        status
        startedAt
        completedAt
        totalPoints
        totalDuration
      }
      conversations {
        id
        questId
        stageId
        characterName
        transcript
        status
        startedAt
        endedAt
        duration
      }
      scores {
        id
        questId
        questTitle
        totalPoints
        completionTime
        stagesCompleted
        totalStages
        completedAt
      }
      achievements {
        id
        type
        title
        description
        earnedAt
        questId
      }
      exportedAt
    }
  }
`;

const DELETE_MUTATION = `
  mutation DeleteMyAccount {
    deleteMyAccount
  }
`;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DataManagementPage() {
  const { user, signOut } = useAuth();
  const { loading: exporting, execute: exportData } = useQuery(EXPORT_QUERY);
  const { loading: deleting, execute: deleteAccount } = useMutation(DELETE_MUTATION);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleExport = async () => {
    setExportError(null);
    setExportSuccess(false);
    try {
      const data = await exportData();
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questmaster-datos-${user?.email || 'usuario'}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
    } catch {
      setExportError('Error al exportar los datos. Por favor, intentelo de nuevo.');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== 'ELIMINAR') return;
    setDeleteError(null);
    try {
      await deleteAccount();
      // Sign out and redirect after account deletion
      await signOut();
    } catch {
      setDeleteError('Error al eliminar la cuenta. Por favor, contacte con soporte.');
    }
  };

  if (!user) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al perfil
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center shadow-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Mis datos personales</h1>
            <p className="text-slate-400 text-sm">
              Gestiona tus datos conforme al RGPD y la LOPD-GDD
            </p>
          </div>
        </div>
      </motion.div>

      {/* Info card */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-2xl p-6 border border-violet-500/20"
      >
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-violet-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-heading text-sm font-bold text-white mb-1">
              Tus derechos de proteccion de datos
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Conforme al Reglamento General de Proteccion de Datos (RGPD) y la Ley Organica 3/2018
              (LOPD-GDD), tienes derecho a acceder, rectificar, suprimir, portar y limitar el
              tratamiento de tus datos personales. Desde esta pagina puedes ejercer tus derechos de
              acceso (descarga) y supresion (eliminacion).
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Para otros derechos (rectificacion, oposicion, limitacion), contacta con{' '}
              <span className="text-violet-400">privacidad@questmaster.es</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Export data */}
      <motion.div variants={itemVariants}>
        <div className="glass rounded-2xl p-6 border border-slate-700/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Download className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-lg font-bold text-white mb-1">
                Descargar mis datos
              </h2>
              <p className="text-sm text-slate-400 mb-1">
                Derecho de acceso y portabilidad (Art. 15 y 20 RGPD)
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Descarga una copia completa de todos tus datos personales en formato JSON. Incluye tu
                perfil, progreso en quests, conversaciones, puntuaciones y logros.
              </p>

              <div className="flex items-center gap-3 mb-4">
                <FileJson className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500">
                  Formato: JSON (legible por maquina, conforme Art. 20 RGPD)
                </span>
              </div>

              <AnimatePresence mode="wait">
                {exportSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-400">
                      Datos exportados correctamente. La descarga deberia haber comenzado
                      automaticamente.
                    </p>
                  </motion.div>
                )}
                {exportError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <p className="text-xs text-rose-400">{exportError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleExport}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-600/25"
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Descargar mis datos
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data retention info */}
      <motion.div variants={itemVariants}>
        <div className="glass rounded-2xl p-6 border border-slate-700/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-lg font-bold text-white mb-1">
                Conservacion de datos
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Plazos de conservacion conforme al Art. 5.1.e RGPD (limitacion del plazo de
                conservacion)
              </p>

              <div className="space-y-2">
                {[
                  { label: 'Datos de cuenta', period: 'Mientras la cuenta este activa + 3 anos', color: 'violet' },
                  { label: 'Progreso y puntuaciones', period: 'Mientras la cuenta este activa + 1 ano', color: 'emerald' },
                  { label: 'Conversaciones de voz', period: 'Transcripciones: 12 meses', color: 'amber' },
                  { label: 'Datos de ubicacion', period: 'Solo durante la sesion activa', color: 'rose' },
                  { label: 'Logs de auditoria', period: '5 anos (obligacion legal)', color: 'slate' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-2 border-b border-slate-700/20 last:border-0"
                  >
                    <span className="text-sm text-slate-300">{item.label}</span>
                    <span className={`text-xs text-${item.color}-400 font-medium`}>
                      {item.period}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete account */}
      <motion.div variants={itemVariants}>
        <div className="glass rounded-2xl p-6 border border-rose-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
              <Trash2 className="w-6 h-6 text-rose-400" />
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-lg font-bold text-white mb-1">
                Eliminar mi cuenta
              </h2>
              <p className="text-sm text-slate-400 mb-1">
                Derecho de supresion - Derecho al olvido (Art. 17 RGPD)
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Esta accion eliminara permanentemente tu cuenta y todos tus datos personales de
                nuestros sistemas, incluyendo perfil, progreso, conversaciones, puntuaciones y
                logros. Esta accion es irreversible. Se conservaran unicamente los datos necesarios
                para el cumplimiento de obligaciones legales (logs de auditoria) durante el plazo
                legalmente establecido.
              </p>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-sm font-semibold transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar mi cuenta y datos
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Privacy link */}
      <motion.div variants={itemVariants} className="text-center pb-8">
        <Link
          href="/privacy"
          className="text-sm text-slate-500 hover:text-violet-400 transition-colors underline"
        >
          Consultar Politica de Privacidad completa
        </Link>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md glass rounded-2xl border border-rose-500/30 shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    </div>
                    <h2 className="font-heading text-lg font-bold text-white">
                      Confirmar eliminacion
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <p className="text-sm text-rose-300 font-medium mb-2">
                    Esta accion es permanente e irreversible.
                  </p>
                  <p className="text-xs text-slate-400">
                    Se eliminaran todos tus datos personales: perfil, progreso en quests,
                    conversaciones con personajes de IA, puntuaciones, logros y tu cuenta de Cognito.
                    No podras recuperar esta informacion.
                  </p>
                </div>

                {deleteError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <p className="text-xs text-rose-400">{deleteError}</p>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Escribe <strong className="text-rose-400">ELIMINAR</strong> para confirmar
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="ELIMINAR"
                    className="w-full px-4 py-3 rounded-xl bg-navy-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all duration-200 font-mono"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText('');
                      setDeleteError(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700/50 text-slate-300 hover:bg-white/5 text-sm font-medium transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteConfirmText !== 'ELIMINAR' || deleting}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Eliminar definitivamente
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
