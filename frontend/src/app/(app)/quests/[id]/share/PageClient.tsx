'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Copy, Check, Twitter, Facebook, Link2, Mail, QrCode } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const shareChannels = [
  { id: 'copy', label: 'Copy Link', icon: Link2, color: 'text-violet-400', bg: 'bg-violet-500/15' },
  { id: 'twitter', label: 'Twitter / X', icon: Twitter, color: 'text-sky-400', bg: 'bg-sky-500/15' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-400', bg: 'bg-blue-500/15' },
  { id: 'email', label: 'Email', icon: Mail, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  { id: 'qr', label: 'QR Code', icon: QrCode, color: 'text-amber-400', bg: 'bg-amber-500/15' },
];

export default function PageClient({ id }: { id: string }) {
  const questId = id;
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://questmaster.app/quests/${questId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <Link href={`/quests/${questId}`} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Quest
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="text-center">
        <Share2 className="w-12 h-12 text-violet-400 mx-auto mb-4" />
        <h1 className="font-heading text-3xl font-bold text-white mb-2">Share Quest</h1>
        <p className="text-slate-400">Invite friends to join this adventure</p>
      </motion.div>

      {/* Share link */}
      <motion.div variants={itemVariants} className="glass rounded-xl p-4 border border-white/10">
        <label className="block text-sm text-slate-400 mb-2">Share link</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 px-4 py-2.5 rounded-xl bg-navy-800/50 border border-slate-700/50 text-sm text-slate-300 focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </motion.div>

      {/* Share channels */}
      <motion.div variants={itemVariants}>
        <h3 className="text-sm font-medium text-slate-400 mb-3">Share via</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {shareChannels.map((channel) => {
            const Icon = channel.icon;
            return (
              <button
                key={channel.id}
                onClick={channel.id === 'copy' ? handleCopy : undefined}
                className="glass rounded-xl p-4 border border-white/5 hover:border-white/15 transition-all flex items-center gap-3 group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${channel.bg}`}>
                  <Icon className={`w-5 h-5 ${channel.color}`} />
                </div>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{channel.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* QR placeholder */}
      <motion.div variants={itemVariants} className="glass rounded-xl p-8 border border-white/5 text-center">
        <div className="w-40 h-40 mx-auto bg-white rounded-xl flex items-center justify-center mb-4">
          <QrCode className="w-24 h-24 text-navy-950" />
        </div>
        <p className="text-xs text-slate-500">Scan to join quest</p>
      </motion.div>
    </motion.div>
  );
}
