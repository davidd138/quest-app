'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Globe,
  UserPlus,
  Layers,
  Mic,
  Shield,
  Mail,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { AdminGuard } from '@/components/layout/AdminGuard';
import Switch from '@/components/ui/Switch';

// ---------- Types ----------

interface PlatformSettings {
  general: {
    platformName: string;
    platformDescription: string;
    maintenanceMode: boolean;
  };
  registration: {
    mode: 'open' | 'closed' | 'invite_only';
  };
  quests: {
    minStages: number;
    maxStages: number;
    autoPublishThreshold: number;
    requireApproval: boolean;
  };
  voice: {
    defaultModel: string;
    sessionTimeLimit: number;
    enableRecording: boolean;
  };
  security: {
    rateLimit: number;
    rateLimitWindow: number;
    wafMode: 'count' | 'block';
    enableBruteForceProtection: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    senderEmail: string;
    enableNotifications: boolean;
  };
}

// ---------- Initial State ----------

const defaultSettings: PlatformSettings = {
  general: {
    platformName: 'QuestMaster',
    platformDescription: 'Interactive adventure platform with AI-powered characters',
    maintenanceMode: false,
  },
  registration: {
    mode: 'open',
  },
  quests: {
    minStages: 2,
    maxStages: 15,
    autoPublishThreshold: 4.0,
    requireApproval: true,
  },
  voice: {
    defaultModel: 'gpt-4o-realtime',
    sessionTimeLimit: 15,
    enableRecording: true,
  },
  security: {
    rateLimit: 1000,
    rateLimitWindow: 5,
    wafMode: 'block',
    enableBruteForceProtection: true,
  },
  email: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    senderEmail: '',
    enableNotifications: false,
  },
};

