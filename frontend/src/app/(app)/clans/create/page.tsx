'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Upload, Users, Palette } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const clanColors = [
  { name: 'Violet', from: 'from-violet-600', to: 'to-violet-500' },
  { name: 'Emerald', from: 'from-emerald-600', to: 'to-emerald-500' },
  { name: 'Amber', from: 'from-amber-600', to: 'to-amber-500' },
  { name: 'Rose', from: 'from-rose-600', to: 'to-rose-500' },
  { name: 'Cyan', from: 'from-cyan-600', to: 'to-cyan-500' },
  { name: 'Fuchsia', from: 'from-fuchsia-600', to: 'to-fuchsia-500' },
];

export default function CreateClanPage() {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [maxMembers, setMaxMembers] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <Link href="/clans" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Clans
        </Link>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-violet-400" />
          Create Clan
        </h1>
        <p className="text-slate-400 mt-1">Form your own adventuring party</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preview */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-white/10 text-center">
          <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${clanColors[selectedColor].from} ${clanColors[selectedColor].to} flex items-center justify-center mb-4`}>
            <Shield className="w-10 h-10 text-white" />
          </div>
          <p className="font-heading text-xl font-bold text-white">{name || 'Clan Name'}</p>
          {tag && <p className="text-xs text-slate-500 font-mono">[{tag.toUpperCase()}]</p>}
        </motion.div>

        {/* Name */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-slate-300 mb-2">Clan Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter clan name"
            maxLength={30}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
        </motion.div>

        {/* Tag */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-slate-300 mb-2">Clan Tag (2-5 characters)</label>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 5))}
            placeholder="e.g., SHDW"
            maxLength={5}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all font-mono uppercase"
          />
        </motion.div>

        {/* Description */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell adventurers about your clan..."
            rows={3}
            maxLength={200}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
          />
          <p className="text-xs text-slate-500 mt-1">{description.length}/200</p>
        </motion.div>

        {/* Color */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Clan Color
          </label>
          <div className="flex gap-3">
            {clanColors.map((color, i) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(i)}
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color.from} ${color.to} transition-all ${
                  selectedColor === i ? 'ring-2 ring-white/60 scale-110' : 'opacity-60 hover:opacity-100'
                }`}
                title={color.name}
              />
            ))}
          </div>
        </motion.div>

        {/* Max members */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Max Members
          </label>
          <select
            value={maxMembers}
            onChange={(e) => setMaxMembers(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
          >
            {[10, 20, 30, 50].map((n) => (
              <option key={n} value={n} className="bg-navy-900">{n} members</option>
            ))}
          </select>
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants}>
          <motion.button
            type="submit"
            disabled={submitting || !name || !tag}
            whileHover={!submitting ? { scale: 1.02 } : undefined}
            whileTap={!submitting ? { scale: 0.98 } : undefined}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Create Clan
              </>
            )}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}
