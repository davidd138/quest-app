'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Users, Filter, Clock, Plus, Trash2 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const mockSentNotifications = [
  { id: 'sn1', title: 'Scheduled maintenance', audience: 'All users', sentAt: '2026-03-14T12:00:00Z', delivered: 8542, opened: 5231 },
  { id: 'sn2', title: 'New feature: Voice Rooms', audience: 'Active users', sentAt: '2026-03-12T09:00:00Z', delivered: 6810, opened: 4102 },
  { id: 'sn3', title: 'Spring Festival announcement', audience: 'All users', sentAt: '2026-03-10T15:00:00Z', delivered: 8320, opened: 6445 },
];

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setTitle('');
    setMessage('');
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
          <Bell className="w-8 h-8 text-violet-400" />
          Push Notifications
        </h1>
        <p className="text-slate-400 mt-1">Send notifications to users</p>
      </motion.div>

      {/* Compose form */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-white/10">
        <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-violet-400" />
          Compose Notification
        </h3>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" required className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Notification message..." rows={3} required className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              Audience
            </label>
            <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all">
              <option value="all" className="bg-navy-900">All users</option>
              <option value="active" className="bg-navy-900">Active users (last 7 days)</option>
              <option value="admins" className="bg-navy-900">Admins only</option>
            </select>
          </div>
          <button type="submit" disabled={submitting || !title || !message} className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center gap-2">
            {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            Send Notification
          </button>
        </form>
      </motion.div>

      {/* Sent history */}
      <motion.div variants={itemVariants}>
        <h3 className="font-heading font-semibold text-white mb-4">Sent History</h3>
        <div className="space-y-2">
          {mockSentNotifications.map((notif) => (
            <div key={notif.id} className="glass rounded-xl p-4 flex items-center gap-4 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm">{notif.title}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span>{notif.audience}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(notif.sentAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right text-xs">
                <p className="text-slate-300">{notif.delivered.toLocaleString()} delivered</p>
                <p className="text-emerald-400">{notif.opened.toLocaleString()} opened</p>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
