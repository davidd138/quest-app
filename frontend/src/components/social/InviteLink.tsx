'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  Clock,
  Link2,
  QrCode,
  ExternalLink,
  Mail,
  MessageCircle,
  Share2,
  Users,
} from 'lucide-react';

// ---------- Types ----------

interface InviteLinkProps {
  inviteUrl?: string;
  expiresIn?: string; // e.g. "24h", "7d"
  usageCount?: number;
  maxUses?: number;
  onGenerate?: () => void;
}

// ---------- QR Code SVG ----------

function MiniQRCode({ data }: { data: string }) {
  // Simple deterministic pattern based on the URL string
  const size = 21;
  const cells: boolean[][] = [];

  for (let y = 0; y < size; y++) {
    cells[y] = [];
    for (let x = 0; x < size; x++) {
      // Fixed corner patterns (finder patterns)
      const isFinderTL = x < 7 && y < 7;
      const isFinderTR = x >= size - 7 && y < 7;
      const isFinderBL = x < 7 && y >= size - 7;

      if (isFinderTL || isFinderTR || isFinderBL) {
        const fx = isFinderTR ? x - (size - 7) : x;
        const fy = isFinderBL ? y - (size - 7) : y;
        const isBorder = fx === 0 || fx === 6 || fy === 0 || fy === 6;
        const isInner = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
        cells[y][x] = isBorder || isInner;
      } else {
        // Pseudo-random fill based on data string hash
        const charCode = data.charCodeAt((x * size + y) % data.length) || 0;
        cells[y][x] = (charCode + x * 3 + y * 7) % 3 !== 0;
      }
    }
  }

  const cellSize = 4;
  const padding = 2;
  const totalSize = size * cellSize + padding * 2;

  return (
    <svg
      width={totalSize}
      height={totalSize}
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      className="rounded-lg"
    >
      <rect width={totalSize} height={totalSize} fill="white" rx="4" />
      {cells.map((row, y) =>
        row.map(
          (cell, x) =>
            cell && (
              <rect
                key={`${x}-${y}`}
                x={padding + x * cellSize}
                y={padding + y * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#1e1b4b"
                rx="0.5"
              />
            )
        )
      )}
    </svg>
  );
}

// ---------- Share buttons ----------

const shareChannels = [
  {
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'from-green-500 to-green-600',
    shadow: 'shadow-green-500/20',
    getUrl: (url: string) => `https://wa.me/?text=${encodeURIComponent(`Join my quest! ${url}`)}`,
  },
  {
    name: 'Telegram',
    icon: Share2,
    color: 'from-sky-500 to-blue-500',
    shadow: 'shadow-sky-500/20',
    getUrl: (url: string) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Join my quest!')}`,
  },
  {
    name: 'Email',
    icon: Mail,
    color: 'from-violet-500 to-indigo-500',
    shadow: 'shadow-violet-500/20',
    getUrl: (url: string) => `mailto:?subject=${encodeURIComponent('Join my Quest!')}&body=${encodeURIComponent(`Check this out: ${url}`)}`,
  },
  {
    name: 'Twitter',
    icon: ExternalLink,
    color: 'from-slate-600 to-slate-700',
    shadow: 'shadow-slate-500/20',
    getUrl: (url: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join my quest on QuestMaster! ${url}`)}`,
  },
];

// ---------- Main Component ----------

export default function InviteLink({
  inviteUrl = 'https://questmaster.app/invite/abc123xyz',
  expiresIn = '24h',
  usageCount = 3,
  maxUses = 10,
  onGenerate,
}: InviteLinkProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = inviteUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [inviteUrl]);

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-500/20">
              <Link2 className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-white text-sm">Invite Link</h3>
              <p className="text-xs text-slate-500">Share with friends to join</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGenerate}
            className="px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-300 text-xs font-medium hover:bg-violet-500/25 transition-colors"
          >
            Regenerate
          </motion.button>
        </div>
      </div>

      {/* URL display */}
      <div className="p-5 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 px-4 py-3 rounded-xl bg-navy-800/80 border border-white/5 font-mono text-sm text-slate-300 truncate">
            {inviteUrl}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleCopy}
            className={`px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-300 ${
              copied
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-violet-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40'
            }`}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Expires in {expiresIn}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {usageCount}/{maxUses} uses
          </span>
        </div>

        {/* Usage bar */}
        <div className="w-full h-1.5 rounded-full bg-navy-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(usageCount / maxUses) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          />
        </div>

        {/* QR toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowQR(!showQR)}
          className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 font-medium flex items-center justify-center gap-2 hover:bg-white/8 transition-colors"
        >
          <QrCode className="w-4 h-4" />
          {showQR ? 'Hide QR Code' : 'Show QR Code'}
        </motion.button>

        {/* QR Code */}
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center overflow-hidden"
            >
              <div className="p-4 bg-white rounded-2xl shadow-2xl">
                <MiniQRCode data={inviteUrl} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share channels */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Share via
          </p>
          <div className="grid grid-cols-4 gap-2">
            {shareChannels.map((channel, i) => {
              const Icon = channel.icon;
              return (
                <motion.a
                  key={channel.name}
                  href={channel.getUrl(inviteUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br ${channel.color} shadow-lg ${channel.shadow} hover:shadow-xl transition-shadow`}
                >
                  <Icon className="w-5 h-5 text-white" />
                  <span className="text-[10px] font-medium text-white/90">{channel.name}</span>
                </motion.a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
