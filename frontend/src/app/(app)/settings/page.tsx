'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bell,
  Globe,
  Palette,
  Shield,
  Mic,
  User,
  Mail,
  Smartphone,
  MessageSquare,
  Monitor,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Trophy,
  KeyRound,
  Download,
  Trash2,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.06 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

interface ToggleProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ElementType;
}

function Toggle({ enabled, onChange, label, description, icon: Icon }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 p-2 rounded-lg bg-white/5">
            <Icon size={16} className="text-slate-400" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
          enabled ? 'bg-violet-600' : 'bg-slate-700'
        }`}
      >
        <motion.div
          animate={{ x: enabled ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        />
      </button>
    </div>
  );
}

interface OptionSelectProps {
  value: string;
  options: { value: string; label: string; icon?: React.ElementType }[];
  onChange: (value: string) => void;
}

function OptionSelect({ value, options, onChange }: OptionSelectProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = value === option.value;
        const OptionIcon = option.icon;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
              isSelected
                ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {OptionIcon && <OptionIcon size={14} />}
            {option.label}
            {isSelected && <Check size={12} className="text-violet-400" />}
          </button>
        );
      })}
    </div>
  );
}

function SettingsSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card variant="elevated" padding="none" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <Icon size={16} className="text-violet-400" />
          </div>
          <h3 className="font-heading font-semibold text-white">{title}</h3>
        </div>
        <div className="px-5 py-4">{children}</div>
      </Card>
    </motion.div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();

  // Notification preferences
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);

  // Language
  const [language, setLanguage] = useState('es');

  // Theme
  const [theme, setTheme] = useState('dark');

  // Privacy
  const [profileVisible, setProfileVisible] = useState(true);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);

  // Voice
  const [autoConnect, setAutoConnect] = useState(false);
  const [selectedMic, setSelectedMic] = useState('default');

  const handleExportData = useCallback(() => {
    // Navigate to data export page
    window.location.href = '/profile/data';
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="p-4 md:p-8 max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Settings size={28} className="text-violet-400" />
          Ajustes
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Personaliza tu experiencia en QuestMaster
        </p>
      </motion.div>

      <div className="space-y-5">
        {/* Notifications */}
        <SettingsSection title="Notificaciones" icon={Bell}>
          <div className="divide-y divide-white/5">
            <Toggle
              enabled={emailNotifs}
              onChange={setEmailNotifs}
              label="Notificaciones por email"
              description="Recibe actualizaciones sobre nuevas quests y logros"
              icon={Mail}
            />
            <Toggle
              enabled={pushNotifs}
              onChange={setPushNotifs}
              label="Notificaciones push"
              description="Alertas en tiempo real en tu navegador"
              icon={Smartphone}
            />
            <Toggle
              enabled={inAppNotifs}
              onChange={setInAppNotifs}
              label="Notificaciones en la app"
              description="Avisos dentro de la plataforma"
              icon={MessageSquare}
            />
          </div>
        </SettingsSection>

        {/* Language */}
        <SettingsSection title="Idioma" icon={Globe}>
          <p className="text-xs text-slate-500 mb-3">Selecciona tu idioma preferido</p>
          <OptionSelect
            value={language}
            onChange={setLanguage}
            options={[
              { value: 'es', label: 'Espanol' },
              { value: 'en', label: 'English' },
              { value: 'fr', label: 'Francais' },
              { value: 'de', label: 'Deutsch' },
              { value: 'pt', label: 'Portugues' },
            ]}
          />
        </SettingsSection>

        {/* Theme */}
        <SettingsSection title="Tema" icon={Palette}>
          <p className="text-xs text-slate-500 mb-3">Elige la apariencia de la interfaz</p>
          <OptionSelect
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'dark', label: 'Oscuro', icon: Moon },
              { value: 'light', label: 'Claro', icon: Sun },
              { value: 'system', label: 'Sistema', icon: Monitor },
            ]}
          />
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title="Privacidad" icon={Shield}>
          <div className="divide-y divide-white/5">
            <Toggle
              enabled={profileVisible}
              onChange={setProfileVisible}
              label="Perfil publico"
              description="Otros usuarios pueden ver tu perfil y estadisticas"
              icon={profileVisible ? Eye : EyeOff}
            />
            <Toggle
              enabled={showOnLeaderboard}
              onChange={setShowOnLeaderboard}
              label="Mostrar en el ranking"
              description="Aparece en la tabla de clasificacion publica"
              icon={Trophy}
            />
          </div>
        </SettingsSection>

        {/* Voice */}
        <SettingsSection title="Configuracion de voz" icon={Mic}>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-white mb-2">Microfono</p>
              <select
                value={selectedMic}
                onChange={(e) => setSelectedMic(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="default">Microfono predeterminado</option>
                <option value="built-in">Microfono integrado</option>
                <option value="external">Microfono externo</option>
              </select>
            </div>
            <div className="border-t border-white/5 pt-3">
              <Toggle
                enabled={autoConnect}
                onChange={setAutoConnect}
                label="Auto-conectar microfono"
                description="Conectar automaticamente al entrar en una conversacion de voz"
              />
            </div>
          </div>
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Cuenta" icon={User}>
          <div className="space-y-2">
            {user && (
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                  {(user.name || user.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.name || 'Usuario'}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            )}

            <button
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all group"
              onClick={() => {}}
            >
              <div className="flex items-center gap-3">
                <KeyRound size={16} className="text-slate-500 group-hover:text-slate-300" />
                <span>Cambiar contrasena</span>
              </div>
              <ChevronRight size={14} className="text-slate-600" />
            </button>

            <button
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all group"
              onClick={handleExportData}
            >
              <div className="flex items-center gap-3">
                <Download size={16} className="text-slate-500 group-hover:text-slate-300" />
                <span>Exportar mis datos</span>
              </div>
              <ChevronRight size={14} className="text-slate-600" />
            </button>

            <div className="border-t border-white/5 mt-2 pt-2">
              <button
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all group"
                onClick={() => {}}
              >
                <div className="flex items-center gap-3">
                  <Trash2 size={16} />
                  <span>Eliminar mi cuenta</span>
                </div>
                <ChevronRight size={14} className="text-rose-500/50" />
              </button>
            </div>
          </div>
        </SettingsSection>
      </div>
    </motion.div>
  );
}