// ---------- Variants ----------

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ---------- Settings Section Card ----------

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-white/15 transition-colors">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600/20 to-violet-600/20 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">{title}</h2>
          <p className="text-[10px] text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function SettingsField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <label className="text-xs font-medium text-slate-300">{label}</label>
        {hint && <p className="text-[10px] text-slate-500 mt-0.5">{hint}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
}: {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all ${className}`}
    />
  );
}

// ---------- Component ----------

function SettingsContent() {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = useCallback(
    <K extends keyof PlatformSettings>(
      section: K,
      field: keyof PlatformSettings[K],
      value: PlatformSettings[K][keyof PlatformSettings[K]],
    ) => {
      setSettings((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
      setHasChanges(true);
      setSaved(false);
    },
    [],
  );

  const handleSave = useCallback(() => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 3000);
    }, 1200);
  }, []);

  const handleReset = useCallback(() => {
    setSettings(defaultSettings);
    setHasChanges(false);
    setSaved(false);
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen pb-24"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/30 to-violet-600/30 flex items-center justify-center">
            <Settings className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-white">
              Platform Settings
            </h1>
            <p className="text-sm text-slate-400">
              Configure global platform behavior and policies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 transition-all"
            >
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 size={13} />
                Saved!
              </>
            ) : (
              <>
                <Save size={13} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Maintenance mode banner */}
      {settings.general.maintenanceMode && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-300">
            Maintenance mode is enabled. Users will see a maintenance page and cannot access the platform.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {/* General Settings */}
        <SettingsSection
          icon={Globe}
          title="General"
          description="Basic platform configuration"
        >
          <SettingsField label="Platform Name" hint="Displayed in headers and emails">
            <TextInput
              value={settings.general.platformName}
              onChange={(v) => updateSetting('general', 'platformName', v)}
              className="w-48"
            />
          </SettingsField>
          <SettingsField label="Description" hint="Short platform tagline">
            <TextInput
              value={settings.general.platformDescription}
              onChange={(v) => updateSetting('general', 'platformDescription', v)}
              className="w-72"
            />
          </SettingsField>
          <SettingsField label="Maintenance Mode" hint="Temporarily disable user access">
            <Switch
              checked={settings.general.maintenanceMode}
              onChange={(v) => updateSetting('general', 'maintenanceMode', v)}
            />
          </SettingsField>
        </SettingsSection>

        {/* Registration Settings */}
        <SettingsSection
          icon={UserPlus}
          title="Registration"
          description="Control who can sign up"
        >
          <SettingsField label="Registration Mode" hint="How new users can register">
            <select
              value={settings.registration.mode}
              onChange={(e) =>
                updateSetting('registration', 'mode', e.target.value as 'open' | 'closed' | 'invite_only')
              }
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="invite_only">Invite Only</option>
            </select>
          </SettingsField>
        </SettingsSection>

        {/* Quest Settings */}
        <SettingsSection
          icon={Layers}
          title="Quest Settings"
          description="Quest creation rules and thresholds"
        >
          <SettingsField label="Minimum Stages" hint="Minimum stages required per quest">
            <TextInput
              type="number"
              value={settings.quests.minStages}
              onChange={(v) => updateSetting('quests', 'minStages', parseInt(v) || 1)}
              className="w-20 text-center"
            />
          </SettingsField>
          <SettingsField label="Maximum Stages" hint="Maximum stages allowed per quest">
            <TextInput
              type="number"
              value={settings.quests.maxStages}
              onChange={(v) => updateSetting('quests', 'maxStages', parseInt(v) || 20)}
              className="w-20 text-center"
            />
          </SettingsField>
          <SettingsField label="Auto-Publish Rating" hint="Minimum rating for auto-publishing community quests">
            <TextInput
              type="number"
              value={settings.quests.autoPublishThreshold}
              onChange={(v) => updateSetting('quests', 'autoPublishThreshold', parseFloat(v) || 0)}
              className="w-20 text-center"
            />
          </SettingsField>
          <SettingsField label="Require Approval" hint="Manually approve community quests before publishing">
            <Switch
              checked={settings.quests.requireApproval}
              onChange={(v) => updateSetting('quests', 'requireApproval', v)}
            />
          </SettingsField>
        </SettingsSection>

        {/* Voice Settings */}
        <SettingsSection
          icon={Mic}
          title="Voice"
          description="AI voice conversation configuration"
        >
          <SettingsField label="Default Model" hint="OpenAI Realtime API model">
            <select
              value={settings.voice.defaultModel}
              onChange={(e) => updateSetting('voice', 'defaultModel', e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="gpt-4o-realtime">GPT-4o Realtime</option>
              <option value="gpt-4o-mini-realtime">GPT-4o Mini Realtime</option>
            </select>
          </SettingsField>
          <SettingsField label="Session Time Limit" hint="Max minutes per voice session">
            <div className="flex items-center gap-2">
              <TextInput
                type="number"
                value={settings.voice.sessionTimeLimit}
                onChange={(v) => updateSetting('voice', 'sessionTimeLimit', parseInt(v) || 5)}
                className="w-20 text-center"
              />
              <span className="text-xs text-slate-500">min</span>
            </div>
          </SettingsField>
          <SettingsField label="Enable Recording" hint="Save voice session recordings for analysis">
            <Switch
              checked={settings.voice.enableRecording}
              onChange={(v) => updateSetting('voice', 'enableRecording', v)}
            />
          </SettingsField>
        </SettingsSection>

        {/* Security Settings */}
        <SettingsSection
          icon={Shield}
          title="Security"
          description="Rate limiting and WAF configuration"
        >
          <SettingsField label="Rate Limit" hint="Max requests per window per IP">
            <TextInput
              type="number"
              value={settings.security.rateLimit}
              onChange={(v) => updateSetting('security', 'rateLimit', parseInt(v) || 100)}
              className="w-24 text-center"
            />
          </SettingsField>
          <SettingsField label="Rate Window" hint="Time window in minutes">
            <div className="flex items-center gap-2">
              <TextInput
                type="number"
                value={settings.security.rateLimitWindow}
                onChange={(v) => updateSetting('security', 'rateLimitWindow', parseInt(v) || 1)}
                className="w-20 text-center"
              />
              <span className="text-xs text-slate-500">min</span>
            </div>
          </SettingsField>
          <SettingsField label="WAF Mode" hint="How WAF handles blocked requests">
            <select
              value={settings.security.wafMode}
              onChange={(e) =>
                updateSetting('security', 'wafMode', e.target.value as 'count' | 'block')
              }
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="block">Block</option>
              <option value="count">Count Only</option>
            </select>
          </SettingsField>
          <SettingsField label="Brute Force Protection" hint="Block IPs after repeated failed logins">
            <Switch
              checked={settings.security.enableBruteForceProtection}
              onChange={(v) => updateSetting('security', 'enableBruteForceProtection', v)}
            />
          </SettingsField>
        </SettingsSection>

        {/* Email Settings (Placeholder) */}
        <SettingsSection
          icon={Mail}
          title="Email"
          description="SMTP and notification settings"
        >
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <p className="text-[10px] text-blue-300">
              Email delivery uses Amazon SES by default. Custom SMTP settings override the default provider.
            </p>
          </div>
          <SettingsField label="SMTP Host" hint="Custom SMTP server hostname">
            <TextInput
              value={settings.email.smtpHost}
              onChange={(v) => updateSetting('email', 'smtpHost', v)}
              placeholder="smtp.example.com"
              className="w-48"
            />
          </SettingsField>
          <SettingsField label="SMTP Port">
            <TextInput
              type="number"
              value={settings.email.smtpPort}
              onChange={(v) => updateSetting('email', 'smtpPort', parseInt(v) || 587)}
              className="w-20 text-center"
            />
          </SettingsField>
          <SettingsField label="SMTP User">
            <TextInput
              value={settings.email.smtpUser}
              onChange={(v) => updateSetting('email', 'smtpUser', v)}
              placeholder="user@example.com"
              className="w-48"
            />
          </SettingsField>
          <SettingsField label="Sender Email" hint="From address for outbound emails">
            <TextInput
              value={settings.email.senderEmail}
              onChange={(v) => updateSetting('email', 'senderEmail', v)}
              placeholder="noreply@questmaster.app"
              className="w-48"
            />
          </SettingsField>
          <SettingsField label="Enable Notifications" hint="Send email notifications for key events">
            <Switch
              checked={settings.email.enableNotifications}
              onChange={(v) => updateSetting('email', 'enableNotifications', v)}
            />
          </SettingsField>
        </SettingsSection>
      </div>
    </motion.div>
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminGuard>
      <SettingsContent />
    </AdminGuard>
  );
}
