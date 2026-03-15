'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Camera, Globe, Bell, Shield, Save } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ProfileSettingsPage() {
  const [name, setName] = useState('Explorer');
  const [bio, setBio] = useState('Adventurer and quest enthusiast');
  const [language, setLanguage] = useState('es');
  const [notifications, setNotifications] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
          <User className="w-8 h-8 text-violet-400" />
          Profile Settings
        </h1>
        <p className="text-slate-400 mt-1">Update your profile information</p>
      </motion.div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <motion.div variants={itemVariants} className="glass rounded-xl p-6 border border-white/5">
          <h3 className="font-heading font-semibold text-white mb-4">Profile Photo</h3>
          <div className="flex items-center gap-4">
            <Avatar name={name} size="xl" />
            <div>
              <button type="button" className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Change Photo
              </button>
              <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>
        </motion.div>

        {/* Basic info */}
        <motion.div variants={itemVariants} className="glass rounded-xl p-6 border border-white/5 space-y-4">
          <h3 className="font-heading font-semibold text-white">Basic Information</h3>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Display Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={160} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all resize-none" />
            <p className="text-xs text-slate-500 mt-1">{bio.length}/160</p>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div variants={itemVariants} className="glass rounded-xl p-6 border border-white/5 space-y-4">
          <h3 className="font-heading font-semibold text-white">Preferences</h3>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              Language
            </label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all">
              <option value="es" className="bg-navy-900">Spanish</option>
              <option value="en" className="bg-navy-900">English</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Push Notifications</span>
            </div>
            <button type="button" onClick={() => setNotifications(!notifications)} className={`w-11 h-6 rounded-full transition-colors relative ${notifications ? 'bg-violet-600' : 'bg-slate-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifications ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Public Profile</span>
            </div>
            <button type="button" onClick={() => setProfilePublic(!profilePublic)} className={`w-11 h-6 rounded-full transition-colors relative ${profilePublic ? 'bg-violet-600' : 'bg-slate-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${profilePublic ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </motion.div>

        {/* Save */}
        <motion.div variants={itemVariants}>
          <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 text-white font-semibold transition-all shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2">
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" />Save Changes</>}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
}
